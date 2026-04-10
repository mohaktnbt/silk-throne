import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - The Silk Throne",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        Terms of <span className="text-gold">Service</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: April 10, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing or using The Silk Throne website and game
            (&quot;Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p className="mt-2">
            The Silk Throne is an interactive fiction game accessible via web
            browser. The Service includes a free preview of select chapters and
            a paid full game experience. We reserve the right to modify, suspend,
            or discontinue any part of the Service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. User Accounts
          </h2>
          <p className="mt-2">
            To access certain features (saving progress, purchasing the full
            game), you must create an account. You are responsible for
            maintaining the confidentiality of your account credentials and for
            all activities that occur under your account. You agree to provide
            accurate and complete information when creating your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Purchases and Payments
          </h2>
          <p className="mt-2">
            Payments for the full game are processed through Razorpay. All prices
            are listed in Indian Rupees (INR) and include applicable taxes.
            Purchases are for a single user license and grant permanent access
            to the full game content. Prices are subject to change, but changes
            will not affect existing purchases.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Refund Policy
          </h2>
          <p className="mt-2">
            Since the Service offers a free preview before purchase, refunds are
            generally not provided. If you experience a technical issue that
            prevents you from accessing purchased content, please contact us
            within 7 days of purchase and we will work to resolve the issue or
            provide a refund at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Intellectual Property
          </h2>
          <p className="mt-2">
            All content within The Silk Throne, including but not limited to
            text, story, characters, game mechanics, and visual design, is the
            intellectual property of The Silk Throne and its creators. You may
            not reproduce, distribute, modify, or create derivative works from
            any content without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. User Conduct
          </h2>
          <p className="mt-2">
            You agree not to: attempt to circumvent payment requirements or
            access controls; reverse-engineer, decompile, or extract the game
            source files; share your account credentials or purchased content
            with others; use the Service for any unlawful purpose; or attempt
            to disrupt the Service or its infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Limitation of Liability
          </h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any
            kind. We shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of the Service. Our
            total liability shall not exceed the amount you paid for the Service
            in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Governing Law
          </h2>
          <p className="mt-2">
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of the courts in India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these Terms from time to time. We will notify users of
            material changes by posting the updated Terms on this page with a
            new &quot;Last updated&quot; date. Continued use of the Service
            after changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            11. Contact Us
          </h2>
          <p className="mt-2">
            If you have questions about these Terms, please contact us at{" "}
            <span className="text-gold">support@thesilkthrone.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
