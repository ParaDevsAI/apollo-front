"use client";

import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import logoParadevs from "@/assets/images/footer/logoParadevs.png";
import apolloLogo from "@/assets/images/footer/logo.svg";
import twitterLogo from "@/assets/images/footer/twitterLogo.svg";
import telegramLogo from "@/assets/images/footer/telegramLogo.svg";
import DesktopFooterLinks from "@/components/Footer/DesktopFooterLinks";
import { getFooterLinks } from "@/components/Footer/footerLinks";

export default function Footer() {
  const footerLinks = getFooterLinks();
  
  return (
    <footer className="bg-[var(--color-bg-footer)] mt-6">
      <div className="container mx-auto">
        <div className="flex justify-center py-8 mt-8">
            <Image
            src={apolloLogo}
              alt="Apollo logo"
            width={200}
            height={28}
            className="object-contain"
          />
        </div>
        <div className="nav-links flex justify-center py-4 gap-8 max-md:flex max-md:gap-4">
          <DesktopFooterLinks links={footerLinks} />
        </div>
        <div className="social-links flex justify-center py-4 gap-8 max-md:grid max-md:grid-cols-3 max-md:gap-6">
          <Link href="https://twitter.com/parabuilders" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <Image src={twitterLogo} alt="Twitter" width={20} height={20} className="filter brightness-0 invert" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">X (Twitter)</span>
          </Link>
          <Link href="https://discord.gg/parabuilders" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <FaDiscord className="w-5 h-5 text-[var(--color-text-primary)]" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">Discord</span>
          </Link>
          <Link href="https://t.me/parabuilders" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <Image src={telegramLogo} alt="Telegram" width={20} height={20} className="filter brightness-0 invert" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">Telegram</span>
          </Link>
          <Link href="https://www.instagram.com/parabuildersio/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <FaInstagram className="w-5 h-5 text-[var(--color-text-primary)]" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">Instagram</span>
          </Link>
          <Link href="https://www.youtube.com/@parabuilders" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <FaYoutube className="w-5 h-5 text-[var(--color-text-primary)]" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">YouTube</span>
          </Link>
          <Link href="https://www.linkedin.com/company/parabuilders/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--color-text-secondary)] transition-colors max-md:justify-center">
            <FaLinkedin className="w-5 h-5 text-[var(--color-text-primary)]" />
            <span className="text-[var(--color-text-secondary)] text-sm group-hover:text-[var(--color-text-primary)] transition-colors duration-300">LinkedIn</span>
          </Link>
        </div>
        <div className="bottom-bar flex justify-between items-center py-4 px-4 max-md:flex-col max-md:gap-4">
          <span className="copyright-span text-base text-[var(--color-text-secondary)] max-md:text-center">
            ©2025 Paradevs. All rights reserved
          </span>

          <div className="powered-by-div flex items-center gap-2 text-base max-md:justify-center">
            <span className="text-[var(--color-text-secondary)]">Powered by</span>
            <Image src={logoParadevs} alt="Paradevs logo" width={120} height={120} />
          </div>
        </div>
      </div>
    </footer>
  );
}