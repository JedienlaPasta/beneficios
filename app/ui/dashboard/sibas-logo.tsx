import Image from "next/image";
import React from "react";
import { anton_sc } from "../fonts";
import Link from "next/link";

export default function SibasLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-1">
      <div className="rounded-xl">
        <Image
          src="/logo_S.svg"
          alt="SIBAS Logo"
          width={48}
          height={48}
          className="drop-shadow-lg"
        />
      </div>
      <div className="flex flex-col">
        <h1
          className={`${anton_sc.className} bg-gradient-to-br from-blue-100 via-slate-200 to-slate-500 bg-clip-text text-4xl tracking-wider text-transparent drop-shadow-md`}
        >
          IBAS
        </h1>
      </div>
    </Link>
  );
}
