import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewNodeClient from "./NewNodeClient";

export default async function NewNodePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <NewNodeClient />;
}
