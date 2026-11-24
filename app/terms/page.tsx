import { LegalPage, contactLine } from "@/components/legal";

export const metadata = { title: "Terms of Service · Leadloom" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms govern your use of Leadloom (&quot;the Service&quot;). By creating an account you agree to them. If you use Leadloom on behalf of a company or agency, you agree on its behalf.</p>

      <h2>1. The Service</h2>
      <p>Leadloom helps you plan, write, review and deliver marketing content using AI. We may change, add or remove features over time. Paid plans include the monthly limits shown on the pricing and billing pages.</p>

      <h2>2. Your account</h2>
      <p>You must give accurate information and keep your password secure. You are responsible for activity under your account, including your teammates&apos; activity. Workspace owners control billing, team members and deletion.</p>

      <h2>3. Plans, billing and cancellation</h2>
      <ul>
        <li>The free trial includes a one-time allowance of AI drafts. Paid plans are billed monthly in advance through Dodo Payments, our reseller and merchant of record, whose terms also apply to your purchase.</li>
        <li>Plans renew automatically until cancelled. You can cancel anytime from the Billing page (Manage subscription); access continues until the end of the paid period.</li>
        <li>Unused monthly allowances do not roll over. Fees are non-refundable except where the law requires otherwise.</li>
        <li>We may change prices with at least 30 days&apos; notice; changes apply from your next billing period.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>You own the brand information, writing samples and content you put into Leadloom and the content it generates for you (&quot;Your Content&quot;). You give us a limited licence to store, process and display Your Content only to provide the Service, including sending it to our AI provider to generate drafts. We do not use Your Content to train AI models.</p>

      <h2>5. AI-generated content</h2>
      <p>Drafts are produced by AI and can contain mistakes. Leadloom flags likely problems (such as unsourced statistics and placeholders) but you are responsible for reviewing, fact-checking and approving content before you publish it, and for making sure it complies with laws and the rights of others.</p>

      <h2>6. Acceptable use</h2>
      <p>Do not use Leadloom to create unlawful, deceptive, defamatory, hateful or infringing content, spam, or content that impersonates others; to attempt to break or overload the Service; or to resell access except as an agency serving your own clients.</p>

      <h2>7. Client review links</h2>
      <p>Review links give anyone who has the link access to the content shared through them. Share them only with the people who should see that content.</p>

      <h2>8. Availability and changes</h2>
      <p>We work to keep Leadloom available but do not guarantee uninterrupted service. We may suspend accounts that breach these terms or put the Service or other users at risk.</p>

      <h2>9. Liability</h2>
      <p>The Service is provided &quot;as is&quot;. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability for any claim is limited to the fees you paid us in the 12 months before the claim.</p>

      <h2>10. Ending your account</h2>
      <p>You can delete your workspace anytime in Settings. This permanently deletes your content and cancels your subscription.</p>

      <h2>11. Contact</h2>
      <p>Questions about these terms: {contactLine()}.</p>
    </LegalPage>
  );
}
