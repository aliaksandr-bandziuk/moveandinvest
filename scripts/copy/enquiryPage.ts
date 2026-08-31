import type { Locale } from "./jurisdictions";

// The HEAD of /enquiry, in three languages. Ordinary page copy, editable in
// Studio like every other page's head.
//
// WHAT IS NOT HERE: the three steps under the heading — what happens after the
// button is pressed — and the commercial disclosure that goes with them. Those
// live in messages/{en,ru,pl}.json, code-owned, for the same reason the rule
// changes live in src/lib/changeData.ts rather than in a Studio field: they are
// promises about what this business actually does with an enquiry, and a
// promise editable in Studio is one that can be changed without anybody
// changing the thing it describes.
//
// THE HEADING NAMES THE EXCHANGE, BOTH HALVES OF IT. What the reader gives and
// what they get back, in one line, understandable with the page not there —
// which is the standard /changes had to be taught twice. "Get in touch" or
// "Enquiry" would name neither half; "Find a lawyer" would name only the second
// and would also be a promise this site is not allowed to make, because finding
// one and being introduced to one are different things and only the second is
// on offer.
//
// THE DECK LEADS WITH WHAT WE ARE NOT. Not modesty — it is the first thing a
// reader arriving from a guide needs to know, because five long articles full
// of statute references read like a law firm wrote them, and a reader who
// thinks they are writing to their lawyer is a reader who has been misled about
// who is answering. It says it before the form, not in the fine print under it.
//
// AND IT SAYS WHO PAYS. The firm does, on an introduction it accepts; the
// reader never does. That disclosure is on the page for two reasons that point
// the same way: a reader deciding whether to trust a comparison is entitled to
// know how it is funded, and a commercial relationship that steers a
// recommendation is exactly what EU Directive 2005/29/EC obliges a trader to
// disclose. Stating it plainly costs nothing here and would cost a great deal
// to have omitted.

export interface EnquiryPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  seo: { metaTitle: string; metaDescription: string };
}

export const ENQUIRY_PAGE_COPY: Record<Locale, EnquiryPageCopy> = {
  en: {
    eyebrow: "Enquiry",
    heading:
      "Tell us your situation and we find you a licensed immigration or tax firm",
    intro:
      "We are not a law firm, we employ no lawyers, and nothing on this site is legal advice. What we do is read what you send, work out which of the five jurisdictions compared here actually fits it, and introduce you to one licensed firm working in that country. The firm pays us if it takes the introduction. You pay nothing, at any point, and no figure on this site is behind this form.",
    seo: {
      metaTitle: "Send an enquiry — moveandinvest",
      metaDescription:
        "Describe what you are trying to do and we introduce you to one licensed immigration or tax firm in the jurisdiction that fits. Free to you, and only with your consent.",
    },
  },
  ru: {
    eyebrow: "Заявка",
    heading:
      "Опишите ситуацию — мы найдём лицензированную юридическую или налоговую фирму",
    intro:
      "Мы не юридическая фирма, у нас нет юристов, и ничего на этом сайте не является юридической консультацией. Мы читаем то, что вы присылаете, разбираемся, какая из пяти сравниваемых здесь юрисдикций вам действительно подходит, и знакомим вас с одной лицензированной фирмой, которая работает в этой стране. Фирма платит нам, если берёт обращение. Вы не платите ничего и никогда, и ни одна цифра на этом сайте не спрятана за этой формой.",
    seo: {
      metaTitle: "Оставить заявку — moveandinvest",
      metaDescription:
        "Опишите, что вы хотите сделать, и мы познакомим вас с одной лицензированной юридической или налоговой фирмой в подходящей юрисдикции. Для вас бесплатно и только с вашего согласия.",
    },
  },
  pl: {
    eyebrow: "Zgłoszenie",
    heading:
      "Opisz sytuację, a znajdziemy licencjonowaną kancelarię imigracyjną lub podatkową",
    intro:
      "Nie jesteśmy kancelarią, nie zatrudniamy prawników i nic na tej stronie nie jest poradą prawną. Czytamy to, co przysyłasz, ustalamy, która z pięciu porównywanych tu jurysdykcji naprawdę pasuje, i kierujemy do jednej licencjonowanej kancelarii działającej w tym kraju. Kancelaria płaci nam, jeśli podejmie sprawę. Ty nie płacisz nic i na żadnym etapie, a żadna liczba na tej stronie nie jest schowana za tym formularzem.",
    seo: {
      metaTitle: "Wyślij zapytanie — moveandinvest",
      metaDescription:
        "Opisz, co chcesz zrobić, a skierujemy Cię do jednej licencjonowanej kancelarii imigracyjnej lub podatkowej w pasującej jurysdykcji. Dla Ciebie bezpłatnie i wyłącznie za Twoją zgodą.",
    },
  },
};
