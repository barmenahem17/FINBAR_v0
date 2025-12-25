import { createServerClient } from "../../lib/supabase/server";
import DashboardClient from "../../components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  // Get portfolios for this user
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: true });

  return <DashboardClient portfolios={portfolios || []} />;
}
