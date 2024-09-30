"use client";
import Image from "next/image";
import Logo from "../public/Logo.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between px-[20px] py-[16px] lg:container lg:mx-auto lg:px-20 border-b border-gray-300">
      {/* left：Logo */}
      <div className="flex items-center">
        <Image src={Logo} alt="Logo" width={40} height={40} />
      </div>

      {/* middle：页面跳转链接 */}
      <div className="flex space-x-8">
        <Link href="/" className="font-bold text-[#36485C]">
          Home
        </Link>
        <Link href="/sell" className="font-bold text-[#36485C]">
          Sell
        </Link>
        <Link href="/create" className="font-bold text-[#36485C]">
          Create
        </Link>
      </div>

      {/* right：ConnectButton */}
      <div className="flex items-center">
        <ConnectButton />
      </div>
    </nav>
  );
}
