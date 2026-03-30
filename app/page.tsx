import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect("/agents");
  } else {
    redirect("/login");
  }
}