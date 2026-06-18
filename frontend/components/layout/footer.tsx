import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Marketplace: [
    { label: "Browse machines", href: "/machinery" },
    { label: "List your machine", href: "/machinery/register" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Post a request", href: "/machinery/request" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help center", href: "/help" },
    { label: "Terms of service", href: "/terms" },
    { label: "Privacy policy", href: "/privacy" },
  ],
};

const socials = [
  {
    label: "Twitter",
    href: "#",
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="text-neutral-300 transition-colors duration-200" style={{ backgroundColor: "var(--footer-bg, #1A1A1A)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/circle.webp"
                alt="Myequipo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-semibold tracking-tight text-white">
                Myequipo
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              The marketplace connecting contractors with the machinery they
              need — find, compare, and contact owners directly.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors hover:bg-hivis hover:text-ink dark:bg-neutral-700 dark:hover:bg-hivis"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    {s.icon}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-sm text-neutral-400 transition-colors hover:text-hivis"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-9 border-t border-neutral-800 pt-6 dark:border-neutral-700">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Myequipo Machinery. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500">
              Made for builders, in India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}