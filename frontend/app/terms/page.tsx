"use client";

import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Myequipo ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including contractors, machine owners, and visitors.`,
  },
  {
    title: "2. Description of Service",
    content: `Myequipo is an online marketplace that connects contractors with machine owners for the purpose of renting construction equipment. Myequipo does not own, operate, or control any machinery listed on the Platform. We act solely as a facilitator between parties.`,
  },
  {
    title: "3. User Accounts",
    content: `To access certain features of the Platform, you must register with a valid Indian phone number. You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You must provide accurate information during registration. Myequipo reserves the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "4. Listing Machines",
    content: `Machine owners may list their equipment on Myequipo free of charge. By listing a machine, you confirm that:
  - You are the legal owner or authorised representative of the machine.
  - All information provided (category, model, location, rate, availability) is accurate and up to date.
  - You will keep your listing updated and remove it when the machine is no longer available for rent.
  - Myequipo reserves the right to remove any listing that is inaccurate, misleading, or in violation of these terms.`,
  },
  {
    title: "5. Renting Machines",
    content: `Contractors using Myequipo to find machinery agree that:
  - All rental agreements are made directly between the contractor and the machine owner. Myequipo is not a party to any such agreement.
  - Myequipo does not guarantee the availability, condition, or suitability of any machine listed on the Platform.
  - Any disputes regarding rental terms, payment, or machine condition must be resolved directly between the parties involved.`,
  },
  {
    title: "6. Fees and Payments",
    content: `Myequipo does not charge any listing fees or commissions. All pricing is set by machine owners independently. Any financial transactions, deposits, or payments are made directly between contractors and machine owners. Myequipo is not responsible for any financial disputes or losses arising from such transactions.`,
  },
  {
    title: "7. Prohibited Conduct",
    content: `Users of Myequipo must not:
- Post false, misleading, or fraudulent listings.
- Use the Platform for any unlawful purpose.
- Harass, threaten, or deceive other users.
- Attempt to circumvent or manipulate the Platform's functionality.
- Share another user's personal information without consent.
- Use automated tools to scrape or collect data from the Platform.
Violation of these rules may result in immediate account termination.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on Myequipo — including the name, logo, design, and software — is the property of Myequipo Machinery and is protected under applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Platform without prior written permission.`,
  },
  {
    title: "9. Disclaimer of Warranties",
    content: `The Platform is provided on an "as is" and "as available" basis. Myequipo makes no warranties, express or implied, regarding the reliability, accuracy, or fitness for a particular purpose of any content or service on the Platform. We do not guarantee uninterrupted or error-free access to the Platform.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the fullest extent permitted by law, Myequipo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of revenue, loss of data, or disputes between users. Myequipo's total liability in any matter shall not exceed the amount you have paid to use the Platform (which in most cases is zero, as the Platform is free).`,
  },
  {
    title: "11. Privacy",
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using Myequipo, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    title: "12. Modifications to Terms",
    content: `Myequipo reserves the right to update or modify these Terms of Service at any time. Changes will be effective immediately upon posting to the Platform. Continued use of the Platform after any changes constitutes your acceptance of the revised terms. We recommend reviewing these terms periodically.`,
  },
  {
    title: "13. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts located in Indore, Madhya Pradesh, India.`,
  },
  {
    title: "14. Contact",
    content: `If you have any questions about these Terms of Service, please contact us through the Help Center or visit our Contact page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="border-b border-neutral-100 bg-mist px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600">
          <span className="flex h-2 w-2 rounded-full bg-hivis" />
          Legal
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-neutral-500">
          Please read these terms carefully before using Myequipo. By using our platform, you agree to be bound by these terms.
        </p>
        <p className="mt-3 text-sm text-neutral-400">
          Last updated: June 2026
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">

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

        {/* Footer links */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-mist px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="font-semibold text-ink">Have questions about these terms?</p>
            <p className="mt-1 text-sm text-neutral-500">
              Our Help Center has answers, or you can contact us directly.
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

        {/* Also see */}
        <p className="mt-6 text-center text-sm text-neutral-400">
          Also see our{" "}
          <Link href="/privacy" className="font-semibold text-ink hover:underline">
            Privacy Policy
          </Link>
        </p>

      </div>
    </div>
  );
}