import type { QuestionFormLabels } from "@/components/marketing";
import type { QuestionFormCopy } from "@/sanity/types";

// ONE MAPPING FROM THE contactsPage DOCUMENT TO THE QUESTION FORM'S LABELS,
// because the form is on two pages since 31 August 2026 and the mapping has one
// step in it that is easy to get wrong twice.
//
// THE STEP: `emailLabel`. The contacts document has two fields with almost that
// name — `emailLabel`, which is the row in the channel list that prints an
// address, and `emailFieldLabel`, which is the label over an input. A mapping
// written by spread takes the first and puts "Email us" over a text field. It
// is written out here once instead.
//
// THE OTHER STEP: the address. `broke.body` carries a `{email}` placeholder and
// never a typed address. That rule exists because the site once printed a
// hello@ address that no mailbox answered — see the note in lib/controller.ts —
// and a second copy of this substitution is a second chance to reintroduce it.
export function questionFormLabels(
  copy: QuestionFormCopy,
  email: string,
): QuestionFormLabels {
  return {
    nameLabel: copy.nameLabel,
    emailLabel: copy.emailFieldLabel,
    emailPlaceholder: copy.emailPlaceholder,
    messageLabel: copy.messageLabel,
    honeypotLabel: copy.honeypotLabel,
    submitLabel: copy.submitLabel,
    fine: copy.fine,
    privacyLabel: copy.privacyLabel,
    sent: copy.sent,
    error: copy.error,
    broke: {
      title: copy.broke.title,
      body: copy.broke.body.replace("{email}", email),
    },
  };
}
