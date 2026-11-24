import Link from "next/link";
import { LegalPage, contactLine } from "@/components/legal";

export const metadata = { title: "Refund & Cancellation Policy · Leadloom" };

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>This policy explains how cancellations and refunds work for Leadloom subscriptions. Payments are processed by Dodo Payments, our reseller and merchant of record, which issues any refund to your original payment method.</p>

      <h2>Try before you pay</h2>
      <p>Every account starts with a free trial that includes 5 AI drafts and needs no card, so you can test Leadloom on real work before choosing a plan.</p>

      <h2>Cancelling</h2>
      <ul>
        <li>You can cancel anytime from <strong>Billing → Manage subscription</strong>. No email or call is needed.</li>
        <li>If you cancel at the end of your billing period, you keep your plan until that period ends and you are not charged again.</li>
        <li>Deleting your workspace in Settings cancels your subscription immediately.</li>
      </ul>

      <h2>7-day money-back guarantee</h2>
      <p>If you are not happy with your first paid month, ask for a refund within 7 days of your first payment and we will refund that payment in full. This applies once per customer, to the first payment of your first subscription.</p>

      <h2>Renewals and plan changes</h2>
      <ul>
        <li>Monthly renewals are not refunded, but you can cancel anytime so you are not charged for the next month.</li>
        <li>When you upgrade, you are charged for the new plan with credit for the unused part of your current plan. When you downgrade, the unused difference is credited to future payments.</li>
        <li>Unused monthly allowances (pieces, revisions, funnel plans) do not roll over and are not refunded.</li>
      </ul>

      <h2>Billing mistakes</h2>
      <p>If you were charged twice, charged after cancelling, or charged the wrong amount, we will refund the mistaken charge in full, whenever you tell us.</p>

      <h2>How to request a refund</h2>
      <p>Email {contactLine()} from the address on your Leadloom account, with the date of the payment. We reply within 2 business days. Approved refunds are issued through Dodo Payments and usually reach your account within 5–10 business days, depending on your bank or payment method.</p>

      <h2>Your legal rights</h2>
      <p>This policy does not limit any refund rights you have under the consumer laws of your country.</p>

      <p className="mt-10 text-sm text-slate-500">See also our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
    </LegalPage>
  );
}
