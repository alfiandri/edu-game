import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Child, GameSession } from "@/lib/types";
import ChildAnalyticsClient from "./ChildAnalyticsClient";

interface Props {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({ params }: Props) {
  const { childId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single();

  if (!child) notFound();

  // Fetch recent sessions
  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("child_id", childId)
    .order("started_at", { ascending: false })
    .limit(20);

  // Fetch badges
  const { data: childBadges } = await supabase
    .from("child_badges")
    .select("*, badge:badges(*)")
    .eq("child_id", childId);

  return (
    <ChildAnalyticsClient
      child={child as Child}
      sessions={(sessions || []) as GameSession[]}
      childBadges={childBadges || []}
    />
  );
}
