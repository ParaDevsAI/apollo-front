"use client";
import Image from "next/image";

interface Feather {
  src: string;
  width: number;
  height: number;
}

interface NavLink {
  label: string;
  href: string;
  feather: Feather;
}

interface Props {
  links: NavLink[];
}

export default function DesktopNavLinks({ links }: Props) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="group relative text-[var(--color-text-primary)] text-[16px] transition-colors duration-300 hover:text-[var(--color-text-primary)]"
        >
          {link.label}
          <span className="absolute left-0 -bottom-5 h-[20px] w-full overflow-hidden pointer-events-none">
            <Image
              src={link.feather.src}
              alt={`${link.label} feather underline`}
              width={link.feather.width}
              height={link.feather.height}
              className="transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-in-out"
            />
          </span>
        </a>
      ))}
    </>
  );
}
