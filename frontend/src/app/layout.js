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
  title: "HashStaking Console • Institutional Staking Platform",
  description: "Enterprise custody yield settlement and regulatory identity verification on HashKey Chain.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#F8FAFC]`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
