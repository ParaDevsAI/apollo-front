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
          className="fixed inset-0 bg-black/50 backdrop-blur-xl z-[998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

              <div
                className={`md:hidden fixed top-0 right-0 h-screen w-full max-w-[320px]
                  backdrop-blur-lg bg-white/90
                  border-l border-white/10 px-4 py-6 z-[999]
                  transform transition-transform duration-300 ease-in-out shadow-xl
                  ${isOpen ? "translate-x-0" : "translate-x-full"}
                  flex flex-col justify-between`}
              >
        <div>
          <div className="flex items-center justify-between mb-10">
            <Image src={logo} alt="Apollo logo" width={134} height={30} className="object-contain" />
            <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-primary)]">
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col">
            {navLinks.map((link) => (
              <div key={link.label} className="flex flex-col">
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="py-3 text-[var(--color-text-secondary)] text-base font-medium hover:text-[var(--color-text-primary)] transition"
                >
                  {link.label}
                </a>
                <div className="w-full h-[1px] bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-6 pb-4">
          <BaseButton
            variant="transparent"
            className="w-full px-5 py-3 text-[14px] font-medium"
          >
            CONNECT WALLET
          </BaseButton>
        </div>
      </div>
    </>
  );
}
