-- Billing moves from Stripe to Dodo Payments: provider-neutral column names.
-- Payment-provider customer IDs are not unique per workspace (one customer can own several), so the unique index goes.
DROP INDEX IF EXISTS "public"."Workspace_stripeCustomerId_key";
ALTER TABLE "public"."Workspace" RENAME COLUMN "stripeCustomerId" TO "billingCustomerId";
ALTER TABLE "public"."Workspace" RENAME COLUMN "stripeSubscriptionId" TO "billingSubscriptionId";
