import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createStaffAction, deleteStaffAction } from "./actions";
import { AddStaffForm } from "./AddStaffForm";

export default async function StaffPage() {
  await requireAuth("founder");

  const staffMembers = await prisma.user.findMany({
    where: { role: "staff" },
    orderBy: { createdAt: "asc" },
  });

  // Get each staff member's owned clients
  const staffWithClients = await Promise.all(
    staffMembers.map(async (staff) => {
      const clients = await prisma.clientProfile.findMany({
        where: { ownedByUserId: staff.id },
        select: { id: true, founderName: true, businessName: true, isActive: true },
        orderBy: { founderName: "asc" },
      });
      return { ...staff, clients };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Staff</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">
          {staffMembers.length} staff member{staffMembers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Add staff form */}
      <div className="rounded-3xl border border-[#EDEBE6] bg-[#FDFCF9] p-6"
        style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
      >
        <h2 className="text-xs font-medium tracking-[0.1em] text-[#7a7268] mb-4">Add staff member</h2>
        <AddStaffForm action={createStaffAction} />
      </div>

      {/* Staff list */}
      {staffWithClients.length > 0 && (
        <div className="space-y-4">
          {staffWithClients.map((staff) => (
            <div
              key={staff.id}
              className="rounded-3xl border border-[#EDEBE6] bg-white overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
            >
              {/* Staff header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2ED] border border-[#EDEBE6] flex items-center justify-center text-xs text-[#7a7268] font-medium">
                    {(staff.name ?? staff.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-[#1A1917]">{staff.name ?? ""}</p>
                    <p className="text-xs text-[#b0a89e]">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#b0a89e]">{staff.clients.length} client{staff.clients.length !== 1 ? "s" : ""}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteStaffAction(staff.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs text-[#b0a89e] hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>

              {/* Clients */}
              {staff.clients.length > 0 ? (
                <div className="divide-y divide-[#EDEBE6]">
                  {staff.clients.map((client) => (
                    <div key={client.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-5 h-5 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[10px] text-[#7a7268]">
                        {client.founderName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1A1917] truncate">{client.founderName}</p>
                        <p className="text-[11px] text-[#b0a89e] truncate">{client.businessName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${client.isActive ? "bg-green-50 text-green-600" : "bg-[#F5F2ED] text-[#b0a89e]"}`}>
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4">
                  <p className="text-xs text-[#b0a89e]">No clients added yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {staffMembers.length === 0 && (
        <div className="rounded-3xl border border-[#EDEBE6] px-8 py-12 text-center">
          <p className="text-xl font-[300] text-[#1A1917]">No staff yet</p>
          <p className="mt-2 text-sm text-[#7a7268]">Add a staff member above to get started.</p>
        </div>
      )}
    </div>
  );
}
