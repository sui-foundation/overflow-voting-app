"use client";

import { Button } from "@/components/ui/button";
import { IconBrandX } from "@tabler/icons-react";

export default function ShareButton() {
  const projectList = localStorage.getItem("votedProjects")?.split(";;") || [];

  console.log("projectList", projectList);

  const projectLinkInsert = projectList
    .map((project, index) => {
      return `%0A-%20${project}`;
    })
    .join("");

  const link = `https://twitter.com/intent/tweet?text=I%20just%20voted%20for%20my%20favorite%20Overflow%20projects%21%0A${projectLinkInsert}%0A%0AGo%20vote%20at%3A%20https%3A%2F%2Foverflow-voting-app-git-main-sui-foundation.vercel.app%2F`;

  return (
    <a href={link} target="_blank">
      <Button variant={"outline"}>
        Share your vote on <IconBrandX />
      </Button>
    </a>
  );
}
