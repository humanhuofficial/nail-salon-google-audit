import { redirect } from "next/navigation";

/** Legacy route: analysis now lives on the home page only. */
export default function ResultsPage() {
  redirect("/");
}
