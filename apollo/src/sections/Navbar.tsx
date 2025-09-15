"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "@/assets/images/navbar/logo.svg";
import MobileMenu from "@/components/Navbar/MobileMenu";
import BaseButton from "@/components/Ui/Button";
import DesktopNavLinks from "@/components/Navbar/DesktopNavbarLinks";
import { getNavbarLinks } from "@/components/Navbar/navbarLinks";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    }
  }, [isMenuOpen]);

  const navLinks = getNavbarLinks();

  return (
    <>
              <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6">
                <div
                  className="w-full max-w-[1440px] mx-auto rounded-none md:rounded-full"
                  style={{
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="w-full h-full flex items-center justify-between rounded-none md:rounded-full bg-[var(--color-navbar)] px-4 py-4 md:px-10 md:py-5 backdrop-blur-sm">
                    <Image
                      src={logo}
                      alt="Apollo logo"
                      width={100}
                      height={18}
                      className="object-contain md:w-[200px] md:h-[45px]"
                    />

                    <div className="hidden md:flex items-center gap-[41px]">
                      <DesktopNavLinks links={navLinks} />
                      
                      <BaseButton
                        variant="transparent"
                        className="px-5 py-2 text-[14px] font-medium"
                      >
                        CONNECT WALLET
                      </BaseButton>
                    </div>
                  
                    <div className="md:hidden">
                      <button
                        onClick={() => setIsMenuOpen(true)}
                        className="text-[var(--color-text-primary)]"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 6h16M4 12h16M4 18h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

          <MobileMenu
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            navLinks={navLinks}
          />
        </div>
      </nav>
    </>
  );
}
