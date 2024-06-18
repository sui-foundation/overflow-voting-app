"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiClient } from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import {
  BadgeInfo,
  ExternalLink,
  Github,
  Info,
  LoaderCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import OverflowBanner from "@/public/bannerv2.png";
import SuiLogo from "@/public/Sui_Logo_White.png";
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
import { set, z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { IconBrandYoutube } from "@tabler/icons-react";

type Project = {
  id: number;
  name: string;
  airTableUrl: string;
  votes: number;
};

const FormSchema = z.object({
  projects: z
    .array(z.number())
    .nonempty({
      message: "Please select at least one project",
    })
    .max(3, {
      message: "You can only select up to 3 projects",
    }),
});

const projectVideolinks = {
  'SuiMate': 'https://www.youtube.com/live/o8iwoRRsBu8?t=955s',
  'The Wanderer': 'https://www.youtube.com/live/o8iwoRRsBu8?t=1425s',
  'SuiWeb': 'https://www.youtube.com/live/o8iwoRRsBu8?t=2100s',
  'AdToken': 'https://www.youtube.com/live/o8iwoRRsBu8?t=2507s',
  'PinataBot': 'https://www.youtube.com/live/o8iwoRRsBu8?t=3145s',
  'Kriya Credit': 'https://www.youtube.com/live/o8iwoRRsBu8?t=3648s',
  'BioWallet': 'https://www.youtube.com/live/o8iwoRRsBu8?t=4320s',
  'CLMM and Deepbook Market Making Vaulta': 'https://www.youtube.com/live/o8iwoRRsBu8?t=5140s',
  'Private Transaction In Sui': 'https://www.youtube.com/live/o8iwoRRsBu8?t=5600s',
  'HexCapsule': 'https://www.youtube.com/live/o8iwoRRsBu8?t=6160s',
  'Sui Metadata': 'https://www.youtube.com/live/o8iwoRRsBu8?t=6670s',
  'Sui dApp Starter': 'https://www.youtube.com/live/o8iwoRRsBu8?t=7090s',
  'Promise': 'https://www.youtube.com/live/o8iwoRRsBu8?t=8145s',
  'Goose Bumps': 'https://www.youtube.com/live/o8iwoRRsBu8?t=8470s',
  'Panther Wallet': 'https://www.youtube.com/live/o8iwoRRsBu8?t=8890s',
  'Orbital': 'https://www.youtube.com/live/o8iwoRRsBu8?t=9465s',
  'Trippple': 'https://www.youtube.com/live/o8iwoRRsBu8?t=9980s',
  'Aeon': 'https://www.youtube.com/live/o8iwoRRsBu8?t=10350s',
  'Stashdrop': 'https://www.youtube.com/live/o8iwoRRsBu8?t=10760s', 
  'Wagmi Kitchen': 'https://www.youtube.com/live/o8iwoRRsBu8?t=11725s',
  'Kraken': 'https://www.youtube.com/live/o8iwoRRsBu8?t=12175s',
  'Su Protocol': 'https://www.youtube.com/live/o8iwoRRsBu8?t=12700s',
  'Mineral': 'https://www.youtube.com/live/o8iwoRRsBu8?t=13130s',
  'Shio': 'https://www.youtube.com/live/o8iwoRRsBu8?t=13495s',
  'zk Reputation': 'https://www.youtube.com/live/o8iwoRRsBu8?t=13965s',
  'Suinfra – RPC Metrics Dashboard & Geo-Aware RPC Endpoint': 'https://www.youtube.com/live/o8iwoRRsBu8?t=14415s',
  "Homeless Hold'Em": 'https://www.youtube.com/live/o8iwoRRsBu8?t=15370s',
  'Infinite Seas': 'https://www.youtube.com/live/o8iwoRRsBu8?t=15810s',
  'DoubleUp': 'https://www.youtube.com/live/o8iwoRRsBu8?t=16180s',
  'Pump Up': 'https://www.youtube.com/live/o8iwoRRsBu8?t=16490s',
  'SuiFund': 'https://www.youtube.com/live/o8iwoRRsBu8?t=16980s',
  'stream.gift': 'https://www.youtube.com/live/H27LvUvPyQk?t=680s',
  'Shall We Move': 'https://www.youtube.com/live/H27LvUvPyQk?t=1105s',
  'Hop Aggregator': 'https://www.youtube.com/live/H27LvUvPyQk?t=1580s',
  'Summon Attack': 'https://www.youtube.com/live/H27LvUvPyQk?t=2040s',
  'WebAuthn on SUI': 'https://www.youtube.com/live/H27LvUvPyQk?t=2505s',
  'Aalps Protocol': 'https://www.youtube.com/live/H27LvUvPyQk?t=2815s',
  'LePoker': 'https://www.youtube.com/live/H27LvUvPyQk?t=3382s',
  'Mystic Tarot': 'https://www.youtube.com/live/H27LvUvPyQk?t=4296s',
  'BitsLab IDE': 'https://www.youtube.com/live/H27LvUvPyQk?t=4785s',
  'Fren Suipport': 'https://www.youtube.com/live/H27LvUvPyQk?t=5195s',
  'LiquidLink': 'https://www.youtube.com/live/H27LvUvPyQk?t=5535s',
  'SuiGPT': 'https://www.youtube.com/live/H27LvUvPyQk?t=5860s',
  'FoMoney': 'https://www.youtube.com/live/H27LvUvPyQk?t=6320s',
  'SuiSec Toolkit': 'https://www.youtube.com/live/H27LvUvPyQk?t=6665s',
  'sui-wormhole-native-token-transfer': 'https://www.youtube.com/live/H27LvUvPyQk?t=7915s',
  'SuiAutochess': 'https://www.youtube.com/live/H27LvUvPyQk?t=8260s',
  'BullNow': 'https://www.youtube.com/live/H27LvUvPyQk?t=8715s',
  'Mrc20protocol': 'https://www.youtube.com/live/H27LvUvPyQk?t=9210s',
  'Nimbus': 'https://www.youtube.com/live/H27LvUvPyQk?t=9565s',
  'Hakifi': 'https://www.youtube.com/live/H27LvUvPyQk?t=10115s',
  'Pandora Finance': 'https://www.youtube.com/live/H27LvUvPyQk?t=10575s',
  'Sui simulator': 'https://www.youtube.com/live/H27LvUvPyQk?t=11530s',
  'Wecastle': 'https://www.youtube.com/live/H27LvUvPyQk?t=11990s',
  'Stoked Finance': 'https://www.youtube.com/live/H27LvUvPyQk?t=12445s',
  'Scam NFT detector': 'https://www.youtube.com/live/H27LvUvPyQk?t=12970s',
  'Liquidity Garden': 'https://www.youtube.com/live/H27LvUvPyQk?t=13385s',
  'FlowX Finance - Aggregator': 'https://www.youtube.com/live/H27LvUvPyQk?t=13637s',
  'Wave Wallet': 'https://www.youtube.com/live/H27LvUvPyQk?t=14010s',
  'SuiPass': 'https://www.youtube.com/live/H27LvUvPyQk?t=15145s',
  'Multichain Meme Creator': 'https://www.youtube.com/live/H27LvUvPyQk?t=15630s',
  'Legato LBP': 'https://www.youtube.com/live/H27LvUvPyQk?t=16160s',
  'wormhole-kit': 'https://www.youtube.com/live/H27LvUvPyQk?t=16530s',
  'AresRPG': 'https://www.youtube.com/live/H27LvUvPyQk?t=16810s',
  'DegenHive': 'https://www.youtube.com/live/H27LvUvPyQk?t=17340s'

} as { [key: string]: string };

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projects: [],
    },
  });

  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (suiAddress) {
      enokiFlow
        .getProof({
          network: "testnet",
        })
        .then((proof) => {
          console.log("Proof", proof);
        });
      enokiFlow.getSession().then((session) => {
        console.log("session", session);
      });
    }
  }, [suiAddress]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof FormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    toast.promise(vote(values.projects), {
      loading: "Submitting vote...",
      success: async (data) => {
        console.log(data);

        await fetchProjects();

        localStorage.setItem(
          "votedProjects",
          values.projects
            .map((projectId) => projects[projectId].name)
            .join(";;")
        );

        form.reset({
          projects: [],
        });

        window.location.href = "/thanksforvoting";

        return (
          <span className="flex flex-row items-center gap-2">
            Vote submitted successfully!{" "}
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
        console.error(error);
        return error.message;
      },
    });
  }

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
      loading: "Logging in...",
    });
  };

  const fetchProjects = async () => {
    const res = await client.getObject({
      id: process.env.VOTES_OBJECT_ADDRESS!,
      options: {
        showContent: true,
        // showPreviousTransaction: true
      },
    });

    console.log(res);

    if (!res.data || !res.data.content) {
      return;
    }

    const projects = (res.data.content as any).fields.project_list.map(
      (project: any) => {
        return {
          id: parseInt(project.fields.id),
          name: project.fields.name,
          airTableUrl: project.fields.air_table_url,
          votes: project.fields.votes,
        };
      }
    );

    console.log(projects);
    setProjects(projects);
  };

  const vote = async (projectIds: number[]) => {
    setVotingInProgress(true);

    const txb = new Transaction();
    const votingProjectIds = txb.makeMoveVec({
      elements: projectIds.map((projectId) => {
        let u64 = txb.pure.u64(projectId.toString());
        console.log("u64", u64);
        return u64;
      }),
      type: "u64",
    });

    console.log("votingProjectIds", votingProjectIds);

    console.log("votes object address", process.env.VOTES_OBJECT_ADDRESS!);
    console.log("voting module address", process.env.VOTING_MODULE_ADDRESS!);
    const { addressSeed } = await enokiFlow.getProof({
      network: "testnet",
    });

    txb.moveCall({
      target: `${process.env.VOTING_MODULE_ADDRESS}::voting::vote`,
      arguments: [
        votingProjectIds,
        txb.object(process.env.VOTES_OBJECT_ADDRESS!),
        txb.pure.u256(addressSeed),
      ],
    });

    try {
      // Sponsor and execute the transaction block, using the Enoki keypair
      const res = await enokiFlow.sponsorAndExecuteTransaction({
        transaction: txb,
        network: "testnet",
        client,
      });
      setVotingInProgress(false);

      return res;
    } catch (error) {
      setVotingInProgress(false);
      throw error;
    }
  };

  if (suiAddress) {
    return (
      <div>
        <h1 className="text-4xl font-medium m-4 tracking-tighter">
          Sui Overflow: Community Favorite Award Voting
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pb-16"
          >
            <FormField
              control={form.control}
              name="projects"
              render={() => (
                <FormItem>
                  <div className="mb-4 px-4">
                    <FormLabel className="text-base">How to vote: </FormLabel>
                    <FormDescription>
                      <ul className="list-disc list-inside max-w-prose">
                        <li>
                          Explore the shortlisted projects displayed below. Next to each project name, click the info icon to view the project details and the Youtube icon to watch the project demo from Demo Day
                        </li>
                        <li>Click the checkbox to select a project for voting</li>
                        <li>You can select up to 3 projects</li>
                        <li>Click the submit button to submit your vote - you can only submit your votes once</li>
                      </ul>
                      {/* Click the info icon to view the details of each project and vote for up to your top 3 favorite projects. Note, you can only vote once!  */}
                    </FormDescription>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 px-4">
                    {projects.map((project, index) => (
                      <FormField
                        key={project.id}
                        control={form.control}
                        name="projects"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={project.id}
                              className={
                                "flex flex-row projects-start space-x-3 space-y-0 border p-4 rounded-md items-center w-full sm:w-96 cursor-pointer" +
                                `${
                                  index % 2 === 0
                                    ? " bg-[#f9f9f9]"
                                    : " bg-[#f0f0f0]"
                                }`
                              }
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(project.id)}
                                  disabled={
                                    field.value?.length === 3 &&
                                    !field.value?.includes(project.id)
                                  }
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          project.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== project.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {project.name}
                              </FormLabel>
                              <a href={project.airTableUrl} target="_blank">
                                <BadgeInfo className="w-4 text-sky" />
                              </a>
                              {
                                projectVideolinks[project.name] && (
                                  <a href={projectVideolinks[project.name]} target="_blank">
                                    <IconBrandYoutube className="w-4 text-red-500" />
                                  </a>
                                )
                              }
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      WebkitBackdropFilter: "blur(4px)",
                      backdropFilter: "blur(4px)",
                      opacity: 10,
                    }}
                    className="fixed border-t p-4 bottom-0 z-10 h-12 flex flex-row items-center justify-between w-full"
                  >
                    <Button
                      className="rotate-180"
                      variant={"ghost"}
                      size={"icon"}
                      onClick={async () => {
                        await enokiFlow.logout();
                        window.location.reload();
                      }}
                    >
                      <LogOut className="w-6 text-red-500" />
                    </Button>
                    <Button
                      type="submit"
                      disabled={votingInProgress || !form.formState.isValid}
                    >
                      Submit
                    </Button>
                    {/* <FormMessage /> */}
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <Image
        src={OverflowBanner}
        alt=""
        className=" w-full max-w-screen-md pt-4 px-4"
      />
      <p className="text-md m-4 text-deep-ocean w-full max-w-prose p-4">
        Use this app to vote for your favorite project in the Sui Overflow
        hackathon! Votes are stored on the Sui network and results will be
        announced at the end of the voting period. The top 10 projects that
        receive the most votes will win the Community Favorite Award.
        <br />
        <br />
        View the{" "}
        <a href="https://go.sui.io/overflow-community-showcase" target="_blank">
          project gallery
        </a>{" "}
        of all the Sui Overflow shortlisted projects and watch the project
        demos:
        <br />
        <div className="flex flex-col items-center w-full">
          <div>
            <a
              href="https://www.youtube.com/live/o8iwoRRsBu8"
              target="_blank"
              className="underline text-[#4da2ff]"
            >
              Day #1
            </a>{" "}
            |{" "}
            <a
              href="https://www.youtube.com/live/H27LvUvPyQk"
              target="_blank"
              className="underline text-[#4da2ff]"
            >
              Day #2
            </a>
          </div>
        </div>
        <br />
        <br />
        This app was built using the Sui TS SDK. This app demostrates the ease
        of building a decentralized application with production grade security
        and user experience on Sui. Check out the source code{" "}
        <a
          href="https://github.com/sui-foundation/overflow-voting-app"
          target="_blank"
          className="underline text-[#4da2ff]"
        >
          here
        </a>
        .
      </p>
      <div className="fixed sm:relative sm:bottom-0 w-full bottom-4 flex flex-row items-center justify-center">
        <Button className="w-60 text-[#ffffff]" onClick={startLogin}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
