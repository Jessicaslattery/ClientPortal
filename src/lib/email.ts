import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInviteEmail({
  to,
  firstName,
  inviteUrl,
}: {
  to: string;
  firstName: string;
  inviteUrl: string;
}): Promise<void> {
  if (!resend) {
    // Dev fallback — log to console so the flow still works without an API key
    console.log("\n──────────────────────────────────────────");
    console.log("📧  INVITE EMAIL (Resend not configured)");
    console.log(`    To:  ${to}`);
    console.log(`    URL: ${inviteUrl}`);
    console.log("──────────────────────────────────────────\n");
    return;
  }

  await resend.emails.send({
    from: "Jess at Pivot Co. <hello@pivotco.com>",
    to,
    subject: "Welcome to Pivot Co. - let's get you set up",
    html: buildInviteHtml({ firstName, inviteUrl }),
  });
}

function buildInviteHtml({
  firstName,
  inviteUrl,
}: {
  firstName: string;
  inviteUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Pivot Co.</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #F2EDE4;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1A1714;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background-color:#F2EDE4; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:560px;">

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding-bottom:40px; text-align:center;">
              <span style="font-family:'Cormorant Garamond',Georgia,serif;
                font-size:26px; font-weight:300; letter-spacing:0.2em;
                color:#1A1714; text-transform:uppercase;">
                Pivot Co.
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF; border-radius:20px;
              border:1px solid #DDD5C8;
              box-shadow:0 1px 3px rgba(92,71,48,0.08);
              padding:40px 48px;">

              <p style="font-size:14px; color:#5C5550; margin-bottom:24px;">
                Hi ${firstName},
              </p>

              <p style="font-size:15px; line-height:1.7; color:#1A1714; margin-bottom:16px;">
                Welcome to Pivot Co. I'm genuinely glad to have you on board.
              </p>

              <p style="font-size:15px; line-height:1.7; color:#1A1714; margin-bottom:16px;">
                Your private dashboard is ready. this is where everything for our work together will live. Roadmap, goals, content plans, session notes, and a direct line to me.
              </p>

              <p style="font-size:15px; line-height:1.7; color:#1A1714; margin-bottom:32px;">
                To get started, set your password here:
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:32px;">
                <tr>
                  <td style="border-radius:12px; background:#1A1714;">
                    <a href="${inviteUrl}"
                      style="display:inline-block; padding:14px 32px;
                        font-family:'Inter',sans-serif; font-size:11px;
                        font-weight:500; letter-spacing:0.12em;
                        text-transform:uppercase; color:#FAFAF8;
                        text-decoration:none;">
                      Set your password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px; line-height:1.7; color:#1A1714; margin-bottom:16px;">
                Once you're in, the dashboard will walk you through everything. There's one short questionnaire to complete before our first session. It takes about 15–20 minutes and means our first call gets straight into the work, rather than starting from scratch.
              </p>

              <p style="font-size:15px; line-height:1.7; color:#1A1714; margin-bottom:32px;">
                If anything doesn't make sense or you get stuck, just message me through the portal.
              </p>

              <p style="font-size:15px; line-height:1.7; color:#1A1714;">
                Looking forward to getting started.
              </p>
              <p style="font-size:15px; font-weight:500; color:#1A1714; margin-top:8px;">
                Jess
              </p>

              <!-- Divider -->
              <hr style="border:none; border-top:1px solid #E8E2D9; margin:32px 0;" />

              <p style="font-size:12px; color:#8C8277; line-height:1.6;">
                This link expires in 48 hours. If you didn't expect this email,
                you can safely ignore it.
              </p>

              <p style="font-size:11px; color:#8C8277; margin-top:8px; word-break:break-all;">
                ${inviteUrl}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px; text-align:center;">
              <p style="font-size:11px; color:#8C8277; letter-spacing:0.06em;">
                Pivot Co. · Strategic business refinement for founder-led brands
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
