import nodemailer from "nodemailer";

// Answers one question and nothing else: can this machine, with the
// credentials in .env.local, actually send mail through the relay?
//
//   npm run mailcheck            # connect and authenticate, send nothing
//   npm run mailcheck -- --send  # also send one test message to yourself
//
// It exists because when an enquiry arrives and no email does, there are four
// candidate causes and they need different fixes: the variables are not
// loaded, the credentials are wrong, the relay refused the connection, or the
// message was accepted and filed as spam. The app cannot tell you which —
// it stores the enquiry and logs one line. This tells you which.
//
// The settings below are READ FROM the same constants the app uses, by
// duplicating them here deliberately rather than importing sender.ts: that
// module is server-only Next code with an "@/" alias that a plain tsx run
// does not resolve. Three lines duplicated, and if they ever disagree with
// sender.ts this script is lying — so change both or neither.
const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true;

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

// Length and shape, never the value — the same discipline sender.ts keeps in
// its log lines. The shape matters because the two ways a .env value is
// commonly wrong are both invisible otherwise: quotation marks copied in with
// the password, and a trailing space picked up from a paste.
function describeSecret(value: string): string {
  const notes: string[] = [`${value.length} characters`];
  if (/^["']|["']$/.test(value)) notes.push("STARTS OR ENDS WITH A QUOTE — remove them");
  if (value !== value.trim()) notes.push("HAS LEADING OR TRAILING WHITESPACE — remove it");
  return notes.join(", ");
}

async function run() {
  console.log(`relay      ${SMTP_HOST}:${SMTP_PORT} (secure: ${SMTP_SECURE})`);
  console.log(`EMAIL_USER ${user ?? "— NOT SET"}`);
  console.log(`EMAIL_PASSWORD ${pass ? `set — ${describeSecret(pass)}` : "— NOT SET"}`);

  if (!user || !pass) {
    console.error(
      `\nThe variables are not reaching this process. The usual cause is that they were\n` +
        `written into .env.example instead of .env.local — .env.example is a template\n` +
        `that is committed and read by nobody. Put both in .env.local, and on the host\n` +
        `into its own environment settings, then run this again.`,
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user, pass },
    logger: true,
    debug: true,
  });

  console.log(`\n--- connecting and authenticating (full SMTP dialogue below) ---\n`);

  try {
    await transporter.verify();
    console.log(`\nOK. The relay accepted these credentials.`);
  } catch (error) {
    console.error(`\nFAILED at connect or authentication:`);
    console.error(error instanceof Error ? error.message : error);
    console.error(
      `\nRead the dialogue above. "535" or "Invalid login" means the mailbox or the\n` +
        `password is wrong — Hostinger wants the FULL address as the username.\n` +
        `A timeout or ECONNREFUSED means nothing reached the relay at all: some home\n` +
        `and office networks block outbound port 465.`,
    );
    process.exit(1);
  }

  if (!process.argv.slice(2).includes("--send")) {
    console.log(`\nNo message sent. Add --send to put one in your own inbox:\n  npm run mailcheck -- --send`);
    return;
  }

  const info = await transporter.sendMail({
    from: user,
    to: user,
    subject: "mailcheck — moveandinvest",
    text:
      "If this is in your inbox, the relay works and the site's notifications will " +
      "reach you. If you had to find it in spam, that is the thing to fix next: " +
      "the domain needs SPF and DKIM records.",
  });

  console.log(`\nAccepted by the relay.`);
  console.log(`  message id  ${info.messageId}`);
  console.log(`  accepted    ${JSON.stringify(info.accepted)}`);
  console.log(`  rejected    ${JSON.stringify(info.rejected)}`);
  console.log(`  response    ${info.response}`);
  console.log(
    `\nAccepted is not delivered. If it is not in the inbox within a minute, look in\n` +
      `spam — a message from a domain with no SPF or DKIM record very often lands there.`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
