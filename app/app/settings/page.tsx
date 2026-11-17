import { requireUser } from "@/lib/auth";
import { updateAgencyName } from "@/lib/actions";
import { planOf } from "@/lib/plans";
import { ActionForm, Submit } from "@/components/forms";
import { Card, Field, Input, PageHeader } from "@/components/ui";

export default async function Settings() {
  const { workspace, user } = await requireUser();
  const wl = planOf(workspace.plan).whiteLabel;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" sub={`Signed in as ${user.email}`} />
      <Card>
        <ActionForm action={updateAgencyName} className="space-y-4">
          <Field label="Workspace name"><Input name="name" defaultValue={workspace.name} /></Field>
          <Field label="Name shown to clients on review links" hint={wl ? "White-label is on: the client portal shows only this name." : "Available on all plans. White-label (no Leadloom branding) comes with the Agency plan."}>
            <Input name="agencyName" defaultValue={workspace.agencyName ?? ""} placeholder="Your Agency Co." />
          </Field>
          <Submit>Save</Submit>
        </ActionForm>
      </Card>
    </div>
  );
}
