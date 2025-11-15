"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, DollarSign } from "lucide-react";
import { ProposalsBoard } from "./proposals-board";
import { ProjectsBoard } from "./projects-board";

interface CommunityTabsProps {
  communityId: string;
  proposals: any[];
  posts: any[];
  isLeader: boolean;
  isMember: boolean;
}

export function CommunityTabs({
  communityId,
  proposals,
  posts,
  isLeader,
  isMember,
}: CommunityTabsProps) {
  return (
    <Tabs defaultValue="proposals" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="proposals" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Proposals ({proposals.length})
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Projects ({posts.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="proposals" className="mt-6">
        <ProposalsBoard
          communityId={communityId}
          proposals={proposals}
          isLeader={isLeader}
          isMember={isMember}
        />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsBoard
          communityId={communityId}
          posts={posts}
          isLeader={isLeader}
          isMember={isMember}
        />
      </TabsContent>
    </Tabs>
  );
}
