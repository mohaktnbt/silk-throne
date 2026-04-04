import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - The Silk Throne",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        Privacy <span className="text-gold">Policy</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: January 1, 2025
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Introduction
          </h2>
          <p className="mt-2">
            The Silk Throne (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)
            respects your privacy. This Privacy Policy explains how we collect,
            use, and protect your personal information when you use our website
            and game (&quot;Service&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Information We Collect
          </h2>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-medium text-foreground">Account Information</h3>
              <p>
                When you create an account, we collect your email address and an
                encrypted password. We do not store passwords in plain text.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Payment Information</h3>
              <p>
                Payment processing is handled by Razorpay. We store transaction
                identifiers (order ID, payment ID) and purchase amounts but do
                not store your credit card or bank details. Razorpay&apos;s
                privacy policy governs their handling of payment data.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Game Data</h3>
              <p>
                We store your game save data, including your current scene,
                in-game variables, and choice history, to enable you to resume
                your game across sessions and devices.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Usage Data</h3>
              <p>
                We may collect anonymized usage analytics such as pages visited,
                time spent, and browser type to improve the Service. This data
                is not linked to your identity.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. How We Use Your Information
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>To provide, maintain, and improve the Service</li>
            <li>To process purchases and manage your access to game content</li>
            <li>To sync your game progress across devices</li>
            <li>To communicate important updates about the Service</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Data Storage and Security
          </h2>
          <p className="mt-2">
            Your data is stored securely using Supabase, which provides
            encryption at rest and in transit. We use row-level security
            policies to ensure users can only access their own data. While we
            take reasonable measures to protect your information, no method of
            transmission or storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Data Sharing
          </h2>
          <p className="mt-2">
            We do not sell your personal information. We share data only with:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Razorpay</strong> — for payment processing (transaction
              data only)
            </li>
            <li>
              <strong>Supabase</strong> — for database and authentication
              services
            </li>
            <li>
              <strong>Law enforcement</strong> — if required by law or to
              protect our rights
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Cookies
          </h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management.
            These are necessary for the Service to function. We do not use
            third-party advertising cookies. You can control cookies through
            your browser settings, but disabling them may affect Service
            functionality.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Your Rights
          </h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Export your game save data</li>
            <li>Withdraw consent for optional data processing</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Data Retention
          </h2>
          <p className="mt-2">
            We retain your account and game data for as long as your account is
            active. If you request account deletion, we will remove your
            personal data within 30 days. Anonymized usage data may be retained
            indefinitely for analytics purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Children&apos;s Privacy
          </h2>
          <p className="mt-2">
            The Service is not intended for children under 13. We do not
            knowingly collect personal information from children. If we learn
            we have collected data from a child under 13, we will delete it
            promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to This Policy
          </h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify
            users of material changes by posting the updated policy on this page
            with a new &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            11. Contact Us
          </h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy or wish to exercise
            your data rights, please contact us at{" "}
            <span className="text-gold">privacy@thesilkthrone.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
