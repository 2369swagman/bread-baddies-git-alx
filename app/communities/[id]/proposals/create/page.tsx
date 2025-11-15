import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateProposalForm } from "@/components/proposals/create-proposal-form";

export default async function CreateProposalPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id: communityId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/communities/${communityId}/proposals/create`);
  }

  // Check membership
  const { data: membership } = await supabase
    .from("community_members")
    .select("status")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership) {
    redirect(`/communities/${communityId}`);
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <CreateProposalForm communityId={communityId} />
    </div>
  );
}
