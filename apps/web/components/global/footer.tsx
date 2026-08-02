import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex min-h-10 h-auto flex-col items-center gap-1 bg-black px-4 py-2 text-[11px] text-white/70 sm:flex-row sm:justify-between md:h-10 md:px-6 md:py-0 md:text-xs">
      <span className="text-center sm:text-left">© All Rights Reserved</span>
      <Link
        href="/terms"
        className="transition-colors hover:text-white"
      >
        Terms & Conditions
      </Link>
    </footer>
  );
}
