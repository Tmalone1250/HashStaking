import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../context/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HashStaking Console • Institutional Sovereign Yield",
  description: "Permissioned O(1) reward debt accounting and AP2 EIP-712 Mandates on HashKey Chain.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#0B0F19]`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-slate-100">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
