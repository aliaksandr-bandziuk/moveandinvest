import { createClient } from "@sanity/client";

// Writes the /for-partners copy that the seed never wrote, onto the
// partnersPage documents that are ALREADY published:
//
//   * principles     — the three terms in the hero, section 01.
//   * anatomy*       — heading, intro, the marked sample card and the six
//                      field notes, section 02.
//
//   npm run partners            # show what would change, write nothing
//   npm run partners -- --write # apply it
//
// Why this exists instead of just re-running `npm run seed`: seed uses
// createOrReplace on three singletons, so it would silently discard any edit
// made in the Studio since the last run. These documents are live. An edit to
// live content should never be a side effect of a command called "seed", and
// it should never happen without a dry run first — same reasoning as
// facts.ts, which is where this script's shape comes from.
//
// The script only SETS the fields listed below. Everything else on the
// document — heading, intro, seo, qualificationSteps — is left exactly as it
// is, including hand edits.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this, then delete it.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
  // The three singletons are published, but a draft copy may exist alongside
  // them if anyone opened the document in the Studio. `raw` sees both.
  perspective: "raw",
});

type Locale = "en" | "ru" | "pl";
const LOCALES: Locale[] = ["en", "ru", "pl"];

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

interface Principle {
  title: string;
  body: string;
}

interface AnatomyField {
  label: string;
  sample: string;
  note: string;
}

interface PartnersCopy {
  principles: Principle[];
  anatomyHeading: string;
  anatomyIntro: string;
  anatomySampleLabel: string;
  anatomySampleTag: string;
  anatomyFields: AnatomyField[];
  anatomyNote: string;
}

// Kept in step with the same strings in scripts/seed.ts. Two copies is one
// too many, and the day a third section needs this the right move is to lift
// both into a shared module under scripts/ — not to add a third copy.
const COPY: Record<Locale, PartnersCopy> = {
  en: {
    principles: [
      {
        title: "One partner per jurisdiction",
        body: "The enquiry does not go to a second recipient and is never resold.",
      },
      {
        title: "No commission on a closing",
        body: "We take no share of your fee and claim no percentage of the deal.",
      },
      {
        title: "You name the terms",
        body: "There is no price list on this site: we ask the market first and do the arithmetic after.",
      },
    ],
    anatomyHeading: "What is inside an enquiry",
    anatomyIntro:
      "Below is a sample. Not a real enquiry: the site is launching, and we have neither the material nor the right to show somebody else's data.",
    anatomySampleLabel: "What an enquiry looks like",
    anatomySampleTag: "sample",
    anatomyFields: [
      {
        label: "Jurisdiction",
        sample: "Portugal",
        note: "A named country, not «somewhere in Europe». They arrived at it through a table of thresholds and timelines, not through an advertisement.",
      },
      {
        label: "Budget ceiling",
        sample: "up to €500,000",
        note: "Not «how much are you ready to invest» but an upper limit. The wording is deliberate: it does not nudge anyone towards a larger figure.",
      },
      {
        label: "Timeline",
        sample: "within six months",
        note: "One of four answers, «just looking for now» among them. We do not hide that option: an enquiry six months out, passed on as live, costs you time.",
      },
      {
        label: "Goal",
        sample: "residency for the family · property as an investment",
        note: "Several may be ticked: residency for the family, tax position, an EU passport in time, business and banking, property as an investment. The combination is what makes a case concrete.",
      },
      {
        label: "In their own words",
        sample:
          "«Belarusian citizenship, family of four, income from the EU. We looked at funds but want to understand what buying property actually gives us.»",
        note: "Citizenship, family, where the income comes from, what they have already tried. The field is optional — and it is usually the one that decides whether the case is worth your hour.",
      },
      {
        label: "Name and email",
        sample: "They give their name",
        note: "You answer a person by name, someone who was reading about Portugal an hour ago, not «enquiry #1428». A willingness to be named is a filter in itself.",
      },
    ],
    anatomyNote:
      "We verify neither the budget, nor the source of funds, nor the readiness to act. This is what a person says about themselves. «Qualified» here means «the questions are answered», not «the facts are confirmed» — verification is yours, and we do not pretend to have done it for you.",
  },
  ru: {
    principles: [
      {
        title: "Один партнёр на юрисдикцию",
        body: "Заявка не уходит второму адресату и не перепродаётся.",
      },
      {
        title: "Без комиссии со сделки",
        body: "Мы не участвуем в вашем гонораре и не претендуем на процент.",
      },
      {
        title: "Условия называете вы",
        body: "Прайса на сайте нет: сначала спрашиваем рынок, потом считаем.",
      },
    ],
    anatomyHeading: "Что внутри заявки",
    anatomyIntro:
      "Ниже — образец. Не реальное обращение: сайт запускается, и показывать чужие данные нам пока не из чего и незачем.",
    anatomySampleLabel: "Как выглядит заявка",
    anatomySampleTag: "образец",
    anatomyFields: [
      {
        label: "Юрисдикция",
        sample: "Португалия",
        note: "Названная страна, а не «куда-нибудь в Европу». Человек дошёл до неё через таблицу с суммами и сроками, а не через рекламу.",
      },
      {
        label: "Потолок бюджета",
        sample: "до €500 000",
        note: "Не «сколько готовы вложить», а верхняя граница. Формулировка выбрана специально: она не подталкивает называть цифру побольше.",
      },
      {
        label: "Срок",
        sample: "до полугода",
        note: "Один из четырёх ответов, включая «пока просто смотрю». Мы не прячем этот вариант: заявка на полгода вперёд, поданная как горячая, стоит вам времени.",
      },
      {
        label: "Цель",
        sample: "ВНЖ для семьи · недвижимость как инвестиция",
        note: "Можно отметить несколько: ВНЖ для семьи, налоговая позиция, паспорт ЕС в перспективе, бизнес и банк, недвижимость как инвестиция. Сочетание и делает случай конкретным.",
      },
      {
        label: "Своими словами",
        sample:
          "«Гражданство Беларуси, семья из четырёх, доход из ЕС. Смотрели фонды, но хотим понять, что реально даёт покупка жилья.»",
        note: "Гражданство, состав семьи, откуда доход, что уже пробовали. Поле не обязательное — и именно оно чаще всего решает, стоит ли случай вашего часа.",
      },
      {
        label: "Имя и почта",
        sample: "Человек называет себя",
        note: "Вы отвечаете не «заявке №1428», а человеку по имени, который час назад читал про Португалию. Готовность назваться — сама по себе фильтр.",
      },
    ],
    anatomyNote:
      "Мы не проверяем ни бюджет, ни источник средств, ни готовность действовать. Это слова человека о себе. «Квалифицированная» здесь значит «на вопросы отвечено», а не «сведения подтверждены» — проверка ваша, и мы не делаем вид, что сделали её за вас.",
  },
  pl: {
    principles: [
      {
        title: "Jeden partner na jurysdykcję",
        body: "Zapytanie nie trafia do drugiego odbiorcy i nigdy nie jest odsprzedawane.",
      },
      {
        title: "Bez prowizji od transakcji",
        body: "Nie uczestniczymy w Twoim honorarium i nie rościmy sobie procentu.",
      },
      {
        title: "Warunki podajesz Ty",
        body: "Na stronie nie ma cennika: najpierw pytamy rynek, potem liczymy.",
      },
    ],
    anatomyHeading: "Co jest w zapytaniu",
    anatomyIntro:
      "Poniżej — próbka. Nie prawdziwe zgłoszenie: serwis dopiero startuje, a cudzych danych nie mamy z czego i po co pokazywać.",
    anatomySampleLabel: "Jak wygląda zapytanie",
    anatomySampleTag: "próbka",
    anatomyFields: [
      {
        label: "Jurysdykcja",
        sample: "Portugalia",
        note: "Konkretny kraj, a nie «gdzieś w Europie». Czytelnik doszedł do niego przez tabelę z kwotami i terminami, a nie przez reklamę.",
      },
      {
        label: "Pułap budżetu",
        sample: "do €500 000",
        note: "Nie «ile jesteś gotów zainwestować», lecz górna granica. Sformułowanie jest celowe: nie zachęca do podania wyższej liczby.",
      },
      {
        label: "Termin",
        sample: "do pół roku",
        note: "Jedna z czterech odpowiedzi, w tym «na razie tylko się rozglądam». Nie ukrywamy tej opcji: zapytanie na pół roku naprzód, przekazane jako gorące, kosztuje Twój czas.",
      },
      {
        label: "Cel",
        sample: "rezydencja dla rodziny · nieruchomość jako inwestycja",
        note: "Można zaznaczyć kilka: rezydencja dla rodziny, pozycja podatkowa, paszport UE w perspektywie, biznes i bank, nieruchomość jako inwestycja. To zestawienie czyni sprawę konkretną.",
      },
      {
        label: "Własnymi słowami",
        sample:
          "«Obywatelstwo Białorusi, rodzina czteroosobowa, dochód z UE. Patrzyliśmy na fundusze, ale chcemy zrozumieć, co realnie daje zakup mieszkania.»",
        note: "Obywatelstwo, skład rodziny, skąd dochód, co już próbowali. Pole nieobowiązkowe — i to ono najczęściej decyduje, czy sprawa jest warta Twojej godziny.",
      },
      {
        label: "Imię i e-mail",
        sample: "Człowiek się przedstawia",
        note: "Odpowiadasz nie «zapytaniu nr 1428», lecz osobie z imienia, która godzinę temu czytała o Portugalii. Gotowość, by się przedstawić, sama w sobie jest filtrem.",
      },
    ],
    anatomyNote:
      "Nie weryfikujemy ani budżetu, ani źródła środków, ani gotowości do działania. To słowa człowieka o sobie. «Kwalifikowane» znaczy tu «na pytania odpowiedziano», a nie «dane potwierdzono» — weryfikacja należy do Ciebie, a my nie udajemy, że zrobiliśmy ją za Ciebie.",
  },
};

interface PartnersDoc {
  _id: string;
  language?: string;
  principles?: unknown[];
  anatomyFields?: unknown[];
}

async function run() {
  const write = process.argv.slice(2).includes("--write");

  const docs = await client.fetch<PartnersDoc[]>(
    `*[_type == "partnersPage"] | order(_id asc){ _id, language, principles, anatomyFields }`,
  );

  if (docs.length === 0) {
    console.error("No partnersPage documents found. Run `npm run seed` first.");
    process.exit(1);
  }

  const transaction = client.transaction();
  let planned = 0;
  const skipped: string[] = [];

  for (const doc of docs) {
    if (!isLocale(doc.language)) {
      skipped.push(`${doc._id} (no language)`);
      continue;
    }

    const copy = COPY[doc.language];
    const had = [
      doc.principles?.length ? "principles" : null,
      doc.anatomyFields?.length ? "anatomy" : null,
    ].filter(Boolean);

    console.log(
      `  ${doc._id.padEnd(24)} ${(had.length ? had.join("+") : "empty").padStart(18)}  ->  principles+anatomy`,
    );

    transaction.patch(doc._id, {
      set: {
        // _key is required on every array member; without it the Studio
        // cannot reorder the list and React cannot keep the rows apart.
        principles: copy.principles.map((principle, i) => ({
          _key: `p${i + 1}`,
          ...principle,
        })),
        anatomyHeading: copy.anatomyHeading,
        anatomyIntro: copy.anatomyIntro,
        anatomySampleLabel: copy.anatomySampleLabel,
        anatomySampleTag: copy.anatomySampleTag,
        anatomyFields: copy.anatomyFields.map((field, i) => ({
          _key: `f${i + 1}`,
          ...field,
        })),
        anatomyNote: copy.anatomyNote,
      },
    });
    planned += 1;
  }

  if (skipped.length > 0) {
    console.log(`\nskipped: ${skipped.join(", ")}`);
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run partners -- --write`,
    );
    return;
  }

  await transaction.commit();
  console.log(`\nPatched ${planned} document(s).`);
  console.log("Reload /for-partners — section 02 should now render.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
