import type { Locale } from "./jurisdictions";

// The head of /golden-visa: eyebrow, headline, deck and the paragraph above the
// names table. Same split as /sources and /changes — the page's substance is
// read from src/lib/goldenVisaNames.ts and from the jurisdiction registry, and
// only the prose about the page lives here.
//
// WHY THE DECK LEADS WITH THE DEFINITION AND NOT WITH A BENEFIT. Everyone else
// in this market opens with what the permit gets you. The reader arriving on
// "what is a golden visa" has not decided they want one; they are working out
// what the words mean, and a page that sells before it defines is the page they
// bounce from. Define first, name the four real instruments second, and let the
// comparison live where comparisons live.
export interface GoldenVisaPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  namesNote: string;
  seo: { metaTitle: string; metaDescription: string };
}

export const GOLDEN_VISA_PAGE_COPY: Record<Locale, GoldenVisaPageCopy> = {
  en: {
    eyebrow: "The term",
    heading:
      "What is a golden visa, and what each state actually calls it",
    intro:
      "A residence permit granted because you placed a defined amount of money in the country — not because you have a job offer there, family there, or protection needs. That is the whole of the idea. It is not a passport, it is not a travel visa, and it is not one programme: four of the five jurisdictions compared here grant a different instrument under a different law, and none of those laws uses the words golden visa.",
    namesNote:
      "Golden passport, golden residency and visa by investment are the same nickname wearing different clothes, and none of them is a status anyone can hold. What a holder actually holds is one of the four below. Cyprus has no row because its regulation could not be established from any primary source, and a name we have not read is a name we do not print.",
    seo: {
      metaTitle: "What is a golden visa, really — moveandinvest",
      metaDescription:
        "A golden visa is a residence permit granted against an investment — and no state calls it that. The four real instruments, what each runs for, and where the thresholds stand.",
    },
  },
  ru: {
    eyebrow: "Термин",
    heading:
      "Что такое золотая виза и как это называется в законе каждой страны",
    intro:
      "Это вид на жительство, который дают за то, что вы вложили в страну определённую сумму, — а не за приглашение на работу, семью или потребность в защите. В этом вся суть. Это не паспорт, не туристическая виза и не одна программа: четыре из пяти юрисдикций, которые сравнивает этот сайт, выдают разные документы по разным законам, и ни в одном из этих законов слов «золотая виза» нет.",
    namesNote:
      "«Золотой паспорт», «золотое резидентство» и «ВНЖ за инвестиции» — это одно и то же рекламное имя в разной одежде, и ни одно из них не является статусом, который можно получить. На руках у человека оказывается один из четырёх документов ниже. Строки по Кипру нет: его регламент не удалось установить ни по одному первоисточнику, а название, которого мы не читали, мы не печатаем.",
    seo: {
      metaTitle: "Что такое золотая виза, если по существу — moveandinvest",
      metaDescription:
        "Золотая виза — это ВНЖ за инвестиции, и ни одно государство её так не называет. Четыре настоящих документа, на какой срок каждый и какие пороги действуют сейчас.",
    },
  },
  pl: {
    eyebrow: "Termin",
    heading:
      "Czym jest złota wiza i jak nazywa ją prawo każdego z tych państw",
    intro:
      "To zezwolenie na pobyt wydane dlatego, że ulokowałeś w kraju określoną kwotę — a nie dlatego, że masz tam ofertę pracy, rodzinę czy potrzebę ochrony. To cała idea. To nie paszport, nie wiza turystyczna i nie jeden program: cztery z pięciu porównywanych tu jurysdykcji wydają inny dokument na podstawie innej ustawy, a w żadnej z nich nie pada określenie „złota wiza”.",
    namesNote:
      "„Złoty paszport”, „złota rezydencja” i „wiza za inwestycję” to ta sama marketingowa nazwa w innym ubraniu i żadna z nich nie jest statusem, który można posiadać. Posiadacz trzyma w ręku jeden z czterech dokumentów poniżej. Cypru nie ma w tabeli, bo jego rozporządzenia nie udało się ustalić w żadnym źródle pierwotnym, a nazwy, której nie przeczytaliśmy, nie drukujemy.",
    seo: {
      metaTitle: "Czym właściwie jest złota wiza — moveandinvest",
      metaDescription:
        "Złota wiza to zezwolenie na pobyt za inwestycję — i żadne państwo tak jej nie nazywa. Cztery prawdziwe instrumenty, na jaki okres każdy i jakie progi obowiązują.",
    },
  },
};
