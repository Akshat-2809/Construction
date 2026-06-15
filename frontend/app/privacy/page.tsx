"use client";

import Link from "next/link";

const sections = [
  {
    title: "1. Introduction",
    content: `Myequipo Machinery ("Myequipo", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use the Myequipo platform.

  By using Myequipo, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Platform.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect the following types of information:

- Phone number — collected during registration and used to verify your identity via OTP. This is the only personally identifiable information required to create an account.

- Name — provided voluntarily during registration to personalise your experience and display on listings.

- Machine listing data — category, company, model, location, rate, availability, and description entered when listing a machine.

- Usage data — pages visited, actions taken, and time spent on the Platform. This is collected anonymously and used to improve the product.

- Device information — browser type, operating system, and IP address, collected automatically for security and analytics purposes.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use the information we collect to:

- Verify your identity via OTP during login and registration.
- Display your name and contact number on machine listings you create.
- Allow contractors to contact you directly regarding your listed machines.
- Improve the Platform based on usage patterns and feedback.
- Detect and prevent fraudulent or abusive activity.
- Send important service updates or account-related notifications (via SMS, if required).

We do not use your data for advertising, profiling, or any purpose not listed above.`,
  },
  {
    title: "4. How Your Phone Number Is Displayed",
    content: `Your verified phone number is displayed on your machine listings so that contractors can contact you directly. It is visible only to users who are logged in to Myequipo.

Your phone number is never displayed publicly on search engines, shared with third-party advertisers, or sold to any external party.`,
  },
  {
    title: "5. Data Sharing",
    content: `We do not sell, rent, or trade your personal information. We may share your data only in the following limited circumstances:

- Service providers — we may share data with trusted third-party services (such as Firebase for OTP verification and MongoDB for data storage) solely to operate the Platform.

- Legal obligations — we may disclose your information if required to do so by law, court order, or government authority.

- Business transfer — in the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. You will be notified in advance.

All third-party services we use are bound by their own privacy policies and are not permitted to use your data for their own purposes.`,
  },
  {
    title: "6. OTP Verification and Firebase",
    content: `Myequipo uses Google Firebase for phone number verification. When you enter your phone number and request an OTP, that number is sent to Firebase to deliver the SMS. Firebase's use of your data is governed by Google's Privacy Policy.

We do not store OTPs on our servers. Once your phone number is verified, only the number itself is stored in our database — not any Firebase tokens or credentials.`,
  },
  {
    title: "7. Data Storage and Security",
    content: `Your data is stored securely in MongoDB databases. We implement industry-standard security measures including:

- HTTPS encryption for all data in transit.
- HTTP-only cookies for session management, preventing client-side access.
- JWT-based authentication with a 30-day expiry.
- No plain-text storage of sensitive information.

While we take every reasonable precaution, no system is 100% secure. We encourage you to report any suspected security issues to us immediately.`,
  },
  {
    title: "8. Cookies and Sessions",
    content: `Myequipo uses a single HTTP-only cookie ("myequipo_token") to maintain your login session. This cookie:

- Is set only after successful OTP verification.
- Expires after 30 days of inactivity.
- Is not accessible by JavaScript (HTTP-only), protecting against XSS attacks.
- Is not used for tracking or advertising.

We do not use third-party tracking cookies or analytics cookies that follow you across websites.`,
  },
  {
    title: "9. Your Rights",
    content: `You have the following rights regarding your personal data:

- Access — you can view the information associated with your account at any time.
- Correction — you can update your name or listing details from your account settings.
- Deletion — you can delete your listings at any time from My Listings. To request full account deletion, contact us via the Help Center.
- Portability — you may request a copy of your data by contacting us.

We will respond to all data requests within 7 business days.`,
  },
  {
    title: "10. Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide our services. If you request account deletion:

- Your personal information (name, phone number) will be permanently removed within 7 days.
- Machine listings associated with your account will be removed.
- Anonymised usage data may be retained for analytics purposes.`,
  },
  {
    title: "11. Children's Privacy",
    content: `Myequipo is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account on our Platform, please contact us and we will delete the account promptly.`,
  },
  {
    title: "12. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we do, we will update the "Last updated" date at the top of this page.

We encourage you to review this policy periodically. Continued use of the Platform after changes are posted constitutes acceptance of the updated policy.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

  - Through our Help Center at myequipo.com/help
  - Via our Contact page at myequipo.com/contact

  We take privacy seriously and will respond to all enquiries within 7 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="border-b border-neutral-100 bg-mist px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600">
          <span className="flex h-2 w-2 rounded-full bg-hivis" />
          Legal
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-neutral-500">
          We believe in being transparent about how we collect and use your data. This policy explains everything clearly, in plain language.
        </p>
        <p className="mt-3 text-sm text-neutral-400">
          Last updated: June 2026
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">

        {/* Summary cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">No ads, ever</p>
            <p className="mt-1 text-xs text-neutral-500">We never sell your data or show you ads</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">Secure storage</p>
            <p className="mt-1 text-xs text-neutral-500">HTTPS + HTTP-only cookies protect your session</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">You&apos;re in control</p>
            <p className="mt-1 text-xs text-neutral-500">Request data deletion anytime</p>
          </div>
        </div>

        {/* Quick nav */}
        <div className="mb-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <p className="mb-4 text-sm font-semibold text-ink">Quick navigation</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {sections.map((s, i) => (
              <Link
                key={i}
                href={`#section-${i}`}
                className="text-sm text-neutral-500 transition-colors hover:text-ink"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i} id={`section-${i}`} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-ink">{s.title}</h2>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-neutral-100" />

        {/* Footer CTA */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-mist px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="font-semibold text-ink">Questions about your data?</p>
            <p className="mt-1 text-sm text-neutral-500">
              Contact us and we will respond within 7 business days.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/help"
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Help center
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-hivis px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-hivis-dark"
            >
              Contact us
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Also see our{" "}
          <Link href="/terms" className="font-semibold text-ink hover:underline">
            Terms of Service
          </Link>
        </p>

      </div>
    </div>
  );
}