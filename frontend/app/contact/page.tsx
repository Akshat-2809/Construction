"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    topic: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // WhatsApp-style submission — build a pre-filled message
    const text = encodeURIComponent(
      `Hi ACE! I have an enquiry.\n\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${form.email}\n` +
      `Topic: ${form.topic}\n\n` +
      `Message:\n${form.message}`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="mb-3 inline-block rounded-full bg-hivis px-3 py-1 text-xs font-semibold text-ink">
          ACE Construction Machinery
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 max-w-xl text-lg text-neutral-600">
          Have a question about renting equipment, listing your machine, or
          anything else? We are here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        {/* ── Left: contact info ── */}
        <div className="rounded-2xl bg-mist p-7">
          <h2 className="mb-6 text-base font-semibold text-ink">
            Contact information
          </h2>

          <div className="space-y-5">
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                ),
                label: "Phone",
                value: "+91 98765 43210",
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                ),
                label: "Email",
                value: "hello@acemachinery.in",
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                ),
                label: "Office",
                value: "87, Whitefield Tech Plaza\nBangalore, Karnataka 560066",
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hivis text-ink">
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-neutral-500">{label}</p>
                  <p className="whitespace-pre-line text-sm font-semibold text-ink">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-6 border-neutral-200" />

          {/* Business hours */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Business hours
            </p>
            {[
              { day: "Monday – Friday", hours: "9:00 am – 6:00 pm" },
              { day: "Saturday", hours: "10:00 am – 4:00 pm" },
              { day: "Sunday", hours: "Closed" },
            ].map(({ day, hours }) => (
              <div key={day} className="flex justify-between py-1 text-sm">
                <span className="text-neutral-500">{day}</span>
                <span className={hours === "Closed" ? "text-neutral-400" : "font-semibold text-ink"}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-7">
          {submitted ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-ink">Message sent!</h3>
              <p className="mt-2 text-neutral-500">
                We have opened WhatsApp with your message. We will get back to you within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", topic: "", message: "" }); }}
                className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                We reply within 24 hours
              </div>

              <h2 className="mb-6 text-base font-semibold text-ink">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name">
                    <input
                      type="text" required placeholder="e.g. Rahul Sharma"
                      value={form.name} onChange={(e) => update("name", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      type="tel" required maxLength={10} inputMode="numeric" placeholder="+91 98765 43210"
                      value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Email address">
                  <input
                    type="email" placeholder="you@example.com"
                    value={form.email} onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Topic">
                  <select
                    required value={form.topic} onChange={(e) => update("topic", e.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" disabled>Select a topic</option>
                    <option>Renting a machine</option>
                    <option>Listing my machine</option>
                    <option>Pricing & rates</option>
                    <option>Technical support</option>
                    <option>Other</option>
                  </select>
                </Field>

                <Field label="Message">
                  <textarea
                    required rows={4} placeholder="Tell us what you need — machine type, location, dates, or any other details…"
                    value={form.message} onChange={(e) => update("message", e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <button
                  type="submit"
                  className="w-full rounded-full bg-hivis px-6 py-4 text-base font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 active:translate-y-0 sm:w-auto sm:px-12"
                >
                  Send message
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}