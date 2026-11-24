import { LegalPage, contactLine } from "@/components/legal";

export const metadata = { title: "Privacy Policy · Leadloom" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains what personal data Leadloom collects, why, and your choices.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email address and a hashed password (we never store your password in readable form). If you sign in with Google, we receive your name, email address and Google account ID, and nothing else.</li>
        <li><strong>Workspace content:</strong> brand details, writing samples, briefs, drafts, comments and review feedback you or your clients add.</li>
        <li><strong>Billing data:</strong> handled by Dodo Payments, our reseller and merchant of record. We store your Dodo Payments customer and subscription IDs, never your card details.</li>
        <li><strong>Usage and security data:</strong> counts of AI actions for plan limits, and IP addresses briefly for rate limiting and abuse prevention.</li>
      </ul>

      <h2>How we use it</h2>
      <p>To provide the Service (generating and storing content, client reviews, notifications), to bill you, to keep the Service secure, and to contact you about your account. We do not sell personal data and we do not use your content to train AI models ourselves.</p>

      <h2>AI processing</h2>
      <p>To write voice profiles, funnel plans and drafts, we send the relevant brand details, briefs and drafts to our AI provider. We currently use Google&apos;s Gemini API. On Google&apos;s free tier, Google may use the prompts and responses it receives to improve its products, and human reviewers at Google may read them. Do not put confidential information, passwords or sensitive personal data into briefs, writing samples or proof points. We may also use Anthropic&apos;s Claude API; Anthropic does not use API data to train its models by default.</p>

      <h2>Service providers</h2>
      <p>We use these providers to run Leadloom, each only for the purpose listed:</p>
      <ul>
        <li><strong>Google</strong> (Gemini API: AI model that writes drafts, voice profiles and funnel plans)</li>
        <li><strong>Anthropic</strong> (Claude API, an alternative AI model for the same purposes)</li>
        <li><strong>Neon</strong> (database hosting)</li>
        <li><strong>Vercel</strong> (application hosting)</li>
        <li><strong>Dodo Payments</strong> (payments, invoicing and sales tax, as merchant of record)</li>
        <li><strong>Google</strong> (optional sign-in)</li>
        <li><strong>Resend</strong> (transactional email, such as password resets and review notifications)</li>
      </ul>

      <h2>Cookies</h2>
      <p>We use one essential cookie to keep you signed in. We do not use advertising or tracking cookies.</p>

      <h2>Retention and deletion</h2>
      <p>We keep your data while your account is active. Deleting your workspace in Settings permanently deletes its content and team logins. Rate-limit records are deleted within 24 hours. Billing records may be kept longer where the law requires.</p>

      <h2>Your rights</h2>
      <p>Depending on where you live, you may have the right to access, correct, export or delete your personal data, or to object to some processing. You can do most of this in the app; for anything else, contact {contactLine()}.</p>

      <h2>Security</h2>
      <p>Passwords are hashed with bcrypt, connections are encrypted, sessions can be revoked by changing your password, and review and invite links use long random tokens.</p>

      <h2>Changes</h2>
      <p>We&apos;ll post updates here and change the date above. For significant changes we&apos;ll notify account owners by email.</p>
    </LegalPage>
  );
}
