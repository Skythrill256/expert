import { redirect } from "next/navigation";

export default function RootPage() {
  // Immediately redirect root to the login page
  redirect("/login");
}