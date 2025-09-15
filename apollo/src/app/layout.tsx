import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
    axes: ["opsz"],
});

export const metadata: Metadata = {
    title: "Apollo",
    description: "Apollo is a Marketing Web3 solutions company focused on the growth and expansion of projects across Latin America. Since 2024, it has been recognized as the leading go-to-market force in the region, helping brands scale with strategy, creators, and data-driven execution.",
    icons:{
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className="">
            <body
                className={`${inter.variable} font-sans antialiased text-white overflow-x-hidden`}
                >
               {children}
            </body>
        </html>
    );
}