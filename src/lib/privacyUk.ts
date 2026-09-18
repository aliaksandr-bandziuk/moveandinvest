// THE PRIVACY PAGE FOR THE UKRAINIAN SECTION: the Russian policy, with ONE
// section in Ukrainian. Permitted by the owner on 18 September 2026, and only
// this: the policy, the banner and the consent constants are otherwise frozen
// (CLAUDE.md, "The residence form (Poland)").
//
// Why this section and no other: it is the one that describes the only form a
// Ukrainian page carries — the residence form — and it is where that form's
// consent line sends the reader. The rest of the policy is the same document
// in Russian, which is what a reader who follows any other link from the
// Ukrainian section is reading anyway.
//
// The text is a translation of the Russian section in scripts/copy/privacy.ts
// and must say exactly what that section says. If that section changes — which
// takes the owner lifting the freeze again — this one changes in the same
// commit. It lives here and not beside it because the app cannot import from
// scripts/.

/** The Russian section this one stands in for, matched by its heading. */
export const RU_POLAND_PRIVACY_HEADING = "Если вы пишете нам о деле в Польше";

export const UK_POLAND_PRIVACY_SECTION = {
  heading: "Якщо ви пишете нам про справу в Польщі",
  body:
    "Сторінки про життя в Польщі — про перебування, купівлю нерухомості, власну фірму, банківський рахунок — закінчуються окремою формою для тих, хто вже там живе. Окрім переліченого вище, вона може запитати ваше громадянство, на чому зараз тримається ваше перебування в Польщі, з чим ваша справа (одна з цих чотирьох тем або інше), чи вже спливає якийсь строк, а також телефон або ім'я в месенджері. Усе це необов'язкове. Позначка згоди в цій формі передає заявку одній консультаційній фірмі в Польщі, яка веде справи іноземців із цих тем, — не адвокатській конторі й не партнерові в жодній із п'яти юрисдикцій, — і більше нікому. Підстава обробки, строк зберігання, видалення і ваші права ті самі, що й для будь-якої заявки, і жодна з цих відповідей ніколи не передається інструментам вимірювання чи реклами.",
} as const;

/** One line above the policy, in Ukrainian, saying which part of it is. Not
 *  policy text: it describes the page, and it is the only way a Ukrainian
 *  reader learns why the rest is in Russian. */
export const UK_PRIVACY_NOTE =
  "Розділ про форму на українських сторінках сайту — українською, нижче в переліку. Решта політики — російською; англійською і польською вона така сама.";
