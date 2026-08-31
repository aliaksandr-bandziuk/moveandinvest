import { Link } from "@/i18n/navigation";
import { QuestionForm, type QuestionFormLabels } from "../QuestionForm";
import { CHANNELS, formatPhone, whatsappHref } from "@/lib/contactChannels";
import { ENQUIRY_HREF } from "@/lib/routes";
import { CONTROLLER, controllerIdentity } from "@/lib/controller";

import styles from "./ContactChannels.module.scss";

export interface ContactLabels {
  channelsLabel: string;
  emailLabel: string;
  emailNote: string;
  phoneLabel: string;
  phoneNote: string;
  whatsappLabel: string;
  whatsappNote: string;
  bookingLabel: string;
  bookingNote: string;
  bookingCta: string;
  socialsLabel: string;
  formHeading: string;
  formBody: string;
  // The form's own eleven strings are NOT here. They are a QuestionForm prop,
  // built once by lib/questionFormLabels.ts, because /faq renders the same form
  // without any of the channels, the booking link or the identity line above.
  enquiryLead: string;
  enquiryCta: string;
  identityLabel: string;
}

interface ContactChannelsProps {
  labels: ContactLabels;
  /** The form's own strings, already mapped and with the address substituted.
   *  Built by the page through lib/questionFormLabels.ts — see the two steps
   *  that note describes, both of which are easy to get wrong. */
  question: QuestionFormLabels;
  locale: string;
  privacyHref: string;
}

// The channels, the question form, and who you are writing to.
//
// EVERY CHANNEL IS CONDITIONAL. `CHANNELS` decides what exists; an empty value
// renders nothing at all — no row, no "coming soon", no dead link. The site has
// twice printed a way to reach it that reached nobody, and the cost of that is
// not a missing row: somebody writes, hears silence, and concludes the project
// is not real. That conclusion is much harder to reverse.
//
// THE BOOKING IS A LINK, NEVER AN EMBED. An iframe from Calendly, Cal.com or
// Google would pull a third-party script onto this domain and set third-party
// cookies, which means a consent gate, a new paragraph in the privacy policy
// naming the provider and its country, and an entry in the suppliers list. It
// buys one thing — the reader does not leave the page. Opened in a new tab,
// none of that applies. Same reason the WhatsApp link is a plain wa.me href
// rather than the official widget.
//
// THE FORM IS NOT THE ENQUIRY FORM. Its `kind` is `question`, it carries no
// jurisdiction, no budget and no consent-to-share, and the route never passes it
// to anybody. The copy says so, and the pointer at the foot sends somebody who
// actually wants an introduction to the form that can give them one.
export function ContactChannels({
  labels,
  question,
  locale,
  privacyHref,
}: ContactChannelsProps) {
  const phone = CHANNELS.phone;
  const whatsapp = whatsappHref();
  const booking = CHANNELS.booking;
  const socials = CHANNELS.socials;

  return (
    <>
      <section className={styles.channels} aria-labelledby="channels-heading">
        <h2 className={styles.sectionLabel} id="channels-heading">
          {labels.channelsLabel}
        </h2>

        <ul className={styles.list}>
          <li className={styles.item}>
            <p className={styles.itemLabel}>{labels.emailLabel}</p>
            <p className={styles.itemValue}>
              <a className={styles.itemLink} href={`mailto:${CHANNELS.email}`}>
                {CHANNELS.email}
              </a>
            </p>
            <p className={styles.itemNote}>{labels.emailNote}</p>
          </li>

          {phone ? (
            <li className={styles.item}>
              <p className={styles.itemLabel}>{labels.phoneLabel}</p>
              <p className={styles.itemValue}>
                {/* The href keeps raw E.164 because that is what a dialler
                    parses; only the visible text is grouped for reading. */}
                <a className={styles.itemLink} href={`tel:${phone}`} data-figure>
                  {formatPhone(phone)}
                </a>
              </p>
              <p className={styles.itemNote}>{labels.phoneNote}</p>
            </li>
          ) : null}

          {whatsapp ? (
            <li className={styles.item}>
              <p className={styles.itemLabel}>{labels.whatsappLabel}</p>
              <p className={styles.itemValue}>
                <a
                  className={styles.itemLink}
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-figure
                >
                  {formatPhone(`+${CHANNELS.whatsapp}`)}
                </a>
              </p>
              <p className={styles.itemNote}>{labels.whatsappNote}</p>
            </li>
          ) : null}

          {booking ? (
            <li className={styles.item}>
              <p className={styles.itemLabel}>{labels.bookingLabel}</p>
              <p className={styles.itemValue}>
                <a
                  className={styles.itemLink}
                  href={booking}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {labels.bookingCta}
                </a>
              </p>
              <p className={styles.itemNote}>{labels.bookingNote}</p>
            </li>
          ) : null}
        </ul>

        {socials.length > 0 ? (
          <p className={styles.socials}>
            <span className={styles.socialsLabel}>{labels.socialsLabel}</span>{" "}
            {socials.map((profile, index) => (
              <span key={profile.url}>
                {index > 0 ? " · " : ""}
                <a
                  className={styles.itemLink}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}

        <p className={styles.identity}>
          <span className={styles.identityLabel}>{labels.identityLabel}</span>{" "}
          {CONTROLLER.name}, <span data-figure>{controllerIdentity()}</span>
        </p>
      </section>

      <section className={styles.formSection} aria-labelledby="question-heading">
        <div className={styles.formIntro}>
          <h2 className={styles.formHeading} id="question-heading">
            {labels.formHeading}
          </h2>
          <p className={styles.formBody}>{labels.formBody}</p>

          <p className={styles.enquiry}>
            {labels.enquiryLead}{" "}
            <Link className={styles.itemLink} href={ENQUIRY_HREF}>
              {labels.enquiryCta}
            </Link>
          </p>
        </div>

        <div className={styles.formSide}>
          {/* EXTRACTED ON 31 AUGUST 2026, and this component kept the half
              that is /contacts' own: the two-column split, the heading, the
              paragraph explaining what this form is NOT, and the link out to
              the enquiry. The form itself now lives in marketing/QuestionForm
              because /faq needed the same one — see the note there.

              `returnTo` is empty here on purpose: empty means /contacts, which
              is where this form has always come back to. */}
          <QuestionForm
            labels={question}
            locale={locale}
            privacyHref={privacyHref}
            returnTo=""
          />
        </div>
      </section>
    </>
  );
}
