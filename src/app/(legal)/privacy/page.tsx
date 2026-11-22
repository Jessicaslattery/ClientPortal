export const metadata = { title: "Privacy Policy · Pivot Co." };

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-legal">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">Legal</p>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-[#7a7268]">Last updated: 26 October 2026</p>

      <p>Pivot Co ("Consultant", "we", "us") is committed to protecting the privacy of clients, prospective clients and website visitors ("you"). This Privacy Policy explains what personal information we collect, how we use it, who we share it with, and the choices you have. It applies across our website, client portal, forms, calls, messaging and social channels.</p>

      <p>This Policy should be read alongside our Terms and Conditions. Where the two conflict on a privacy matter, this Policy applies.</p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide to Us</h3>
      <ul>
        <li>Contact details: name, email, phone number and business name</li>
        <li>Business information: details about your business, goals, challenges, operations and performance, provided through onboarding forms, check-ins, calls, messages or the client portal</li>
        <li>Account and analytics access: information from social media or business accounts you give us access to, such as analytics and performance data</li>
        <li>Payment information: processed directly by Stripe. We do not store full card details ourselves</li>
        <li>Portal data: tasks, goals, check-ins, messages, content plans, reports, deliverables, and call and session notes</li>
        <li>Communications: emails, WhatsApp messages and other correspondence with us</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>Website usage data through analytics tools, such as pages visited, time on site and referral source</li>
        <li>Cookies or similar technologies used for website functionality and analytics (see Section 7)</li>
      </ul>

      <h3>1.3 Call Recordings</h3>
      <p>With your consent under our Terms and Conditions, calls may be recorded and transcribed for internal review, support and team training, including through our note-taking tools.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To deliver the services you have engaged us for, including strategy calls, roadmaps, audits, social media plans, analytics reports and captions</li>
        <li>To communicate with you, including scheduling, check-ins and support</li>
        <li>To process payments and manage billing through Stripe</li>
        <li>To improve our services, including using de-identified information to spot patterns across clients and inform our offers and content</li>
        <li>To share client wins, progress and testimonials for marketing, where you have consented and with details anonymised on request</li>
        <li>To meet legal, tax, accounting and regulatory obligations</li>
      </ul>

      <h2>3. Use of AI and Software Tools</h2>
      <ul>
        <li>We use artificial intelligence tools, including Claude by Anthropic and Gemini by Google, to help prepare plans, reports, session notes and other deliverables</li>
        <li>Your information is entered into these tools only as needed to deliver your services</li>
        <li>All AI-assisted work is reviewed by us or our team before it is provided to you</li>
        <li>We do not use AI tools to make automated decisions that have a legal or similarly significant effect on you</li>
      </ul>

      <h2>4. Who We Share Information With</h2>
      <p>We do not sell your personal information. We share information with the following service providers, only as needed to run our business and deliver your services:</p>
      <ul>
        <li>Payments: Stripe</li>
        <li>Email, scheduling and file storage: Google Workspace (Gmail, Google Calendar, Google Drive)</li>
        <li>Client and project management: Monday.com and our client portal</li>
        <li>Meeting notes and transcription: Gemini by Google</li>
        <li>AI assistance: Claude by Anthropic and Gemini by Google</li>
        <li>Website hosting: Netlify</li>
        <li>Our team: team members and contractors who help deliver your services, under confidentiality obligations</li>
      </ul>
      <p>Each provider processes information under its own privacy and security terms. We only give them the information needed for the relevant purpose.</p>

      <h2>5. Overseas Disclosure</h2>
      <ul>
        <li>Pivot Co is based in Australia and works with clients in many countries</li>
        <li>Your information may be stored, processed or accessed outside Australia, including by our service providers (many of which are based in the United States) and by team members or contractors located in other countries</li>
        <li>Where this happens, we take reasonable steps to ensure your information continues to be handled in line with this Policy and the Australian Privacy Principles</li>
        <li>If you are located outside Australia, privacy laws in your country may also give you rights over your information. We will take reasonable steps to respect those rights</li>
      </ul>

      <h2>6. Data Storage and Security</h2>
      <ul>
        <li>We take reasonable technical and organisational steps to protect your information from unauthorised access, loss or misuse, including secure logins and two-factor authentication where available</li>
        <li>Access to client information, including portal data, is limited to those who need it to deliver your services</li>
        <li>No method of storage or transmission is completely secure, so we cannot guarantee absolute security</li>
      </ul>

      <h2>7. Cookies and Website Analytics</h2>
      <ul>
        <li>Our website may use cookies or similar technologies to support functionality and understand how visitors use the site</li>
        <li>You can control or disable cookies in your browser settings. Some features may not work as intended if you do</li>
      </ul>

      <h2>8. Data Retention</h2>
      <ul>
        <li>We keep your information while we are delivering services to you</li>
        <li>After our agreement ends, we keep your information for 12 months, then delete or de-identify it</li>
        <li>Some records, such as tax and financial records, may be kept longer where the law requires</li>
        <li>You may ask us to delete your information earlier, subject to any legal retention requirements</li>
      </ul>

      <h2>9. Your Rights</h2>
      <p>Under the Privacy Act 1988 (Cth) and the Australian Privacy Principles, you may:</p>
      <ul>
        <li>Request access to the personal information we hold about you</li>
        <li>Request correction of inaccurate or outdated information</li>
        <li>Request deletion of your information, subject to our legal, accounting and contractual obligations</li>
        <li>Ask questions about how your information is handled</li>
        <li>Make a complaint about how we have handled your information</li>
      </ul>
      <p>To make a request or complaint, contact us using the details in Section 11. We will respond within 30 days. If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>.</p>

      <h2>10. Changes to This Policy</h2>
      <p>We may update this Policy from time to time. The "Last updated" date at the top shows the most recent version. We will let active clients know about any significant changes.</p>

      <h2>11. Contact Us</h2>
      <p>For any privacy questions, requests or complaints, email <a href="mailto:jess@pivotco.com.au">jess@pivotco.com.au</a>.</p>
    </article>
  );
}
