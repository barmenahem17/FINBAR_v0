import { createServerClient } from "../../lib/supabase/server";
import DashboardClient from "../../components/DashboardClient";
import { getDashboardData } from "./actions";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  // Get portfolios for sidebar
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: true });

  // Get dashboard data
  const dashboardData = await getDashboardData("ILS");

  return (
    <DashboardClient 
      portfolios={portfolios || []} 
      initialData={dashboardData}
    />
  );
}
