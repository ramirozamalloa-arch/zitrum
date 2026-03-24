import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#27272A] bg-[#0A0A0B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-xl font-bold text-[#D4A853] tracking-tight hover:opacity-90 transition-opacity"
          >
            ZITRUM
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="bg-[#27272A] my-6" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#52525B]">
          {/* Legal disclaimer */}
          <p className="max-w-xl">
            ZITRUM does not provide financial advice. All investments carry risk.
            Investment opportunities displayed are sourced from third-party platforms.
            Always conduct your own due diligence before investing.
          </p>

          {/* Copyright */}
          <p className="shrink-0">
            &copy; {new Date().getFullYear()} ZITRUM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
