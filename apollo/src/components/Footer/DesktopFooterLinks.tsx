"use client";
import Image from "next/image";

interface Feather {
  src: string;
  width: number;
  height: number;
}

interface FooterLink {
  label: string;
  href: string;
  feather: Feather;
}

interface Props {
  links: FooterLink[];
}

export default function DesktopFooterLinks({ links }: Props) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-[var(--color-text-primary)] text-2xl max-md:text-sm transition-colors duration-300 hover:text-[var(--color-text-secondary)]"
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
