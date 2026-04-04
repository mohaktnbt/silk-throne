// ============================================================================
// ChoiceScript Parser
//
// Parses .txt scene files into a typed AST. Handles indentation-based nesting,
// all standard commands, expression parsing (including fairmath), and choice
// blocks with #-prefixed options.
//
// Usage:
//   import { parseScene } from '@/lib/choicescript/parser';
//   const ast = parseScene(sceneSource);
// ============================================================================

// ---------------------------------------------------------------------------
// Expression types
// ---------------------------------------------------------------------------

export type BinaryOperator =
  | '+' | '-' | '*' | '/' | '%'
  | '%+' | '%-'
  | '&'
  | '=' | '!=' | '<' | '>' | '<=' | '>='
  | 'and' | 'or';

export type Expression =
  | { type: 'literal'; value: string | number | boolean }
  | { type: 'variable'; name: string }
  | { type: 'binary'; operator: BinaryOperator; left: Expression; right: Expression }
  | { type: 'unary'; operator: 'not'; operand: Expression }
  | { type: 'parenthesized'; expression: Expression };

// ---------------------------------------------------------------------------
// AST Node types — discriminated union on `type`
// ---------------------------------------------------------------------------

export interface ChoiceOption {
  text: string;
  condition?: Expression;         // *if condition to show/hide
  selectableIf?: Expression;      // *selectable_if condition
  reuse?: 'hide_reuse' | 'disable_reuse' | 'allow_reuse';
  body: ASTNode[];
}

export type SetOperator = '' | '+' | '-' | '*' | '/' | '%' | '%+' | '%-' | '&';

export type StatChartItem =
  | { type: 'text'; variable: string; label: string }
  | { type: 'percent'; variable: string; label: string }
  | { type: 'opposed_pair'; variable: string; leftLabel: string; rightLabel: string };

export type ASTNode =
  | { type: 'text'; text: string }
  | { type: 'comment'; text: string }
  | { type: 'label'; name: string }
  | { type: 'goto'; label: string }
  | { type: 'goto_scene'; scene: string; label?: string }
  | { type: 'gosub'; label: string }
  | { type: 'gosub_scene'; scene: string; label?: string }
  | { type: 'return' }
  | { type: 'finish'; text?: string }
  | { type: 'ending' }
  | { type: 'page_break' }
  | { type: 'line_break' }
  | { type: 'choice'; options: ChoiceOption[] }
  | { type: 'fake_choice'; options: ChoiceOption[] }
  | { type: 'create'; variable: string; value: Expression }
  | { type: 'temp'; variable: string; value: Expression }
  | { type: 'set'; variable: string; operator: SetOperator; value: Expression }
  | { type: 'if'; condition: Expression; body: ASTNode[]; elseIf?: Array<{ condition: Expression; body: ASTNode[] }>; else?: ASTNode[] }
  | { type: 'input_text'; variable: string }
  | { type: 'print'; expression: Expression }
  | { type: 'image'; path: string }
  | { type: 'rand'; variable: string; min: Expression; max: Expression }
  | { type: 'achieve'; achievement: string }
  | { type: 'check_achievements' }
  | { type: 'title'; text: string }
  | { type: 'author'; text: string }
  | { type: 'scene_list'; scenes: string[] }
  | { type: 'achievement_def'; name: string; visible: boolean; points: number; title: string; preDescription: string; postDescription: string }
  | { type: 'stat_chart'; items: StatChartItem[] }
  | { type: 'bug'; message: string }
  | { type: 'save_checkpoint' }
  | { type: 'restore_checkpoint' }
  | { type: 'redirect_scene'; scene: string }
  | { type: 'ifid'; uuid: string };

// ---------------------------------------------------------------------------
// Internal line representation
// ---------------------------------------------------------------------------

interface ParsedLine {
  /** Original 0-based line number in the source. */
  lineNo: number;
  /** Number of leading spaces (tabs expanded to 4 spaces). */
  indent: number;
  /** Trimmed line content. */
  content: string;
}

// ---------------------------------------------------------------------------
// Expression parser (recursive-descent)
// ---------------------------------------------------------------------------

class ExpressionParser {
  private readonly src: string;
  private pos: number;

  constructor(src: string) {
    this.src = src;
    this.pos = 0;
  }

  /** Parse the full expression and return it. */
  parse(): Expression {
    const expr = this.parseOr();
    this.skipWs();
    return expr;
  }

  /** The position in the source after parsing finished. */
  get consumed(): number {
    return this.pos;
  }

  // -- precedence layers (lowest to highest) --

  private parseOr(): Expression {
    let left = this.parseAnd();
    while (this.matchWord('or')) {
      const right = this.parseAnd();
      left = { type: 'binary', operator: 'or', left, right };
    }
    return left;
  }

  private parseAnd(): Expression {
    let left = this.parseNot();
    while (this.matchWord('and')) {
      const right = this.parseNot();
      left = { type: 'binary', operator: 'and', left, right };
    }
    return left;
  }

  private parseNot(): Expression {
    this.skipWs();
    if (this.matchWord('not')) {
      const operand = this.parseNot();
      return { type: 'unary', operator: 'not', operand };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let left = this.parseConcat();
    const op = this.matchComparisonOp();
    if (op !== null) {
      const right = this.parseConcat();
      left = { type: 'binary', operator: op, left, right };
    }
    return left;
  }

  private parseConcat(): Expression {
    let left = this.parseAddSub();
    for (;;) {
      this.skipWs();
      if (this.peek() === '&') {
        this.pos++;
        const right = this.parseAddSub();
        left = { type: 'binary', operator: '&', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseAddSub(): Expression {
    let left = this.parseMulDivMod();
    for (;;) {
      this.skipWs();
      const ch = this.peek();
      if (ch === '+' && !this.lookingAtFairmath()) {
        this.pos++;
        const right = this.parseMulDivMod();
        left = { type: 'binary', operator: '+', left, right };
      } else if (ch === '-' && !this.lookingAtFairmath()) {
        this.pos++;
        const right = this.parseMulDivMod();
        left = { type: 'binary', operator: '-', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseMulDivMod(): Expression {
    let left = this.parseFairmath();
    for (;;) {
      this.skipWs();
      const ch = this.peek();
      if (ch === '*') {
        this.pos++;
        const right = this.parseFairmath();
        left = { type: 'binary', operator: '*', left, right };
      } else if (ch === '/') {
        this.pos++;
        const right = this.parseFairmath();
        left = { type: 'binary', operator: '/', left, right };
      } else if (ch === '%' && this.src[this.pos + 1] !== '+' && this.src[this.pos + 1] !== '-') {
        this.pos++;
        const right = this.parseFairmath();
        left = { type: 'binary', operator: '%', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseFairmath(): Expression {
    let left = this.parsePrimary();
    for (;;) {
      this.skipWs();
      if (this.src.startsWith('%+', this.pos)) {
        this.pos += 2;
        const right = this.parsePrimary();
        left = { type: 'binary', operator: '%+', left, right };
      } else if (this.src.startsWith('%-', this.pos)) {
        this.pos += 2;
        const right = this.parsePrimary();
        left = { type: 'binary', operator: '%-', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parsePrimary(): Expression {
    this.skipWs();
    const ch = this.peek();

    // Parenthesized expression
    if (ch === '(') {
      this.pos++;
      const inner = this.parseOr();
      this.skipWs();
      if (this.peek() === ')') this.pos++;
      return { type: 'parenthesized', expression: inner };
    }

    // String literal
    if (ch === '"') {
      return this.readStringLiteral();
    }

    // Numeric literal (including negative numbers at start of expression)
    if (this.isDigit(ch) || (ch === '-' && this.isDigit(this.src[this.pos + 1]))) {
      return this.readNumberLiteral();
    }

    // Word: boolean literal or variable name
    const word = this.readWord();
    if (word === '') {
      return { type: 'literal', value: '' };
    }
    const lower = word.toLowerCase();
    if (lower === 'true') return { type: 'literal', value: true };
    if (lower === 'false') return { type: 'literal', value: false };
    return { type: 'variable', name: word };
  }

  // -- helpers --

  private readStringLiteral(): Expression {
    this.pos++; // skip opening "
    let value = '';
    while (this.pos < this.src.length && this.src[this.pos] !== '"') {
      value += this.src[this.pos];
      this.pos++;
    }
    if (this.pos < this.src.length) this.pos++; // skip closing "
    return { type: 'literal', value };
  }

  private readNumberLiteral(): Expression {
    let s = '';
    if (this.peek() === '-') {
      s += '-';
      this.pos++;
    }
    while (this.pos < this.src.length && (this.isDigit(this.src[this.pos]) || this.src[this.pos] === '.')) {
      s += this.src[this.pos];
      this.pos++;
    }
    return { type: 'literal', value: Number(s) };
  }

  private matchComparisonOp(): BinaryOperator | null {
    this.skipWs();
    for (const op of ['!=', '<=', '>=', '=', '<', '>'] as const) {
      if (this.src.startsWith(op, this.pos)) {
        this.pos += op.length;
        return op;
      }
    }
    return null;
  }

  private matchWord(keyword: string): boolean {
    this.skipWs();
    if (
      this.src.startsWith(keyword, this.pos) &&
      (this.pos + keyword.length >= this.src.length ||
        !this.isWordChar(this.src[this.pos + keyword.length]))
    ) {
      this.pos += keyword.length;
      return true;
    }
    return false;
  }

  private readWord(): string {
    this.skipWs();
    let w = '';
    while (this.pos < this.src.length && this.isWordChar(this.src[this.pos])) {
      w += this.src[this.pos];
      this.pos++;
    }
    return w;
  }

  private lookingAtFairmath(): boolean {
    // Check if this is actually %+ or %- (called when we see + or -)
    // The caller already checked we are at + or -, so check if % is before.
    return false;
  }

  private skipWs(): void {
    while (this.pos < this.src.length && (this.src[this.pos] === ' ' || this.src[this.pos] === '\t')) {
      this.pos++;
    }
  }

  private peek(): string {
    return this.pos < this.src.length ? this.src[this.pos] : '';
  }

  private isDigit(c: string | undefined): boolean {
    return c !== undefined && c >= '0' && c <= '9';
  }

  private isWordChar(c: string): boolean {
    return /[a-zA-Z0-9_]/.test(c);
  }
}

/** Parse an expression string into an Expression tree. */
export function parseExpression(src: string): Expression {
  return new ExpressionParser(src.trim()).parse();
}

// ---------------------------------------------------------------------------
// Line preprocessing
// ---------------------------------------------------------------------------

function preprocessLines(source: string): ParsedLine[] {
  const rawLines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result: ParsedLine[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const expanded = rawLines[i].replace(/\t/g, '    ');
    const content = expanded.trimStart();
    const indent = expanded.length - content.length;
    result.push({ lineNo: i, indent, content });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Scene parser
// ---------------------------------------------------------------------------

class SceneParser {
  private readonly lines: ParsedLine[];
  private cursor: number;

  constructor(lines: ParsedLine[]) {
    this.lines = lines;
    this.cursor = 0;
  }

  /** Parse all lines at the top level. */
  parseAll(): ASTNode[] {
    return this.parseBlock(-1);
  }

  /**
   * Parse a block of consecutive lines whose indent is strictly greater than
   * `parentIndent`. Returns when a line at or below `parentIndent` is found.
   */
  private parseBlock(parentIndent: number): ASTNode[] {
    const nodes: ASTNode[] = [];
    while (this.cursor < this.lines.length) {
      const line = this.currentLine();

      // Blank lines — skip (they are paragraph-level whitespace in ChoiceScript).
      if (line.content === '') {
        this.cursor++;
        continue;
      }

      // If indent has returned to or past the parent level, this block is done.
      if (line.indent <= parentIndent) {
        break;
      }

      const result = this.parseLine();
      if (result !== null) {
        nodes.push(result);
      }
    }
    return nodes;
  }

  /** Parse the current line (and any children) into an AST node. */
  private parseLine(): ASTNode | null {
    const line = this.currentLine();
    const { content } = line;

    if (content.startsWith('*')) {
      return this.parseCommand(line);
    }

    // Plain text line (may contain ${...} and @{...} — kept as-is).
    this.cursor++;
    return { type: 'text', text: content };
  }

  // -----------------------------------------------------------------------
  // Command dispatch
  // -----------------------------------------------------------------------

  private parseCommand(line: ParsedLine): ASTNode | null {
    const content = line.content;
    const spaceIdx = content.indexOf(' ');
    const command = spaceIdx === -1 ? content : content.slice(0, spaceIdx);
    const args = spaceIdx === -1 ? '' : content.slice(spaceIdx + 1).trim();

    switch (command) {
      // -- Header commands --
      case '*title':
        this.cursor++;
        return { type: 'title', text: args };

      case '*author':
        this.cursor++;
        return { type: 'author', text: args };

      case '*ifid':
        this.cursor++;
        return { type: 'ifid', uuid: args };

      case '*scene_list':
        return this.parseSceneList(line);

      // -- Variable commands --
      case '*create':
        this.cursor++;
        return this.parseCreateTemp('create', args);

      case '*temp':
        this.cursor++;
        return this.parseCreateTemp('temp', args);

      case '*set':
        this.cursor++;
        return this.parseSet(args);

      // -- Conditionals --
      case '*if':
        return this.parseIf(line);

      case '*elseif':
      case '*else':
        // Out-of-context (should be consumed by parseIf) — skip.
        this.cursor++;
        return null;

      // -- Choices --
      case '*choice':
        return this.parseChoice(line, 'choice');

      case '*fake_choice':
        return this.parseChoice(line, 'fake_choice');

      // -- Flow control --
      case '*goto':
        this.cursor++;
        return { type: 'goto', label: args };

      case '*goto_scene': {
        this.cursor++;
        const parts = splitFirst(args, ' ');
        const node: ASTNode = { type: 'goto_scene', scene: parts[0] };
        if (parts[1] !== undefined) {
          (node as { type: 'goto_scene'; scene: string; label?: string }).label = parts[1];
        }
        return node;
      }

      case '*gosub':
        this.cursor++;
        return { type: 'gosub', label: args };

      case '*gosub_scene': {
        this.cursor++;
        const parts = splitFirst(args, ' ');
        const node: ASTNode = { type: 'gosub_scene', scene: parts[0] };
        if (parts[1] !== undefined) {
          (node as { type: 'gosub_scene'; scene: string; label?: string }).label = parts[1];
        }
        return node;
      }

      case '*return':
        this.cursor++;
        return { type: 'return' };

      case '*label':
        this.cursor++;
        return { type: 'label', name: args };

      case '*finish':
        this.cursor++;
        if (args) return { type: 'finish', text: args };
        return { type: 'finish' };

      case '*ending':
        this.cursor++;
        return { type: 'ending' };

      case '*page_break':
        this.cursor++;
        return { type: 'page_break' };

      case '*line_break':
        this.cursor++;
        return { type: 'line_break' };

      // -- Input / randomness --
      case '*input_text':
        this.cursor++;
        return { type: 'input_text', variable: args };

      case '*rand': {
        this.cursor++;
        const tokens = args.split(/\s+/);
        return {
          type: 'rand',
          variable: tokens[0] ?? '',
          min: parseExpression(tokens[1] ?? '0'),
          max: parseExpression(tokens[2] ?? '0'),
        };
      }

      case '*print':
        this.cursor++;
        return { type: 'print', expression: parseExpression(args) };

      // -- Achievements --
      case '*achieve':
        this.cursor++;
        return { type: 'achieve', achievement: args };

      case '*check_achievements':
        this.cursor++;
        return { type: 'check_achievements' };

      case '*achievement':
        return this.parseAchievementDef(line, args);

      // -- Display --
      case '*comment':
        this.cursor++;
        return { type: 'comment', text: args };

      case '*image':
        this.cursor++;
        return { type: 'image', path: args };

      // -- Stat chart --
      case '*stat_chart':
        return this.parseStatChart(line);

      // -- Misc --
      case '*bug':
        this.cursor++;
        return { type: 'bug', message: args };

      case '*save_checkpoint':
        this.cursor++;
        return { type: 'save_checkpoint' };

      case '*restore_checkpoint':
        this.cursor++;
        return { type: 'restore_checkpoint' };

      case '*redirect_scene':
        this.cursor++;
        return { type: 'redirect_scene', scene: args };

      default:
        // Unknown command — emit as text so nothing is silently lost.
        this.cursor++;
        return { type: 'text', text: content };
    }
  }

  // -----------------------------------------------------------------------
  // *scene_list
  // -----------------------------------------------------------------------

  private parseSceneList(line: ParsedLine): ASTNode {
    const parentIndent = line.indent;
    this.cursor++;
    const scenes: string[] = [];
    while (this.cursor < this.lines.length) {
      const child = this.currentLine();
      if (child.content === '') { this.cursor++; continue; }
      if (child.indent <= parentIndent) break;
      scenes.push(child.content);
      this.cursor++;
    }
    return { type: 'scene_list', scenes };
  }

  // -----------------------------------------------------------------------
  // *create / *temp
  // -----------------------------------------------------------------------

  private parseCreateTemp(kind: 'create' | 'temp', args: string): ASTNode {
    const idx = args.indexOf(' ');
    if (idx === -1) {
      // Variable declared without a value — default to empty string.
      const value: Expression = { type: 'literal', value: '' };
      return { type: kind, variable: args, value };
    }
    const variable = args.slice(0, idx);
    const rawValue = args.slice(idx + 1).trim();
    return { type: kind, variable, value: parseExpression(rawValue) };
  }

  // -----------------------------------------------------------------------
  // *set
  // -----------------------------------------------------------------------

  private parseSet(args: string): ASTNode {
    const varMatch = args.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*/);
    if (!varMatch) {
      return { type: 'set', variable: '', operator: '', value: { type: 'literal', value: '' } };
    }
    const variable = varMatch[1];
    let rest = args.slice(varMatch[0].length);

    // Detect operator
    let operator: SetOperator = '';
    const opPatterns: Array<[SetOperator, RegExp]> = [
      ['%+', /^%\+\s*/],
      ['%-', /^%-\s*/],
      ['+', /^\+\s*/],
      ['-', /^-\s*/],
      ['*', /^\*\s*/],
      ['/', /^\/\s*/],
      ['%', /^%\s*/],
      ['&', /^&\s*/],
    ];
    for (const [op, pattern] of opPatterns) {
      const m = rest.match(pattern);
      if (m) {
        operator = op;
        rest = rest.slice(m[0].length);
        break;
      }
    }

    const value = parseExpression(rest);
    return { type: 'set', variable, operator, value };
  }

  // -----------------------------------------------------------------------
  // *if / *elseif / *else
  // -----------------------------------------------------------------------

  private parseIf(startLine: ParsedLine): ASTNode {
    // Parse the initial *if branch
    const condition = extractCondition(startLine.content, '*if');
    this.cursor++;
    const body = this.parseBlock(startLine.indent);

    const elseIfBranches: Array<{ condition: Expression; body: ASTNode[] }> = [];
    let elseBranch: ASTNode[] | undefined;

    // Collect subsequent *elseif and *else at the same indent level
    while (this.cursor < this.lines.length) {
      const next = this.currentLine();

      // Skip blank lines between branches
      if (next.content === '') {
        const peek = this.peekNonBlank();
        if (
          peek !== null &&
          peek.indent === startLine.indent &&
          (peek.content.startsWith('*elseif') || peek.content.startsWith('*else'))
        ) {
          this.cursor++;
          continue;
        }
        break;
      }

      if (next.indent !== startLine.indent) break;

      if (next.content.startsWith('*elseif')) {
        const cond = extractCondition(next.content, '*elseif');
        this.cursor++;
        const branchBody = this.parseBlock(next.indent);
        elseIfBranches.push({ condition: cond, body: branchBody });
      } else if (next.content.startsWith('*else')) {
        this.cursor++;
        elseBranch = this.parseBlock(next.indent);
        break;
      } else {
        break;
      }
    }

    const node: ASTNode = { type: 'if', condition, body };
    if (elseIfBranches.length > 0) {
      (node as Extract<ASTNode, { type: 'if' }>).elseIf = elseIfBranches;
    }
    if (elseBranch !== undefined) {
      (node as Extract<ASTNode, { type: 'if' }>).else = elseBranch;
    }
    return node;
  }

  // -----------------------------------------------------------------------
  // *choice / *fake_choice
  // -----------------------------------------------------------------------

  private parseChoice(
    startLine: ParsedLine,
    choiceType: 'choice' | 'fake_choice',
  ): ASTNode {
    this.cursor++;
    const parentIndent = startLine.indent;
    const options: ChoiceOption[] = [];

    while (this.cursor < this.lines.length) {
      const line = this.currentLine();

      if (line.content === '') { this.cursor++; continue; }
      if (line.indent <= parentIndent) break;

      const optIndent = line.indent;

      if (line.content.startsWith('#')) {
        // Plain option
        const text = line.content.slice(1).trim();
        this.cursor++;
        const body = this.parseBlock(optIndent);
        options.push({ text, body });
      } else if (
        line.content.startsWith('*hide_reuse') ||
        line.content.startsWith('*disable_reuse') ||
        line.content.startsWith('*allow_reuse')
      ) {
        const opt = this.parseReuseOption(line, optIndent);
        if (opt) options.push(opt);
      } else if (line.content.startsWith('*selectable_if')) {
        const opt = this.parseSelectableOption(line, optIndent);
        if (opt) options.push(opt);
      } else if (line.content.startsWith('*if')) {
        const opt = this.parseConditionalOption(line, optIndent);
        if (opt) options.push(opt);
      } else {
        // Unexpected line inside choice block — skip.
        this.cursor++;
      }
    }

    return { type: choiceType, options };
  }

  /**
   * Parse a choice option prefixed with *hide_reuse, *disable_reuse, or
   * *allow_reuse. The # may follow on the same line or the next.
   */
  private parseReuseOption(line: ParsedLine, optIndent: number): ChoiceOption | null {
    let reuseKind: ChoiceOption['reuse'];
    let rest: string;
    if (line.content.startsWith('*hide_reuse')) {
      reuseKind = 'hide_reuse';
      rest = line.content.slice('*hide_reuse'.length).trim();
    } else if (line.content.startsWith('*disable_reuse')) {
      reuseKind = 'disable_reuse';
      rest = line.content.slice('*disable_reuse'.length).trim();
    } else {
      reuseKind = 'allow_reuse';
      rest = line.content.slice('*allow_reuse'.length).trim();
    }

    // May be followed by *selectable_if on the same line
    let selectableIf: Expression | undefined;
    if (rest.startsWith('*selectable_if')) {
      const extracted = extractSelectableIf(rest);
      selectableIf = extracted.condition;
      rest = extracted.rest;
    }

    if (rest.startsWith('#')) {
      const text = rest.slice(1).trim();
      this.cursor++;
      const body = this.parseBlock(optIndent);
      return { text, reuse: reuseKind, selectableIf, body };
    }

    // # on the next indented line
    this.cursor++;
    if (this.cursor < this.lines.length) {
      const next = this.currentLine();
      if (next.content.startsWith('#') && next.indent > optIndent) {
        const text = next.content.slice(1).trim();
        const hashIndent = next.indent;
        this.cursor++;
        const body = this.parseBlock(hashIndent);
        return { text, reuse: reuseKind, selectableIf, body };
      }
    }
    return null;
  }

  /**
   * Parse a *selectable_if option. The # may follow on the same line or next.
   */
  private parseSelectableOption(line: ParsedLine, optIndent: number): ChoiceOption | null {
    const extracted = extractSelectableIf(line.content);
    const selectableIf = extracted.condition;
    const rest = extracted.rest;

    if (rest.startsWith('#')) {
      const text = rest.slice(1).trim();
      this.cursor++;
      const body = this.parseBlock(optIndent);
      return { text, selectableIf, body };
    }

    // # on the next indented line
    this.cursor++;
    if (this.cursor < this.lines.length) {
      const next = this.currentLine();
      if (next.content.startsWith('#') && next.indent > optIndent) {
        const text = next.content.slice(1).trim();
        const hashIndent = next.indent;
        this.cursor++;
        const body = this.parseBlock(hashIndent);
        return { text, selectableIf, body };
      }
    }
    return null;
  }

  /**
   * Parse a *if-guarded option inside a choice block.
   * Pattern:
   *   *if (condition)
   *     #Option text
   *       body
   */
  private parseConditionalOption(line: ParsedLine, optIndent: number): ChoiceOption | null {
    const condition = extractCondition(line.content, '*if');
    this.cursor++;

    // Look for the # line at deeper indent
    while (this.cursor < this.lines.length) {
      const next = this.currentLine();
      if (next.content === '') { this.cursor++; continue; }
      if (next.indent <= optIndent) break;

      if (next.content.startsWith('#')) {
        const text = next.content.slice(1).trim();
        const hashIndent = next.indent;
        this.cursor++;
        const body = this.parseBlock(hashIndent);
        return { text, condition, body };
      }
      break;
    }
    return null;
  }

  // -----------------------------------------------------------------------
  // *achievement
  // -----------------------------------------------------------------------

  private parseAchievementDef(line: ParsedLine, args: string): ASTNode {
    this.cursor++;

    // *achievement name visible|hidden points Title text...
    const m = args.match(/^(\S+)\s+(visible|hidden)\s+(\d+)\s+(.+)$/);
    let name = '';
    let visible = true;
    let points = 0;
    let title = '';
    if (m) {
      name = m[1];
      visible = m[2] === 'visible';
      points = Number(m[3]);
      title = m[4];
    }

    // Next two indented lines are pre- and post-description.
    const parentIndent = line.indent;
    let preDescription = '';
    let postDescription = '';
    if (this.cursor < this.lines.length && this.currentLine().indent > parentIndent) {
      preDescription = this.currentLine().content;
      this.cursor++;
    }
    if (this.cursor < this.lines.length && this.currentLine().indent > parentIndent) {
      postDescription = this.currentLine().content;
      this.cursor++;
    }

    return {
      type: 'achievement_def',
      name,
      visible,
      points,
      title,
      preDescription,
      postDescription,
    };
  }

  // -----------------------------------------------------------------------
  // *stat_chart
  // -----------------------------------------------------------------------

  private parseStatChart(line: ParsedLine): ASTNode {
    this.cursor++;
    const parentIndent = line.indent;
    const items: StatChartItem[] = [];

    while (this.cursor < this.lines.length) {
      const child = this.currentLine();
      if (child.content === '') { this.cursor++; continue; }
      if (child.indent <= parentIndent) break;

      if (child.content.startsWith('text ')) {
        const parts = child.content.slice(5).trim().split(/\s+/, 2);
        items.push({ type: 'text', variable: parts[0], label: parts[1] ?? parts[0] });
        this.cursor++;
      } else if (child.content.startsWith('percent ')) {
        const parts = child.content.slice(8).trim().split(/\s+/, 2);
        items.push({ type: 'percent', variable: parts[0], label: parts[1] ?? parts[0] });
        this.cursor++;
      } else if (child.content.startsWith('opposed_pair ')) {
        const variable = child.content.slice(13).trim();
        const pairIndent = child.indent;
        this.cursor++;

        // Next two indented lines are the left and right labels.
        let leftLabel = '';
        let rightLabel = '';
        if (this.cursor < this.lines.length && this.currentLine().indent > pairIndent) {
          leftLabel = this.currentLine().content;
          this.cursor++;
        }
        if (this.cursor < this.lines.length && this.currentLine().indent > pairIndent) {
          rightLabel = this.currentLine().content;
          this.cursor++;
        }
        items.push({ type: 'opposed_pair', variable, leftLabel, rightLabel });
      } else if (child.content.startsWith('*if')) {
        // Conditional stat item — skip for simplicity (the items inside are
        // stat chart items that only display if the condition is true).
        // We consume the block so we don't misparse it.
        const ifIndent = child.indent;
        this.cursor++;
        this.consumeBlock(ifIndent);
      } else {
        this.cursor++;
      }
    }

    return { type: 'stat_chart', items };
  }

  // -----------------------------------------------------------------------
  // Utility
  // -----------------------------------------------------------------------

  private currentLine(): ParsedLine {
    return this.lines[this.cursor];
  }

  /** Peek at the next non-blank line without advancing the cursor. */
  private peekNonBlank(): ParsedLine | null {
    let i = this.cursor;
    while (i < this.lines.length) {
      if (this.lines[i].content !== '') return this.lines[i];
      i++;
    }
    return null;
  }

  /** Consume all lines indented deeper than `parentIndent`. */
  private consumeBlock(parentIndent: number): void {
    while (this.cursor < this.lines.length) {
      const line = this.currentLine();
      if (line.content === '') { this.cursor++; continue; }
      if (line.indent <= parentIndent) break;
      this.cursor++;
    }
  }
}

// ---------------------------------------------------------------------------
// Standalone helpers
// ---------------------------------------------------------------------------

/** Extract the condition expression from a *if / *elseif line. */
function extractCondition(content: string, keyword: string): Expression {
  const rest = content.slice(keyword.length).trim();
  return parseExpression(rest);
}

/** Extract condition + remaining text from a *selectable_if fragment. */
function extractSelectableIf(content: string): { condition: Expression; rest: string } {
  const keyword = '*selectable_if';
  const start = content.indexOf(keyword);
  const rest = content.slice(start + keyword.length).trim();

  if (rest.startsWith('(')) {
    // Find the matching closing paren.
    let depth = 0;
    let i = 0;
    for (; i < rest.length; i++) {
      if (rest[i] === '(') depth++;
      if (rest[i] === ')') {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
    const condStr = rest.slice(0, i);
    const remaining = rest.slice(i).trim();
    return { condition: parseExpression(condStr), rest: remaining };
  }

  // No parens — next word is a bare variable condition.
  const wordMatch = rest.match(/^(\S+)\s*/);
  if (wordMatch) {
    return {
      condition: parseExpression(wordMatch[1]),
      rest: rest.slice(wordMatch[0].length),
    };
  }

  return { condition: { type: 'literal', value: true }, rest };
}

/** Split a string on the first occurrence of `sep`, returning [before, after]. */
function splitFirst(s: string, sep: string): [string, string | undefined] {
  const idx = s.indexOf(sep);
  if (idx === -1) return [s, undefined];
  return [s.slice(0, idx), s.slice(idx + sep.length).trim()];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a ChoiceScript `.txt` scene source into an AST.
 *
 * The returned array contains one node per top-level statement or text
 * paragraph. Choice blocks, if-blocks, and other nested structures are
 * represented as subtrees within their respective node types.
 *
 * String interpolation markers `${...}` and `@{...}` are preserved as-is
 * inside TextNode.text — the runtime engine evaluates them during display.
 */
export function parseScene(source: string): ASTNode[] {
  const lines = preprocessLines(source);
  const parser = new SceneParser(lines);
  return parser.parseAll();
}
