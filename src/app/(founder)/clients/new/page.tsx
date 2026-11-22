import { requireAuth } from "@/lib/auth";
import { NewClientForm } from "@/components/founder/NewClientForm";
import Link from "next/link";

export default async function NewClientPage() {
  await requireAuth("founder");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/clients" className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
            Clients
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">New client</span>
        </div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Add Client</h1>
      </div>

      <NewClientForm />
    </div>
  );
}
