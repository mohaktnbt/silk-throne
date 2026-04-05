import type {
  ASTNode,
  Expression,
  ChoiceOption,
  BinaryOperator,
  SetOperator,
  StatChartItem,
} from './parser';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface GameState {
  variables: Record<string, string | number | boolean>;
  tempVariables: Record<string, string | number | boolean>;
  currentScene: string;
  currentNodeIndex: number;
  callStack: Array<{ scene: string; nodeIndex: number }>;
  choiceHistory: Array<{ scene: string; choice: string }>;
  achievements: Set<string>;
  sceneCache: Record<string, ASTNode[]>;
}

export interface GameOutput {
  type: 'text' | 'choice' | 'page_break' | 'ending' | 'input_text' | 'scene_change';
  text?: string;
  choices?: OutputChoice[];
  variable?: string;
  nextScene?: string;
}

export interface OutputChoice {
  index: number;
  text: string;
  enabled: boolean;
  disabledReason?: string;
}

export interface StatDisplay {
  type: 'text' | 'percent' | 'opposed_pair';
  label: string;
  value?: string | number;
  rightLabel?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type VarValue = string | number | boolean;

class EngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EngineError';
  }
}

// ---------------------------------------------------------------------------
// GameEngine
// ---------------------------------------------------------------------------

export class GameEngine {
  private state: GameState;
  private sceneList: string[];
  private textBuffer: string;
  private achievementDefs: Record<
    string,
    { visible: boolean; points: number; title: string; preDescription: string; postDescription: string }
  >;
  private pendingInputVar: string | null;
  private pendingChoiceOptions: ChoiceOption[] | null;
  private pendingFakeChoice: boolean;
  private usedChoices: Set<string>; // tracks "scene::optionText" for reuse

  // -------------------------------------------------------------------
  // Construction / lifecycle
  // -------------------------------------------------------------------

  constructor() {
    this.state = {
      variables: {},
      tempVariables: {},
      currentScene: '',
      currentNodeIndex: 0,
      callStack: [],
      choiceHistory: [],
      achievements: new Set(),
      sceneCache: {},
    };
    this.sceneList = [];
    this.textBuffer = '';
    this.achievementDefs = {};
    this.pendingInputVar = null;
    this.pendingChoiceOptions = null;
    this.pendingFakeChoice = false;
    this.usedChoices = new Set();
  }

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------

  loadScene(name: string, ast: ASTNode[]): void {
    this.state.sceneCache[name] = ast;
    // Eagerly extract metadata that lives only in startup
    if (name === 'startup') {
      this.extractStartupMeta(ast);
    }
  }

  startGame(sceneName: string): GameOutput {
    this.state.currentScene = sceneName;
    this.state.currentNodeIndex = 0;
    this.state.tempVariables = {};
    // Built-in variable
    this.state.variables['choice_randomtest'] = false;
    return this.continueExecution();
  }

  continueExecution(): GameOutput {
    const nodes = this.currentNodes();

    while (this.state.currentNodeIndex < nodes.length) {
      const node = nodes[this.state.currentNodeIndex];
      const result = this.executeNode(node);
      if (result) {
        return result;
      }
    }

    // Reached end of nodes — this is a bug in the script (no terminator)
    return this.flushText('ending');
  }

  submitChoice(choiceIndex: number): GameOutput {
    const options = this.pendingChoiceOptions;
    if (!options) {
      throw new EngineError('No pending choice to submit');
    }

    // Map from the visible-index back to the original option
    const visibleOptions = this.buildVisibleOptions(options);
    const selected = visibleOptions.find((o) => o.index === choiceIndex);
    if (!selected) {
      throw new EngineError(`Invalid choice index: ${choiceIndex}`);
    }
    if (!selected.enabled) {
      throw new EngineError(`Choice ${choiceIndex} is not selectable`);
    }

    const option = options[selected.originalIndex];

    // Track reuse
    const reuseKey = `${this.state.currentScene}::${option.text}`;
    this.usedChoices.add(reuseKey);

    // Track choice history
    this.state.choiceHistory.push({
      scene: this.state.currentScene,
      choice: option.text,
    });

    const isFake = this.pendingFakeChoice;
    const savedIndex = this.state.currentNodeIndex; // node AFTER the choice/fake_choice node

    this.pendingChoiceOptions = null;
    this.pendingFakeChoice = false;
    this.textBuffer = '';

    if (option.body.length > 0) {
      // Execute the option body inline by splicing into the current scene
      return this.executeBody(option.body, isFake ? savedIndex : undefined);
    }

    // Empty body — for fake_choice just continue, for choice this is a script error
    if (isFake) {
      return this.continueExecution();
    }
    throw new EngineError('Choice option has empty body and no goto');
  }

  submitInput(text: string): GameOutput {
    if (!this.pendingInputVar) {
      throw new EngineError('No pending input_text');
    }
    this.setVariable(this.pendingInputVar, text);
    this.pendingInputVar = null;
    this.textBuffer = '';
    return this.continueExecution();
  }

  submitPageBreak(): GameOutput {
    this.textBuffer = '';
    return this.continueExecution();
  }

  getState(): GameState {
    return structuredClone({
      ...this.state,
      achievements: this.state.achievements,
    }) as GameState;
  }

  loadState(saved: GameState): void {
    this.state = {
      ...saved,
      achievements: saved.achievements instanceof Set ? saved.achievements : new Set(saved.achievements),
      sceneCache: { ...this.state.sceneCache, ...saved.sceneCache },
    };
    this.textBuffer = '';
    this.pendingChoiceOptions = null;
    this.pendingFakeChoice = false;
    this.pendingInputVar = null;
  }

  getVariable(name: string): VarValue {
    return this.resolveVariable(name.toLowerCase());
  }

  getStatsDisplay(): StatDisplay[] {
    const startup = this.state.sceneCache['choicescript_stats'];
    if (!startup) return [];
    const displays: StatDisplay[] = [];
    for (const node of startup) {
      if (node.type === 'stat_chart') {
        for (const item of node.items) {
          displays.push(this.buildStatDisplay(item));
        }
      }
    }
    return displays;
  }

  // -------------------------------------------------------------------
  // Startup metadata extraction
  // -------------------------------------------------------------------

  private extractStartupMeta(nodes: ASTNode[]): void {
    for (const node of nodes) {
      switch (node.type) {
        case 'scene_list':
          this.sceneList = node.scenes;
          break;
        case 'achievement_def':
          this.achievementDefs[node.name] = {
            visible: node.visible,
            points: node.points,
            title: node.title,
            preDescription: node.preDescription,
            postDescription: node.postDescription,
          };
          break;
        default:
          break;
      }
    }
  }

  // -------------------------------------------------------------------
  // Node execution
  // -------------------------------------------------------------------

  /**
   * Execute a single AST node. Returns a GameOutput if the engine needs to
   * yield to the UI, otherwise returns null and the loop continues.
   */
  private executeNode(node: ASTNode): GameOutput | null {
    switch (node.type) {
      case 'text':
        this.textBuffer += this.interpolate(node.text);
        this.state.currentNodeIndex++;
        return null;

      case 'line_break':
        this.textBuffer += '\n';
        this.state.currentNodeIndex++;
        return null;

      case 'paragraph_break':
        this.textBuffer += '\n\n';
        this.state.currentNodeIndex++;
        return null;

      case 'comment':
        this.state.currentNodeIndex++;
        return null;

      case 'label':
        // Labels are just markers; skip over them
        this.state.currentNodeIndex++;
        return null;

      case 'create':
        this.state.variables[node.variable.toLowerCase()] = this.evaluateExpression(node.value);
        this.state.currentNodeIndex++;
        return null;

      case 'temp':
        this.state.tempVariables[node.variable.toLowerCase()] = this.evaluateExpression(node.value);
        this.state.currentNodeIndex++;
        return null;

      case 'set':
        this.executeSet(node.variable, node.operator, node.value);
        this.state.currentNodeIndex++;
        return null;

      case 'if':
        return this.executeIf(node);

      case 'goto':
        this.jumpToLabel(node.label, this.state.currentScene);
        return null;

      case 'goto_scene':
        return this.executeGotoScene(node.scene, node.label);

      case 'gosub':
        this.state.callStack.push({
          scene: this.state.currentScene,
          nodeIndex: this.state.currentNodeIndex + 1,
        });
        this.jumpToLabel(node.label, this.state.currentScene);
        return null;

      case 'gosub_scene':
        this.state.callStack.push({
          scene: this.state.currentScene,
          nodeIndex: this.state.currentNodeIndex + 1,
        });
        return this.executeGotoScene(node.scene, node.label);

      case 'return': {
        const frame = this.state.callStack.pop();
        if (!frame) {
          throw new EngineError('*return with empty call stack');
        }
        if (frame.scene !== this.state.currentScene) {
          this.state.currentScene = frame.scene;
          this.state.tempVariables = {};
        }
        this.state.currentNodeIndex = frame.nodeIndex;
        return null;
      }

      case 'choice':
        this.state.currentNodeIndex++;
        return this.presentChoice(node.options, false);

      case 'fake_choice':
        this.state.currentNodeIndex++;
        return this.presentChoice(node.options, true);

      case 'page_break':
        this.state.currentNodeIndex++;
        return this.flushText('page_break');

      case 'ending':
        this.state.currentNodeIndex++;
        return this.flushText('ending');

      case 'finish':
        return this.executeFinish();

      case 'input_text':
        this.pendingInputVar = node.variable.toLowerCase();
        this.state.currentNodeIndex++;
        return {
          type: 'input_text',
          text: this.consumeText(),
          variable: node.variable.toLowerCase(),
        };

      case 'print':
        this.textBuffer += String(this.evaluateExpression(node.expression));
        this.state.currentNodeIndex++;
        return null;

      case 'image':
        this.textBuffer += `[image: ${node.path}]`;
        this.state.currentNodeIndex++;
        return null;

      case 'rand':
        this.executeRand(node.variable, node.min, node.max);
        this.state.currentNodeIndex++;
        return null;

      case 'achieve':
        this.state.achievements.add(node.achievement);
        this.state.currentNodeIndex++;
        return null;

      case 'check_achievements':
        this.state.currentNodeIndex++;
        return null;

      case 'bug':
        throw new EngineError(`*bug: ${node.message}`);

      case 'redirect_scene':
        this.executeRedirect(node.scene);
        this.state.currentNodeIndex++;
        return null;

      case 'save_checkpoint':
      case 'restore_checkpoint':
        // Checkpoints are UI-layer concerns; engine just skips them
        this.state.currentNodeIndex++;
        return null;

      // Metadata nodes — already processed during loadScene for startup
      case 'title':
      case 'author':
      case 'scene_list':
      case 'achievement_def':
      case 'stat_chart':
      case 'ifid':
        this.state.currentNodeIndex++;
        return null;

      default:
        // Exhaustiveness guard: every ASTNode type must be handled above.
        // If a new type is added to the parser without updating the engine,
        // TypeScript's never check will surface it at compile time.
        return assertNever(node);
    }
  }

  // -------------------------------------------------------------------
  // Set command
  // -------------------------------------------------------------------

  private executeSet(variable: string, operator: SetOperator, valueExpr: Expression): void {
    const varName = variable.toLowerCase();
    const newRaw = this.evaluateExpression(valueExpr);

    if (operator === '') {
      // Direct assignment
      this.setVariable(varName, newRaw);
      return;
    }

    const current = this.resolveVariable(varName);

    if (operator === '&') {
      // String concatenation
      this.setVariable(varName, String(current) + String(newRaw));
      return;
    }

    const currentNum = toNumber(current);
    const newNum = toNumber(newRaw);

    switch (operator) {
      case '+':
        this.setVariable(varName, currentNum + newNum);
        break;
      case '-':
        this.setVariable(varName, currentNum - newNum);
        break;
      case '*':
        this.setVariable(varName, currentNum * newNum);
        break;
      case '/':
        if (newNum === 0) throw new EngineError('Division by zero');
        this.setVariable(varName, currentNum / newNum);
        break;
      case '%':
        if (newNum === 0) throw new EngineError('Modulo by zero');
        this.setVariable(varName, currentNum % newNum);
        break;
      case '%+':
        this.setVariable(varName, clampFairmath(currentNum + ((100 - currentNum) * newNum) / 100));
        break;
      case '%-':
        this.setVariable(varName, clampFairmath(currentNum - (currentNum * newNum) / 100));
        break;
      default:
        throw new EngineError(`Unknown set operator: ${String(operator)}`);
    }
  }

  // -------------------------------------------------------------------
  // If / elseif / else
  // -------------------------------------------------------------------

  private executeIf(node: Extract<ASTNode, { type: 'if' }>): GameOutput | null {
    // Try main condition
    if (this.evaluateCondition(node.condition)) {
      this.state.currentNodeIndex++;
      return this.executeBodyInline(node.body);
    }

    // Try elseif branches
    if (node.elseIf) {
      for (const branch of node.elseIf) {
        if (this.evaluateCondition(branch.condition)) {
          this.state.currentNodeIndex++;
          return this.executeBodyInline(branch.body);
        }
      }
    }

    // Else branch
    if (node.else) {
      this.state.currentNodeIndex++;
      return this.executeBodyInline(node.else);
    }

    // No branch matched; skip past the *if
    this.state.currentNodeIndex++;
    return null;
  }

  /**
   * Execute a nested body by splicing its nodes into the current scene at the
   * current index. This lets goto/labels inside if-bodies work correctly.
   */
  private executeBodyInline(body: ASTNode[]): GameOutput | null {
    const nodes = this.currentNodes();
    const insertAt = this.state.currentNodeIndex;

    // Splice the body into the scene node list
    nodes.splice(insertAt, 0, ...body);

    // Continue normal execution — the main loop will pick up the spliced nodes
    return null;
  }

  // -------------------------------------------------------------------
  // Choice presentation
  // -------------------------------------------------------------------

  private presentChoice(options: ChoiceOption[], isFake: boolean): GameOutput {
    this.pendingChoiceOptions = options;
    this.pendingFakeChoice = isFake;

    const visible = this.buildVisibleOptions(options);

    if (visible.length === 0) {
      throw new EngineError('All choice options are hidden by conditions');
    }

    return {
      type: 'choice',
      text: this.consumeText(),
      choices: visible.map(({ index, text, enabled, disabledReason }) => ({
        index,
        text,
        enabled,
        disabledReason,
      })),
    };
  }

  private buildVisibleOptions(
    options: ChoiceOption[],
  ): Array<{ index: number; originalIndex: number; text: string; enabled: boolean; disabledReason?: string }> {
    const result: Array<{
      index: number;
      originalIndex: number;
      text: string;
      enabled: boolean;
      disabledReason?: string;
    }> = [];
    let visibleIdx = 0;

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];

      // *if condition — hide entirely when false
      if (opt.condition && !this.evaluateCondition(opt.condition)) {
        continue;
      }

      // Reuse tracking
      const reuseKey = `${this.state.currentScene}::${opt.text}`;
      const alreadyUsed = this.usedChoices.has(reuseKey);

      if (alreadyUsed && opt.reuse === 'hide_reuse') {
        continue;
      }

      const interpolatedText = this.interpolate(opt.text);
      let enabled = true;
      let disabledReason: string | undefined;

      // *selectable_if
      if (opt.selectableIf && !this.evaluateCondition(opt.selectableIf)) {
        enabled = false;
        disabledReason = 'Requirements not met';
      }

      // disable_reuse
      if (alreadyUsed && opt.reuse === 'disable_reuse') {
        enabled = false;
        disabledReason = 'Already selected';
      }

      result.push({
        index: visibleIdx,
        originalIndex: i,
        text: interpolatedText,
        enabled,
        disabledReason,
      });
      visibleIdx++;
    }

    return result;
  }

  // -------------------------------------------------------------------
  // Body execution (for choice option bodies)
  // -------------------------------------------------------------------

  /**
   * Execute a standalone body (like a choice option body). If resumeIndex is
   * provided (fake_choice), execution resumes at that index after the body
   * completes. Otherwise the body MUST contain a flow-control terminator.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private executeBody(body: ASTNode[], _resumeIndex?: number): GameOutput {
    // Splice the body into the current scene's AST at the current index.
    // For fake_choice the body runs and then execution falls through to the
    // nodes that follow the choice block. For real choices the body must
    // contain its own flow-control terminator (goto/finish/ending).
    const nodes = this.currentNodes();
    nodes.splice(this.state.currentNodeIndex, 0, ...body);

    return this.continueExecution();
  }

  // -------------------------------------------------------------------
  // Flow control
  // -------------------------------------------------------------------

  private jumpToLabel(label: string, scene: string): void {
    const nodes = this.state.sceneCache[scene];
    if (!nodes) {
      throw new EngineError(`Scene not loaded: ${scene}`);
    }
    const targetLabel = label.toLowerCase();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.type === 'label' && n.name.toLowerCase() === targetLabel) {
        if (scene !== this.state.currentScene) {
          this.state.currentScene = scene;
          this.state.tempVariables = {};
        }
        this.state.currentNodeIndex = i;
        return;
      }
    }
    throw new EngineError(`Label not found: ${label} in scene ${scene}`);
  }

  private executeGotoScene(scene: string, label?: string): GameOutput {
    if (!this.state.sceneCache[scene]) {
      throw new EngineError(`Scene not loaded: ${scene}`);
    }

    // Flush any accumulated text as a scene_change output
    const text = this.consumeText();

    this.state.currentScene = scene;
    this.state.tempVariables = {};

    if (label) {
      this.jumpToLabel(label, scene);
    } else {
      this.state.currentNodeIndex = 0;
    }

    if (text) {
      return { type: 'scene_change', text, nextScene: scene };
    }

    return this.continueExecution();
  }

  private executeFinish(): GameOutput {
    const currentIdx = this.sceneList.indexOf(this.state.currentScene);
    if (currentIdx === -1 || currentIdx >= this.sceneList.length - 1) {
      // No next scene — treat as ending
      this.state.currentNodeIndex++;
      return this.flushText('ending');
    }

    const nextScene = this.sceneList[currentIdx + 1];
    if (!this.state.sceneCache[nextScene]) {
      throw new EngineError(`Next scene not loaded: ${nextScene}`);
    }

    const text = this.consumeText();
    this.state.currentScene = nextScene;
    this.state.currentNodeIndex = 0;
    this.state.tempVariables = {};

    if (text) {
      return { type: 'scene_change', text, nextScene };
    }

    return this.continueExecution();
  }

  private executeRedirect(scene: string): void {
    const idx = this.sceneList.indexOf(this.state.currentScene);
    if (idx !== -1) {
      this.sceneList[idx] = scene;
    }
  }

  // -------------------------------------------------------------------
  // Rand
  // -------------------------------------------------------------------

  private executeRand(variable: string, minExpr: Expression, maxExpr: Expression): void {
    const min = Math.ceil(toNumber(this.evaluateExpression(minExpr)));
    const max = Math.floor(toNumber(this.evaluateExpression(maxExpr)));
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    this.setVariable(variable.toLowerCase(), result);
  }

  // -------------------------------------------------------------------
  // Variable resolution
  // -------------------------------------------------------------------

  private resolveVariable(name: string): VarValue {
    const lower = name.toLowerCase();

    // Temp variables shadow globals
    if (lower in this.state.tempVariables) {
      return this.state.tempVariables[lower];
    }
    if (lower in this.state.variables) {
      return this.state.variables[lower];
    }

    throw new EngineError(`Variable not found: ${name}`);
  }

  private setVariable(name: string, value: VarValue): void {
    const lower = name.toLowerCase();

    if (lower in this.state.tempVariables) {
      this.state.tempVariables[lower] = value;
    } else if (lower in this.state.variables) {
      this.state.variables[lower] = value;
    } else {
      // Fallback: create as global (robustness for *create outside startup)
      this.state.variables[lower] = value;
    }
  }

  // -------------------------------------------------------------------
  // Expression evaluation
  // -------------------------------------------------------------------

  evaluateExpression(expr: Expression): VarValue {
    switch (expr.type) {
      case 'literal':
        return expr.value;

      case 'variable':
        return this.resolveVariable(expr.name);

      case 'parenthesized':
        return this.evaluateExpression(expr.expression);

      case 'unary': {
        const operand = this.evaluateExpression(expr.operand);
        return !toBool(operand);
      }

      case 'binary':
        return this.evaluateBinary(expr.operator, expr.left, expr.right);

      default:
        return assertNever(expr);
    }
  }

  private evaluateBinary(operator: BinaryOperator, leftExpr: Expression, rightExpr: Expression): VarValue {
    const left = this.evaluateExpression(leftExpr);
    const right = this.evaluateExpression(rightExpr);

    switch (operator) {
      // Arithmetic
      case '+':
        return toNumber(left) + toNumber(right);
      case '-':
        return toNumber(left) - toNumber(right);
      case '*':
        return toNumber(left) * toNumber(right);
      case '/': {
        const divisor = toNumber(right);
        if (divisor === 0) throw new EngineError('Division by zero');
        return toNumber(left) / divisor;
      }
      case '%': {
        const mod = toNumber(right);
        if (mod === 0) throw new EngineError('Modulo by zero');
        return toNumber(left) % mod;
      }

      // Fairmath (in expression context)
      case '%+': {
        const stat = toNumber(left);
        return clampFairmath(stat + ((100 - stat) * toNumber(right)) / 100);
      }
      case '%-': {
        const stat = toNumber(left);
        return clampFairmath(stat - (stat * toNumber(right)) / 100);
      }

      // String concat
      case '&':
        return String(left) + String(right);

      // Comparison
      case '=':
        return compareEqual(left, right);
      case '!=':
        return !compareEqual(left, right);
      case '<':
        return toNumber(left) < toNumber(right);
      case '>':
        return toNumber(left) > toNumber(right);
      case '<=':
        return toNumber(left) <= toNumber(right);
      case '>=':
        return toNumber(left) >= toNumber(right);

      // Boolean
      case 'and':
        return toBool(left) && toBool(right);
      case 'or':
        return toBool(left) || toBool(right);

      default:
        throw new EngineError(`Unknown binary operator: ${String(operator)}`);
    }
  }

  private evaluateCondition(expr: Expression): boolean {
    return toBool(this.evaluateExpression(expr));
  }

  // -------------------------------------------------------------------
  // Text interpolation
  // -------------------------------------------------------------------

  private interpolate(text: string): string {
    let result = text;

    // 1) Multireplace: @{varOrExpr option0|option1|...}
    result = result.replace(/@\{([^}]+)\}/g, (_match, inner: string) => {
      return this.evaluateMultireplace(inner.trim());
    });

    // 2) Variable interpolation: ${expression}
    result = result.replace(/\$\{([^}]+)\}/g, (_match, inner: string) => {
      return this.evaluateInlineExpression(inner.trim());
    });

    // 3) Typographic em-dashes: convert -- to —
    result = result.replace(/--/g, '\u2014');

    return result;
  }

  private evaluateMultireplace(inner: string): string {
    // Format: "varName option0|option1|option2"
    // The first token is the variable/expression, the rest (split by |) are options
    const firstSpace = inner.indexOf(' ');
    if (firstSpace === -1) {
      // No options — just return the variable value
      return String(this.resolveVariable(inner));
    }

    const varPart = inner.substring(0, firstSpace).trim();
    const optionsPart = inner.substring(firstSpace + 1).trim();
    const options = optionsPart.split('|').map((o) => o.trim());

    let value: VarValue;
    try {
      value = this.resolveVariable(varPart);
    } catch {
      // Might be a complex expression; fall back to treating the whole thing as text
      return inner;
    }

    if (typeof value === 'number') {
      const idx = Math.floor(value);
      if (idx >= 0 && idx < options.length) {
        return this.interpolate(options[idx]);
      }
      return this.interpolate(options[options.length - 1]);
    }

    if (typeof value === 'boolean') {
      // false = 0, true = 1
      const idx = value ? 1 : 0;
      if (idx < options.length) {
        return this.interpolate(options[idx]);
      }
      return this.interpolate(options[options.length - 1]);
    }

    // String value — do a case-insensitive match against options
    const lower = String(value).toLowerCase();
    for (const opt of options) {
      if (opt.toLowerCase() === lower) {
        return this.interpolate(opt);
      }
    }
    // Fallback: first option
    return options.length > 0 ? this.interpolate(options[0]) : String(value);
  }

  private evaluateInlineExpression(expr: string): string {
    // Simple case: just a variable name
    try {
      const value = this.resolveVariable(expr);
      return formatValue(value);
    } catch {
      // Not a simple variable — try to evaluate as an arithmetic expression
      try {
        const parsed = this.parseInlineExpression(expr);
        const value = this.evaluateExpression(parsed);
        return formatValue(value);
      } catch {
        return `\${${expr}}`;
      }
    }
  }

  /**
   * Minimal inline expression parser for ${expr} contexts.
   * Handles: variable, number, variable op variable/number
   */
  private parseInlineExpression(expr: string): Expression {
    const tokens = tokenizeInlineExpr(expr);
    return this.parseTokens(tokens, 0).expression;
  }

  private parseTokens(
    tokens: string[],
    pos: number,
  ): { expression: Expression; nextPos: number } {
    let { expression: left, nextPos } = this.parsePrimary(tokens, pos);

    while (nextPos < tokens.length) {
      const opToken = tokens[nextPos];
      const op = parseOperator(opToken);
      if (!op) break;
      nextPos++;
      const { expression: right, nextPos: afterRight } = this.parsePrimary(tokens, nextPos);
      left = { type: 'binary', operator: op, left, right };
      nextPos = afterRight;
    }

    return { expression: left, nextPos };
  }

  private parsePrimary(
    tokens: string[],
    pos: number,
  ): { expression: Expression; nextPos: number } {
    const token = tokens[pos];
    if (token === undefined) {
      throw new EngineError('Unexpected end of inline expression');
    }

    if (token === '(') {
      const inner = this.parseTokens(tokens, pos + 1);
      if (tokens[inner.nextPos] !== ')') {
        throw new EngineError('Missing closing parenthesis');
      }
      return {
        expression: { type: 'parenthesized', expression: inner.expression },
        nextPos: inner.nextPos + 1,
      };
    }

    if (token === 'not') {
      const operand = this.parsePrimary(tokens, pos + 1);
      return {
        expression: { type: 'unary', operator: 'not', operand: operand.expression },
        nextPos: operand.nextPos,
      };
    }

    // Number literal
    const num = Number(token);
    if (!isNaN(num) && token !== 'true' && token !== 'false') {
      return { expression: { type: 'literal', value: num }, nextPos: pos + 1 };
    }

    // Boolean literal
    if (token === 'true') {
      return { expression: { type: 'literal', value: true }, nextPos: pos + 1 };
    }
    if (token === 'false') {
      return { expression: { type: 'literal', value: false }, nextPos: pos + 1 };
    }

    // String literal
    if (token.startsWith('"') && token.endsWith('"')) {
      return {
        expression: { type: 'literal', value: token.slice(1, -1) },
        nextPos: pos + 1,
      };
    }

    // Variable reference
    return { expression: { type: 'variable', name: token }, nextPos: pos + 1 };
  }

  // -------------------------------------------------------------------
  // Text buffer helpers
  // -------------------------------------------------------------------

  private consumeText(): string {
    const text = this.textBuffer.trim();
    this.textBuffer = '';
    return text;
  }

  private flushText(outputType: 'page_break' | 'ending'): GameOutput {
    return {
      type: outputType,
      text: this.consumeText(),
    };
  }

  // -------------------------------------------------------------------
  // Scene helpers
  // -------------------------------------------------------------------

  private currentNodes(): ASTNode[] {
    const nodes = this.state.sceneCache[this.state.currentScene];
    if (!nodes) {
      throw new EngineError(`Scene not loaded: ${this.state.currentScene}`);
    }
    return nodes;
  }

  // -------------------------------------------------------------------
  // Stat display
  // -------------------------------------------------------------------

  private buildStatDisplay(item: StatChartItem): StatDisplay {
    switch (item.type) {
      case 'text':
        return {
          type: 'text',
          label: item.label,
          value: String(this.safeResolveVariable(item.variable)),
        };
      case 'percent':
        return {
          type: 'percent',
          label: item.label,
          value: toNumber(this.safeResolveVariable(item.variable)),
        };
      case 'opposed_pair':
        return {
          type: 'opposed_pair',
          label: item.leftLabel,
          value: toNumber(this.safeResolveVariable(item.variable)),
          rightLabel: item.rightLabel,
        };
      default:
        return assertNever(item);
    }
  }

  private safeResolveVariable(name: string): VarValue {
    try {
      return this.resolveVariable(name.toLowerCase());
    } catch {
      return '';
    }
  }
}

// ---------------------------------------------------------------------------
// Pure utility functions
// ---------------------------------------------------------------------------

function toNumber(value: VarValue): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function toBool(value: VarValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

function compareEqual(a: VarValue, b: VarValue): boolean {
  // String comparison is case-insensitive per ChoiceScript spec
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase() === b.toLowerCase();
  }
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).toLowerCase() === String(b).toLowerCase();
  }
  // Numeric / boolean comparison
  return a === b;
}

function clampFairmath(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function formatValue(value: VarValue): string {
  if (typeof value === 'number') {
    // Display integers without decimals, floats with up to 2 places
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

/**
 * Tokenize a simple inline expression like "gold * 2" or "name & \" the Bold\""
 */
function tokenizeInlineExpr(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < expr.length) {
    // Skip whitespace
    if (expr[i] === ' ' || expr[i] === '\t') {
      i++;
      continue;
    }

    // Parentheses
    if (expr[i] === '(' || expr[i] === ')') {
      tokens.push(expr[i]);
      i++;
      continue;
    }

    // Multi-char operators
    if (expr[i] === '%' && i + 1 < expr.length && (expr[i + 1] === '+' || expr[i + 1] === '-')) {
      tokens.push(expr[i] + expr[i + 1]);
      i += 2;
      continue;
    }
    if (expr[i] === '!' && i + 1 < expr.length && expr[i + 1] === '=') {
      tokens.push('!=');
      i += 2;
      continue;
    }
    if (expr[i] === '<' && i + 1 < expr.length && expr[i + 1] === '=') {
      tokens.push('<=');
      i += 2;
      continue;
    }
    if (expr[i] === '>' && i + 1 < expr.length && expr[i + 1] === '=') {
      tokens.push('>=');
      i += 2;
      continue;
    }

    // Single-char operators
    if ('+-*/%&=<>'.includes(expr[i])) {
      tokens.push(expr[i]);
      i++;
      continue;
    }

    // String literal
    if (expr[i] === '"') {
      let str = '"';
      i++;
      while (i < expr.length && expr[i] !== '"') {
        str += expr[i];
        i++;
      }
      str += '"';
      if (i < expr.length) i++; // skip closing quote
      tokens.push(str);
      continue;
    }

    // Number or identifier
    let word = '';
    while (i < expr.length && expr[i] !== ' ' && expr[i] !== '\t' && !'+-*/%&=<>()!'.includes(expr[i])) {
      word += expr[i];
      i++;
    }
    if (word) {
      tokens.push(word);
    }
  }

  return tokens;
}

function parseOperator(token: string): BinaryOperator | null {
  const ops: Record<string, BinaryOperator> = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '%': '%',
    '%+': '%+',
    '%-': '%-',
    '&': '&',
    '=': '=',
    '!=': '!=',
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    'and': 'and',
    'or': 'or',
  };
  return ops[token.toLowerCase()] ?? null;
}

function assertNever(value: never): never {
  throw new EngineError(`Unexpected value: ${JSON.stringify(value)}`);
}
