import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateAgencyName } from "@/lib/actions";
import { changePassword, createInvite, deleteAccount, removeMember, revokeInvite } from "@/lib/account-actions";
import { planOf } from "@/lib/plans";
import { emailEnabled } from "@/lib/email";
import { ActionForm, Submit } from "@/components/forms";
import { ChangePasswordForm, DeleteAccountForm, InviteForm } from "@/components/account-forms";
import { Badge, Button, Card, Field, Input, PageHeader } from "@/components/ui";

export default async function Settings() {
  const { workspace, user, role } = await requireUser();
  const isOwner = role === "owner";
  const plan = planOf(workspace.plan);
  const [members, invites] = await Promise.all([
    db.membership.findMany({ where: { workspaceId: workspace.id }, include: { user: true }, orderBy: { id: "asc" } }),
    db.invite.findMany({ where: { workspaceId: workspace.id, acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }),
  ]);
  const seatsUsed = members.length + invites.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" sub={`Signed in as ${user.email}`} />

      {isOwner && (
        <Card>
          <h2 className="mb-4 font-semibold">Workspace</h2>
          <ActionForm action={updateAgencyName} className="space-y-4">
            <Field label="Workspace name"><Input name="name" defaultValue={workspace.name} /></Field>
            <Field label="Name shown to clients on review links" hint={plan.whiteLabel ? "White-label is on: the client portal shows only this name." : "White-label (no Leadloom branding on the client portal) comes with the Agency plan."}>
              <Input name="agencyName" defaultValue={workspace.agencyName ?? ""} placeholder="Your Agency Co." />
            </Field>
            <Submit>Save</Submit>
          </ActionForm>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Team</h2>
          <span className="text-sm text-slate-500">{seatsUsed} of {plan.seats} seat{plan.seats === 1 ? "" : "s"} used</span>
        </div>
        <ul className="divide-y divide-slate-100 text-sm">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0"><div className="font-medium">{m.user.name}{m.userId === user.id && " (you)"}</div><div className="truncate text-xs text-slate-500">{m.user.email}</div></div>
              <div className="flex items-center gap-2">
                <Badge tone={m.role === "owner" ? "approved" : undefined}>{m.role}</Badge>
                {isOwner && m.userId !== user.id && <form action={removeMember.bind(null, m.id)}><Button size="sm" variant="ghost">Remove</Button></form>}
              </div>
            </li>
          ))}
          {invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0"><div className="truncate font-medium">{i.email}</div><div className="text-xs text-slate-500">Invite pending · expires {i.expiresAt.toLocaleDateString()}</div></div>
              {isOwner && <form action={revokeInvite.bind(null, i.id)}><Button size="sm" variant="ghost">Revoke</Button></form>}
            </li>
          ))}
        </ul>
        {isOwner && (
          <div className="mt-4">
            <InviteForm action={createInvite} />
            {!emailEnabled() && <p className="mt-2 text-xs text-slate-500">Email isn&apos;t configured, so you&apos;ll get a link to send yourself.</p>}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Password</h2>
        <ChangePasswordForm action={changePassword} />
      </Card>

      {isOwner && (
        <Card className="border-red-200">
          <h2 className="font-semibold text-red-700">Delete workspace</h2>
          <p className="mb-4 mt-1 text-sm text-slate-600">Permanently deletes every brand, funnel, piece of content and team login in {workspace.name}, and cancels your subscription.</p>
          <DeleteAccountForm action={deleteAccount} name={workspace.name} />
        </Card>
      )}
    </div>
  );
}
