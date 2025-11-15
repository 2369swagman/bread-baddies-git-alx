import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProposalSchema } from "@/lib/validations/proposal";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, description } = validation.data;

    // Create proposal
    const { data: proposal, error } = await supabase
      .from("proposals")
      .insert({
        community_id: params.id,
        user_id: user.id,
        title,
        description,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
