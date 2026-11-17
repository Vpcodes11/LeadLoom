import { createBrand } from "@/lib/actions";
import { BrandForm } from "@/components/brand-form";
import { Card, PageHeader } from "@/components/ui";

export default function NewBrand() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add a brand" sub="Everything here is used to brief the AI writer for this brand. The more specific, the better the content." />
      <Card><BrandForm action={createBrand} submitLabel="Create brand" /></Card>
    </div>
  );
}
