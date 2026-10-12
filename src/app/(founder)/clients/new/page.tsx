import { requireAuth } from "@/lib/auth";
import { NewClientForm } from "@/components/founder/NewClientForm";
import Link from "next/link";

export default async function NewClientPage() {
  await requireAuth("founder");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/clients" className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors">
            Clients
          </Link>
          <span className="text-[#E8E2D9]">/</span>
          <span className="text-xs text-[#5C5550]">New client</span>
        </div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Add Client</h1>
      </div>

      <NewClientForm />
    </div>
  );
}
