import { notFound } from "next/navigation";
import { createServerClient } from "../../../lib/supabase/server";
import { getPortfolioPageData } from "./actions";
import PortfolioClient from "../../../components/portfolio/PortfolioClient";

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  // Get all portfolios for sidebar
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: true });

  // Get portfolio page data
  const { data, error } = await getPortfolioPageData(id, "ILS");

  if (error || !data) {
    notFound();
  }

  return (
    <PortfolioClient
      portfolios={portfolios || []}
      initialData={data}
    />
  );
}

