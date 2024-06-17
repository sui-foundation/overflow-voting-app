"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiClient } from "@mysten/dapp-kit";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { ExternalLink, Github, Info, LoaderCircle, LogOut, RefreshCw } from "lucide-react";
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
import { set, z } from "zod"
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox";

type Project = {
  id: number;
  name: string;
  airTableUrl: string;
  votes: number;
}

const FormSchema = z.object({
  projects: z.array(z.number())
  .nonempty({
    message: "Please select at least one project",
  })
  .max(3, {
    message: "You can only select up to 3 projects",
  })
})

export default function Page() {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projects: [],
    },
  })

  const client = useSuiClient(); // The SuiClient instance
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { address: suiAddress } = useZkLogin(); // The zkLogin instance

  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (suiAddress) {
      enokiFlow.getProof({
        network: "testnet"
      }).then((proof) => {
        console.log("Proof", proof);
      });
      enokiFlow.getSession().then((session) => {
        console.log('session', session)
      })
    }
  }, [suiAddress]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof FormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    toast.promise(vote(values.projects), {
      loading: "Submitting vote...",
      success: async (data) => {

        console.log(data)

        await fetchProjects();

        form.reset({
          projects: []
        })

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
      loading: "Loggin in...",
    });
  };

  const fetchProjects = async () => {
    const res = await client.getObject({
      id: process.env.VOTES_OBJECT_ADDRESS!,
      options: {
        showContent: true, 
        // showPreviousTransaction: true
      }
    })

    console.log(res)

    if (!res.data || !res.data.content) {
      return
    }

    const projects = (res.data.content as any).fields.project_list.map((project: any) => {
      return { 
        id: parseInt(project.fields.id), 
        name: project.fields.name,
        airTableUrl: project.fields.air_table_url,
        votes: project.fields.votes
      }
    })

    console.log(projects)
    setProjects(projects)

  }

  const vote = async (projectIds: number[]) => {

    setVotingInProgress(true);

    const txb = new Transaction
    const votingProjectIds = txb.makeMoveVec({
      elements: projectIds.map((projectId) => {
        let u64 = txb.pure.u64(projectId.toString())
        console.log('u64', u64)
        return u64
      }),
      type: "u64"
    });

    console.log('votingProjectIds', votingProjectIds)

    console.log('votes object address', process.env.VOTES_OBJECT_ADDRESS!)
    console.log('voting module address', process.env.VOTING_MODULE_ADDRESS!)
    const { addressSeed } = await enokiFlow.getProof({
      network: "testnet"
    })

    txb.moveCall({
      target: `${process.env.VOTING_MODULE_ADDRESS}::voting::vote`, 
      arguments: [
        votingProjectIds, 
        txb.object(process.env.VOTES_OBJECT_ADDRESS!),
        txb.pure.u256(addressSeed),
      ]
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
  }

  if (suiAddress) {
    return (
      <div>
        <h1 className="text-4xl font-bold m-4">Overflow Voting</h1>
        <Button
          className="absolute top-4 right-4"
          variant={"ghost"}
          size={"icon"}
          onClick={async () => {
            await enokiFlow.logout();
            window.location.reload();
          }}
        >
          <LogOut className="w-6 text-red-500" />
        </Button>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-16">
            <FormField
              control={form.control}
              name="projects"
              render={() => (
                <FormItem>
                  <div className="mb-4 px-4">
                    <FormLabel className="text-base">Vote for your favorite projects!</FormLabel>
                    <FormDescription>
                      Select up to 3 projects to vote for. Note, you can only vote once!
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
                              className="flex flex-row projects-start space-x-3 space-y-0 border p-4 rounded-md items-center w-full sm:w-96 cursor-pointer"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(project.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, project.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== project.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {project.name} ({project.votes} votes)
                              </FormLabel>
                              <a href={project.airTableUrl} target="_blank">
                                <ExternalLink className="w-4" />
                              </a>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <div style={{WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)", opacity: 10}} className="fixed p-4 bottom-0 z-10 h-12 flex flex-row items-center justify-between w-full">
                    <Button type="submit">Submit</Button>
                    <FormMessage />
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
      <h1 className="text-4xl font-bold m-4">Sui Overflow Voting App</h1>
      <p className="text-md m-4 opacity-50 max-w-md">
        Use this app to vote for your favorite project in the Overflow hackathon!
        Votes are stored on the Sui network and can be viewed on this page.
      </p>
      <div className="fixed sm:relative sm:bottom-0 w-full bottom-4 flex flex-row items-center justify-center">
        <Button className="w-60" onClick={startLogin}>Sign in with Google</Button>
      </div>
    </div>
  );
}
