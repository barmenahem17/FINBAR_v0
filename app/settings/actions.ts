"use server";

import { createServerClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPortfolio(formData: FormData) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "יש להתחבר כדי ליצור תיק" };
  }

  const name = formData.get("name") as string;
  const feeAmount = parseFloat(formData.get("feeAmount") as string) || 0;
  const accountNumber = formData.get("accountNumber") as string || null;

  if (!name || name.trim() === "") {
    return { error: "שם התיק הוא שדה חובה" };
  }

  const { error } = await supabase.from("portfolios").insert({
    user_id: user.id,
    name: name.trim(),
    fee_amount: feeAmount,
    account_number: accountNumber?.trim() || null,
  });

  if (error) {
    console.error("Error creating portfolio:", error);
    return { error: "שגיאה ביצירת התיק" };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePortfolio(formData: FormData) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "יש להתחבר כדי לעדכן תיק" };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const feeAmount = parseFloat(formData.get("feeAmount") as string) || 0;
  const accountNumber = formData.get("accountNumber") as string || null;

  if (!id) {
    return { error: "מזהה תיק חסר" };
  }

  if (!name || name.trim() === "") {
    return { error: "שם התיק הוא שדה חובה" };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({
      name: name.trim(),
      fee_amount: feeAmount,
      account_number: accountNumber?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating portfolio:", error);
    return { error: "שגיאה בעדכון התיק" };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePortfolio(formData: FormData) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "יש להתחבר כדי למחוק תיק" };
  }

  const id = formData.get("id") as string;

  if (!id) {
    return { error: "מזהה תיק חסר" };
  }

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting portfolio:", error);
    return { error: "שגיאה במחיקת התיק" };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getPortfolios() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { portfolios: [], error: "יש להתחבר" };
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching portfolios:", error);
    return { portfolios: [], error: "שגיאה בטעינת התיקים" };
  }

  return { portfolios: data || [], error: null };
}
