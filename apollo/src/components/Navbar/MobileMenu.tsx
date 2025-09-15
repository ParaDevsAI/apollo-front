"use client";

import Image from "next/image";
import { X } from "lucide-react";
import BaseButton from "@/components/Ui/Button";
import logo from "@/assets/images/navbar/logo.svg";
import { Dispatch, SetStateAction } from "react";

interface NavLink {
  label: string;
  href: string;
}

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  navLinks: NavLink[];
}

export default function MobileMenu({
  isOpen,
  setIsOpen,
  navLinks,
}: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

              <div
                className={`md:hidden fixed top-0 left-0 right-0 w-full
                  bg-[var(--color-bg-cards)] px-6 py-6 z-[999]
                  transform transition-transform duration-300 ease-in-out shadow-xl
                  ${isOpen ? "translate-y-0" : "-translate-y-full"}
                  flex flex-col space-y-6 rounded-b-3xl border-b border-[var(--color-border)]`}
              >
          <div className="flex items-center justify-between">
            <Image src={logo} alt="Apollo logo" width={120} height={24} className="object-contain" />
            <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)]">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-text-primary)] text-lg font-medium hover:text-[var(--color-text-secondary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <BaseButton
              variant="transparent"
              className="px-8 py-3 text-sm font-medium"
            >
              CONNECT WALLET
            </BaseButton>
          </div>
      </div>
    </>
  );
}
