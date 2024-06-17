'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuiClient } from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { BalanceChange } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { track } from "@vercel/analytics/react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";


export default function Page() {

  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  /* Transfer form state */
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState<boolean>(false);

  async function transferSui() {
    const promise = async () => {
      track("Transfer SUI");

      setTransferLoading(true);

      // Validate the transfer amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        setTransferLoading(false);
        throw new Error("Invalid amount");
      }

      // Get the keypair for the current user.
      const keypair = await enokiFlow.getKeypair({ network: "testnet" });

      // Create a new transaction block
      const txb = new Transaction();

      // Add some transactions to the block...
      const [coin] = txb.splitCoins(txb.gas, [
        txb.pure.u64(parsedAmount * 10 ** 9),
      ]);
      txb.transferObjects([coin], txb.pure.address(recipientAddress));

      // Sign and execute the transaction block, using the Enoki keypair
      const res = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });

      setTransferLoading(false);

      console.log("Transfer response", res);

      if (res.effects?.status.status !== "success") {
        throw new Error(
          "Transfer failed with status: " + res.effects?.status.error
        );
      }

      return res;
    };

    toast.promise(promise, {
      loading: "Transfer SUI...",
      success: (data) => {
        return (
          <span className="flex flex-row items-center gap-2">
            Transfer successful!{" "}
            <a
              href={`https://suiscan.xyz/testnet/tx/${data.digest}`}
              target="_blank"
            >
              <ExternalLink width={12} />
            </a>
          </span>
        );
      },
      error: (error) => {
        return error.message;
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen px-4 gap-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold">Thanks for voting!</h1>
        <p className="text-lg text-gray-500 text-center">
          Your vote has been recorded. We'll announce the winners soon!
        </p>
      </div>
      <Card className="max-w-xs">
        <CardHeader>
          <CardTitle>
            <span>
              You've been minted a voter NFT!
            </span>
            {/* <span>You have been awarded a voter NFT for participating in the vote! The NFT is already been sent to your voting account. 
            You can withdraw it to a personal wallet using the form below.</span> */}
          </CardTitle>
          <div className="w-full flex flex-col items-center">
            <Image src="https://media.githubusercontent.com/media/sui-foundation/attendance-nft/main/gifs/overflow-submission.gif" className="rounded-2xl" width={200} height={200} alt="" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col w-full gap-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="recipient">Withdrawal Address (or SuiNS)</Label>
            <Input
              type="text"
              id="recipient"
              placeholder="0xdeadbeef"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="w-full flex flex-row items-center justify-center">
          <Button
            className="w-full"
            onClick={transferSui}
            disabled={transferLoading}
          >
            Withdraw your NFT
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}