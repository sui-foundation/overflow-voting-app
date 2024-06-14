"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiClient } from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { ExternalLink, Github, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BalanceChange } from "@mysten/sui/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { track } from "@vercel/analytics";

const dummyProjects = [
  {
    name: "Project 1",
    description: "This is a description of project 1",
    votes: 0,
  },
  {
    name: "Project 2",
    description: "This is a description of project 2",
    votes: 0,
  },
  {
    name: "Project 3",
    description: "This is a description of project 3",
    votes: 0,
  },
  {
    name: "Project 4",
    description: "This is a description of project 4",
    votes: 0,
  },
  {
    name: "Project 5",
    description: "This is a description of project 5",
    votes: 0,
  },
];

export default function Page() {
  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  /* The account information of the current user. */
  const [balance, setBalance] = useState<number>(0);
  const [accountLoading, setAccountLoading] = useState<boolean>(true);

  /**
   * When the user logs in, fetch the account information.
   */
  useEffect(() => {
    if (suiAddress) {
      getAccountInfo();
    }
  }, [suiAddress]);

  const startLogin = async () => {
    const promise = async () => {
      
      window.location.href = await enokiFlow.createAuthorizationURL({
        provider: "google",
        clientId: process.env.GOOGLE_CLIENT_ID!,
        redirectUrl: `${window.location.href.split("#")[0]}auth`,
        network: "testnet",
      });
    };

    toast.promise(promise, {
      loading: "Loggin in...",
    });
  };

  /**
   * Fetch the account information of the current user.
   */
  const getAccountInfo = async () => {
    if (!suiAddress) {
      return;
    }

    setAccountLoading(true);

    const balance = await client.getBalance({ owner: suiAddress });
    setBalance(parseInt(balance.totalBalance) / 10 ** 9);

    setAccountLoading(false);
  };

  /**
   * Request SUI from the faucet.
   */
  const onRequestSui = async () => {
    const promise = async () => {
      //track("Request SUI");

      // Ensures the user is logged in and has a SUI address.
      if (!suiAddress) {
        throw new Error("No SUI address found");
      }

      if (balance > 3) {
        throw new Error("You already have enough SUI!");
      }

      // Request SUI from the faucet.
      const res = await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: suiAddress,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      return res;
    };

    toast.promise(promise, {
      loading: "Requesting SUI...",
      success: (data) => {
        console.log("SUI requested successfully!", data);

        const suiBalanceChange = data.transferredGasObjects
          .map((faucetUpdate) => {
            return faucetUpdate.amount / 10 ** 9;
          })
          .reduce((acc: number, change: any) => {
            return acc + change;
          }, 0);

        setBalance(balance + suiBalanceChange);

        return "SUI requested successfully! ";
      },
      error: (error) => {
        return error.message;
      },
    });
  };

  if (suiAddress) {
    return (
      <div>
        <h1 className="text-4xl font-bold m-4">Overflow Voting</h1>
        <Popover>
          <PopoverTrigger className="absolute top-4 right-4 max-w-sm" asChild>
            <div>
              <Button className="hidden sm:block" variant={"secondary"}>
                {accountLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  `${suiAddress?.slice(0, 5)}...${suiAddress?.slice(
                    63
                  )} - ${balance.toPrecision(3)} SUI`
                )}
              </Button>
              <Avatar className="block sm:hidden">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <Card className="border-none shadow-none">
              {/* <Button variant={'ghost'} size='icon' className="relative top-0 right-0" onClick={getAccountInfo}><RefreshCw width={16} /></Button> */}
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>
                  View the account generated by Enoki&apos;s zkLogin flow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountLoading ? (
                  <div className="w-full flex flex-col items-center">
                    <LoaderCircle className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-row gap-1 items-center">
                      <span>Address: </span>
                      {accountLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <div className="flex flex-row gap-1">
                          <span>{`${suiAddress?.slice(
                            0,
                            5
                          )}...${suiAddress?.slice(63)}`}</span>
                          <a
                            href={`https://suiscan.xyz/testnet/account/${suiAddress}`}
                            target="_blank"
                          >
                            <ExternalLink width={12} />
                          </a>
                        </div>
                      )}
                    </div>
                    <div>
                      <span>Balance: </span>
                      <span>{balance.toPrecision(3)} SUI</span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-row gap-2 items-center justify-between">
                <Button variant={"outline"} size={"sm"} onClick={onRequestSui}>
                  Request SUI
                </Button>
                <Button
                  variant={"destructive"}
                  size={"sm"}
                  className="w-full text-center"
                  onClick={async () => {
                    await enokiFlow.logout();
                    window.location.reload();
                  }}
                >
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </PopoverContent>
        </Popover>
        <div className="flex flex-wrap justify-center gap-4">
          {
            dummyProjects.map((project, index) => {
              return (
                <Card key={index} className="w-md">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-row items-center justify-between">
                      <span>Votes: {project.votes}</span>
                      <Button variant={"outline"} size={"sm"}>Vote</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          }
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <a
        href="https://github.com/dantheman8300/enoki-example-app"
        target="_blank"
        className="absolute top-4 right-0 sm:right-4"
        onClick={() => {
          //track("github");
        }}
      >
        <Button variant={"link"} size={"icon"}>
          <Github />
        </Button>
      </a>
      <div>
        <h1 className="text-4xl font-bold m-4">Overflow Voting</h1>
        <p className="text-md m-4 opacity-50 max-w-md">
          Use this app to vote for your favorite project in the Overflow hackathon!
          Votes are stored on the Sui network and can be viewed on this page.
        </p>
      </div>
      <Button onClick={startLogin}>Sign in with Google</Button>
    </div>
  );
}
