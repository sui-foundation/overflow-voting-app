'use client';

import Image from "next/image";
import FUD from "@/public/plotting.webp";
import ShareButton from "./ShareButton";
import { use, useEffect, useState } from "react";

export default function Page() {

  const [txnDigest, setTxnDigest] = useState<string | null>(null);

  useEffect(() => {
    const txnDigest = localStorage.getItem('voteDigest');
    if (txnDigest) {
      setTxnDigest(txnDigest);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen px-4 gap-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-medium text-deep-ocean tracking-tight">
          Thanks for voting!
        </h1>
        <p className="text-lg text-ocean text-center">
          Your vote has been <a href={`https://suiscan.xyz/testnet/tx/${txnDigest}`} target="_blank" className="underline text-sky">recorded</a>. We&apos;ll announce the winners soon!
        </p>
      </div>

      <Image
        className="rounded-2xl"
        src={FUD}
        alt="FUD"
        width={300}
        height={300}
      />

      <ShareButton />
    </div>
  );
}
