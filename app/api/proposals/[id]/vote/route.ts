import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voteType } = await request.json();

    // Upsert vote
    const { error } = await supabase
      .from("proposal_votes")
      .upsert({
        proposal_id: params.id,
        user_id: user.id,
        vote_type: voteType,
      }, {
        onConflict: "proposal_id,user_id"
      });

    if (error) {
      return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("proposal_votes")
      .delete()
      .eq("proposal_id", params.id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
