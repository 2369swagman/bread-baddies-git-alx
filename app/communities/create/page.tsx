import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateCommunityForm } from "@/components/communities/create-community-form";

export default async function CreateCommunityPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/communities/create");
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <CreateCommunityForm />
    </div>
  );
}
