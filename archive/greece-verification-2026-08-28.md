# Greece: what was checked, where it was read, and what could not be established

**Checked:** 28 August 2026
**Scope:** the Greek relocation guide — the investor permit, the permit for holders of sufficient resources, the two permanent statuses, naturalisation, and the three special tax regimes.
**Companion documents:** `portugal-verification-2026-08-28.md`, `costofliving-verification-2026-08-28.md`.

---

## 0. How to read the tiers

Every finding below carries one of five tiers. They are not decoration: the guide is allowed to state a tier A or B finding flatly, must attribute a tier C one, and must say out loud that it does not know a tier D one.

| Tier | Meaning |
| --- | --- |
| A | The operative statutory text, read article by article. |
| B | A government or authority page explaining its own rules. |
| C | A law firm, trade publication or news outlet. |
| D | Could not be established. |
| E | Asserted only by parties who sell the thing. Not usable. |

**One caveat governs the whole document, and it is not small.** No page of the Government Gazette was read. Every Greek statutory text below comes from `taxheaven.gr`, a commercial database that reproduces consolidated law article by article. For article 95 the consolidation was compared against the amending law's own wording and the two matched exactly, which is real evidence the reproduction is current and faithful. It is still a reproduction. Where the standard is the Gazette itself, none of this clears it, and the guide says so on the page rather than here.

The Greek gazette publishes only a search form and viewer URLs carrying a session token, so no durable official link to a ΦΕΚ page exists to give. That is a fact about the gazette, not an excuse — but it is why the citation beside each URL names the law, article and gazette number, which is the reference a reader can actually check.

---

## 1. Corrections to this project's own earlier statements

These come first because they are the expensive ones. Each was published, or was about to be, and is wrong.

**1.1 "Law 5225/2025" does not appear to exist.** This number was used in an internal research prompt as the 2025 amending law of the Migration Code. Neither it nor the variant 5255/2025 could be verified as a real law touching the Code. The February 2026 amending law is **Law 5275/2026, ΦΕΚ Α΄ 17/06.02.2026**. Nothing carrying the number 5225/2025 may be printed. **Tier D on the existence of any such law; tier A on 5275/2026.**

**1.2 The Μ.1 status is not in articles 160–161.** Stated internally as such and wrong. The conditions are in **article 144**, the grant in **article 145**, the scope and exclusions in **article 143**. Article 160 is the proof of Greek. Article 161 is the Μ.2 ten-year permit. **Tier A.**

**1.3 Article 5A's prior non-residence test is seven years of the last eight, not five of six.** Five of six is the test in 5B and 5C. Article 5A §1(a): «δεν ήταν φορολογικός κάτοικος της Ελλάδος τα προηγούμενα επτά (7) από τα οκτώ (8) έτη». **Tier A.**

**1.4 The article numbering of the tax regimes, confirmed.** 5A is the €100,000 lump sum. 5B is the 7% for foreign pensioners. 5C is the 50% exemption for relocating employees and self-employed. An earlier internal draft had 5C as the pensioners' regime. **Tier A.**

**1.5 The site's own sources page said the golden visa does not count towards the article 5A investment. It does.** Article 5A §1(b) names the qualifying assets expressly — «σε ακίνητα ή επιχειρήσεις ή κινητές αξίες ή μετοχές ή μερίδια» — and real estate is the first of them. A property bought for the permit is real estate like any other.

What the permit does not do is excuse the investment. The fourth sentence of §1 provides: «Δεν απαιτείται να συντρέχει η προϋπόθεση της περ. β', εφόσον πρόκειται για φυσικό πρόσωπο που έχει αποκτήσει και διατηρεί άδεια διαμονής για επενδυτική δραστηριότητα στην Ελλάδα, σύμφωνα με τις διατάξεις του άρθρου 16 του ν. 4251/2014, όπως ισχύει.» That names article 16 and nothing else.

And article 16 of Law 4251/2014 was never the golden visa. It was the permit for investment *activity*; the property permit was article 20 §Β. The Athens Bar Association's correspondence table between the two codes maps article 16 onto **articles 96, 97 and 99** of Law 5038/2023, and article 20 §Β onto **article 100**. So the waiver did not reach a property investor even while the old code was in force. **Tier A on §1(b) and on the waiver's wording; tier B/C on the correspondence table.**

The correction was made to `src/lib/sourceData.ts` on 28 August 2026 with the reasoning in a comment beside it.

**1.6 The sources page stated one check date for the whole page, and that had stopped being true. Fixed.** `CHECKED_ON` said 23 August 2026 while three rows had been read again since — the Greek §7A row on 25 August, the Emirati cost row and the Greek article 5A row on 28 August — with each correction recorded only in a code comment the reader never sees. A page whose whole claim is traceability was telling readers something slightly false about its own freshness, which is the exact pattern it audits other sites for.

The fix is a **baseline plus overrides**: `CHECK_DATES` keyed by ISO date, an optional `checked` on a claim, and the date rendered under the verdict chip only on rows that carry one. The two alternatives were rejected for reasons worth recording. A date on every row would be a column of thirty-three identical strings, which is how the three that differ would stop being visible. A "last corrected" line per section would say that something in the section changed without saying what, so a corrected row and an untouched one would still look alike — which is the problem, not a fix for it.

Three further changes came out of it. The foot of the page used to render a bare date under a rule, with no sentence; it now reads "Every row was checked against a primary source on 23 August 2026, except where a row carries a date of its own." The Emirati row's finding opened with "Rechecked on 28 August 2026" in all three languages; that date is structural now, so the prose drops it. And the page's JSON-LD carried only `datePublished`, which told an aggregator that its newest fact was as old as its oldest; it now carries `dateModified` as well.

*Not verified: how this renders. The container cannot run `next build` — Google Fonts is unreachable — and has no route to the Sanity API, so `tsc --noEmit` and `eslint` are the only gates that ran. The markup and the styles are unexercised until the deploy.*

---

## 2. The investor permit, article 100

**Instrument:** Law 5038/2023 article 100, «Επενδύσεις σε ακίνητη περιουσία (μόνιμη άδεια διαμονής επενδυτή) (άδεια διαμονής τύπου «Β.5»)». Read in full. **Tier A.**

### 2.1 The thresholds

| Tier | Where | Article |
| --- | --- | --- |
| €800,000 | Attica Region; Thessaloniki Regional Unit; Mykonos and Thira Regional Units; and every island with more than 3,100 inhabitants at the last census | §2(a) |
| €400,000 | The rest of the country | §2(b) |
| €250,000 | Change of use of principal areas to residence; or an industrial building in which no industry has been installed and operating for the last five years | §2(c) |
| €250,000 | A listed building to be restored or reconstructed | §2(d) |

The €800,000 wording, verbatim: «Για την Περιφέρεια Αττικής, την Περιφερειακή Ενότητα Θεσσαλονίκης … και για τα νησιά με πληθυσμό, σύμφωνα με την τελευταία απογραφή, πάνω από τρεις χιλιάδες εκατό (3.100) κατοίκους, η ελάχιστη αξία κτήσης … καθορίζονται σε οκτακόσιες χιλιάδες (800.000) ευρώ.»

### 2.2 The two conditions everyone states loosely

**One property, all four tiers.** «σε ένα μόνο ακίνητο», in identical words in §2(a), (b), (c) and (d). There is no combining of two purchases to reach a threshold.

**120 m², only two tiers.** The minimum surface of principal areas appears in §2(a) and §2(b), and only where the property is built or has a building permit: «απαιτείται ελάχιστη επιφάνεια κύριων χώρων εκατόν είκοσι (120) τετραγωνικών μέτρων». **Neither §2(c) nor §2(d) states any minimum size.** Pages that print "120 m²" as a rule of the programme are over-stating it by two of its four routes.

**Co-ownership.** Under §1(b) an undivided share qualifies only where the co-owners are spouses or partners under a cohabitation agreement. Otherwise each co-owner's share must independently reach the threshold.

### 2.3 The conditions attached after purchase

- **§7A.** Letting through the sharing economy, sub-letting, and use as a company seat each revoke the permit and carry **€50,000**. Failing the §2(d) restoration condition carries **€150,000** without revocation; a transfer in breach of §2(d) carries **€150,000** with it. (This row was corrected on the sources page on 25 August 2026, where it previously had the tiers the wrong way round.)
- **§2(d).** A transfer before restoration is complete is **void** — «είναι άκυρη» — not merely penalised.
- **§4.** The first renewal is conditional on the restoration having been carried out.
- **§9.** The permit confers **no right of access to any form of employment**: «δεν καθιερώνουν δικαίωμα πρόσβασης σε οποιαδήποτε μορφή εργασίας».
- **§3.** The price must be paid in full **before** the application is filed.
- **§5.** Payment only by crossed cheque, credit transfer or card terminal, through a payment provider operating in Greece. A spouse or a relative to the second degree may pay.
- **§10.** The permit is issued within two months of the complete file reaching the issuing authority.
- **§2(c).** The change of use must be **completed before the application is filed**, and it may be carried out by the seller.

### 2.4 What is not established

**The list of islands above 3,100 inhabitants was not obtained.** The threshold turns on it and no competitor publishes it either. It requires the last census by island, from ELSTAT, and was not retrieved in this round. **Tier D.** The guide must therefore describe the rule and not offer the list, and should say that this is exactly the sort of thing a reader has to have confirmed for the specific island before committing.

**"As amended by Law 5100/2024" is an inference.** The 800/400/250 architecture is that law's, and the consolidated text is current to February 2026, so the figures are the August 2026 figures. That each was introduced by 5100/2024 was not verified against 5100/2024 itself. **Tier A on the figures, tier C on the attribution.**

---

## 3. Family members, article 95

**Instrument:** Law 5038/2023 article 95 §2, in the form given by article 29 of Law 5275/2026. Both read; the consolidated text and the amending provision match exactly. **Tier A.**

Article 29 of Law 5275/2026 opens: «Στο πρώτο εδάφιο της παρ. 2 του άρθρου 95 … προστίθεται περ. ε)». It **adds one point**. Spouse, partner, children and ascendants were already there. Pages presenting the 2026 amendment as a broad expansion of family rights are describing something that did not happen.

| Who | Point | Condition |
| --- | --- | --- |
| Spouse, or partner under a cohabitation agreement | (a) | — |
| Common unmarried children of the couple | (b) | Under 21 |
| Unmarried children of either, where custody is lawfully assigned | (c) | Under 21 |
| Direct ascendants of the spouses or partners | (d) | No age limit, no dependency test stated |
| Adult children lacking legal capacity | (e) | Any age, cohabiting and maintained |

**The family permit expires with the investor's**: «η οποία λήγει ταυτόχρονα με την άδεια διαμονής του συντηρούντος».

**At 21 a child does not fall off.** «χορηγείται αυτοτελής άδεια διαμονής για τρία (3) έτη» — an autonomous three-year permit, the only requirement being production of the previous family permit.

**One genuine ambiguity, flagged rather than resolved.** Point (d) grants ascendants «των συζύγων ή συμβίων» — of the spouses or partners. On a strict reading an unmarried investor with no cohabitation partner has no spouse or partner and so may bring no parent at all. No guidance or case law resolving this was found. The guide may state the ordinary reading, but must not present it as certain. **Tier D on the ambiguity.**

---

## 4. The permit for holders of sufficient resources, type Ι.8

**Instrument:** Law 5038/2023 **article 163 §8**. It is a paragraph of a general article, not an article of its own — a small thing that matters, because pages citing "the FIP article" without a paragraph are not quoting anything checkable. **Tier A.**

- Three years, renewable for equal periods.
- The statute sets **no figure**. It requires «επαρκείς πόρους, σε επίπεδο σταθερού ετήσιου εισοδήματος».
- The resources condition may be met **by each family member individually or by the family cumulatively**: «είτε στο πρόσωπο του κάθε μέλους της οικογένειας είτε αθροιστικά».
- **No employment and no self-employment of any kind in Greece**, for the holder, the spouse or partner, or any family member: point (γ).
- Point (δ): anyone already lawfully resident who draws a pension from a Greek public insurance fund, **of any amount**, renews without meeting the resources test at all.

### 4.1 The €3,500

**KYA 225679/2024, ΦΕΚ Β΄ 5223/17.09.2024, article 1 §1(ι):** «κατ' ελάχιστο τρεισήμισι χιλιάδες (3.500) ευρώ μηνιαίως … προσαυξάνεται κατά 20% για τη σύζυγο και κατά 15% για κάθε τέκνο.» Proof is «σύνταξη του εξωτερικού, τραπεζικό λογαριασμό ή αποδεικτικά στοιχεία ότι διαθέτουν εξ ιδίων ικανά οικονομικά μέσα, για τα οποία αποδεικνύεται η νόμιμη προέλευσή τους».

Read in two independent reproductions that agree verbatim, and corroborated by the Ministry of Migration's own readable copy of the decision. **Tier A/B.** No competitor page in the English or Russian result sets gives the decision number at all.

**€42,000 is arithmetic, not a threshold.** It is 3,500 × 12. The decision sets a monthly figure. Whether the assessment is ever made annually could not be established from the decision's own text. **Tier D on any express annual rule.**

**Savings do substitute for income** — but on the strength of the ministerial decision, which accepts a bank account and own means of proven lawful origin, not on the strength of the statute, which speaks of stable annual income. Worth stating precisely, because the two instruments do not say quite the same thing.

**The national type D visa is a genuine precondition, and the basis is statutory rather than a law firm's page.** Article 163 §1: «Στον πολίτη τρίτης χώρας, που έχει λάβει θεώρηση εισόδου για έναν από τους λόγους του παρόντος άρθρου, χορηγείται αντίστοιχη άδεια διαμονής.» Article 7 §7 sets the national visa's validity at 91 days to one year. **Tier A.** This replaces an earlier internal note that attributed the requirement to a single law firm's page.

### 4.2 Not established

- Whether KYA 225679/2024 has been amended during 2025 or 2026. No replacement found; absence of a search result is not proof. **Tier D.**
- No `mitos.gov.gr` procedure entry for Ι.8 was located. **Tier D.**

---

## 5. The two permanent statuses

**Μ.1, EU long-term resident:** conditions in article 144, grant in article 145, scope and exclusions in article 143.
**Μ.2, the national ten-year permit:** article 161, replaced by article 38 of Law 5275/2026.
**Proof of Greek:** article 160, amended by article 37 of Law 5275/2026.

### 5.1 Periods and absences

| | Μ.1 | Μ.2 |
| --- | --- | --- |
| Period | Five years «νόμιμα και αδιάλειπτα» immediately before the application (art. 144 §1) | Ten years «συνεχή νόμιμη διαμονή … δυνάμει οριστικού τίτλου διαμονής» (art. 161 §1(a)) |
| Absences | Each under six consecutive months, ten months in total across the five years (art. 144 §3) | Must not have been absent two consecutive years (art. 161 §3(b)) |
| Income | Minimum wage annualised, plus 10% for the totality of dependants (art. 144 §1(a)) | **None stated at grant.** Art. 161 §1(a) imports only point (c) of art. 144 §1 |
| Greek | Yes, through art. 144 §1(c) and art. 160 | Yes, same route — except on the born-in-Greece and six-grades routes of §1(b) |

Alternative Μ.2 route in §1(b): born in Greece, or six grades of a Greek school completed in Greece, before the applicant's 23rd year.

### 5.2 The language requirement, and the new way round it

Article 160 §1(d) accepts «πιστοποιητικό ελληνομάθειας επιπέδου τουλάχιστον Β1». Article 160 §2 lets an A or A2 holder qualify by additionally certifying knowledge of Greek history and culture under article 176.

**Article 37 of Law 5275/2026 added two routes**, and the second is worth the guide's space:

> «ζ) τίτλο αποφοίτησης (πτυχίο) ή μεταπτυχιακό ή διδακτορικό τίτλο από τμήματα Α.Ε.Ι. στην Ελλάδα … και η) στοιχεία, σύμφωνα με τα οποία διαμένουν νόμιμα στην Ελλάδα για δώδεκα (12) συναπτά έτη πριν από την υποβολή του αιτήματος για την υπαγωγή στον τίτλο διαμονής «Μ.1».»

Twelve consecutive years of lawful residence now substitutes for the language certificate entirely, for Μ.1. **Tier A.** Not found on any competitor page checked.

### 5.3 The income formula and the number nobody can give

Article 144 §1(a): «Το εισόδημα αυτό δεν μπορεί να είναι μικρότερο από τις ετήσιες αποδοχές του αμειβόμενου με τον κατώτατο μισθό, προσαυξημένο κατά δέκα τοις εκατό (10%) για το σύνολο των συντηρούμενων μελών της οικογένειάς του.»

Note **10% for the totality of dependants, not per head**. This is commonly misreported.

The minimum wage: **KYA 8934/2026, ΦΕΚ Β΄ 1759/27.03.2026, in force from 1 April 2026**, sets it at **€920.00** a month, up from €880. **Tier A/B**, and independently confirmed in the Greek press and by the Ministry of Labour's own announcement.

**Whether "annual earnings" means twelve payments or fourteen is not stated by either instrument.** The statute is silent and the wage decision is silent. That is a spread of about €1,840.

There is, however, a measurement rather than a guess available. The Ministry of Labour's own material puts the cumulative increase since 2019 at **€3,780 a year**. The 2019 minimum wage was €650 and the new one is €920, a difference of €270 a month. €270 × 14 = €3,780 exactly. €270 × 12 = €3,240. **The ministry's own arithmetic is on fourteen payments** — which is the Greek convention, twelve salaries plus the Christmas bonus, half at Easter and half as leave allowance.

So annual minimum-wage earnings are **€12,880**, and the article 144 threshold with any number of dependants is **€14,168**.

**This is still not a verified answer to the immigration question.** It establishes what "annual earnings of a minimum-wage earner" means in Greek practice. It does not establish that a Decentralised Administration applies fourteen payments when assessing article 144 §1(a). **Tier A on the wage and on the ministry's multiplier; tier D on the figure the immigration authority actually uses.** The guide gives the formula, gives both candidate totals, and says which one the ministry's own arithmetic supports.

### 5.4 Do golden visa years count towards permanent residence?

This is the question the guide is built around, and the answer is better than either side of the competitor argument.

**Nothing excludes investors.** Article 143 §2 lists who is outside the long-term-residence chapter: students and vocational trainees, temporary protection, other non-international protection, pending asylum applicants, holders of «προσωρινό καθεστώς διαμονής» under the Code, and persons under the Vienna Conventions. Investors are on none of those lines. Article 144 §2 discounts residence only for §2(e) and (f), and halves study and training periods. Investors are not discounted. **Tier A.**

**Μ.2 counts any definitive residence title.** «δυνάμει οριστικού τίτλου διαμονής», article 161 §1(a). An investor permit is one. **Tier A.**

**The absence of work rights is not a bar.** The Ministry of Migration and Asylum published a clarification dated 7 November 2022 headed «Δυνατότητα απόκτησης καθεστώτος επί μακρόν διαμένοντος από αλλοδαπούς κατόχους άδειας διαμονής που δεν παρέχει πρόσβαση στην αγορά εργασίας» — the possibility of acquiring long-term resident status by holders of a permit that gives no labour-market access. Its substance is that such a permit is no obstacle, provided the income condition is met from other lawful sources taxed in Greece. **Tier B**, and reported in substance: the heading was obtained verbatim, the body was not, and it should be read directly before being quoted in print.

**The binding constraint is presence, not permit type — and this is the finding.** Article 144 §1 requires residence «νόμιμα και αδιάλειπτα» with the §3 absence caps. Article 100 §4 says the exact opposite about the investor permit itself: «Διαστήματα απουσίας από τη χώρα δεν αποτελούν παρακωλυτικό λόγο για την ανανέωση της άδειας διαμονής» — absences are no obstacle to renewal.

So the same document behaves in two ways depending on what the holder does with it. An investor who does not live in Greece renews indefinitely and accrues no qualifying year at all. An investor who lives there accrues them like anyone else. The two camps of competitor pages are each half right, and both are arguing about the wrong variable.

**Article 143 §2(e) and where it comes from.** This is the one textual hook for the opposite reading, and it was traced. Article 143 transposes article 3 of **Directive 2003/109/EC**, whose own article 3(2)(e) excludes third-country nationals residing "solely on temporary grounds such as au pair or seasonal worker". Those are the European legislator's chosen examples, and they describe a temporary *purpose* rather than an investment. Read from the Official Journal text, L 16/44 of 23 January 2004. **Tier A** for the quoted words; the transposition relationship is stated by article 143 itself.

**What is not established.** No official statement, circular or decided case was found saying in terms that investor years count. **Tier D on an express confirmation.** The guide states the structure and marks the gap; it does not assert the conclusion as settled.

**Directive 2003/109 also carries the mobility that Μ.2 does not.** Article 14(1), verbatim: "A long-term resident shall acquire the right to reside in the territory of Member States other than the one which granted him/her the long-term residence status, for a period exceeding three months, provided that the conditions set out in this chapter are met." Article 14(2) names the grounds (employment or self-employment, study or vocational training, other purposes); article 15 lets the second state require an application within three months of entry, stable and regular resources, sickness insurance and integration measures. Article 4(1), verbatim: "Member States shall grant long-term resident status to third-country nationals who have resided legally and continuously within its territory for five years immediately prior to the submission of the relevant application." Denmark and Ireland are not bound. **Tier A** for articles 14(1) and 4(1), read verbatim from the Official Journal; **tier A/B** for articles 5 and 15, which came back in summary rather than as quotation. This matters most to the Polish version, whose reader may already hold a long-term status in another member state.

---

## 6. Naturalisation

**Seven years**, Law 3284/2004 as amended. Application fee €550, examination fee €150. The ΠΕΓΠ examination tests Greek at B1 plus history, geography and culture, pass mark 70%. Law 5225/2025 was cited internally as changing the administration of the examination — see §1.1: that law number is unverified and must not be printed. **Tier B/C on the fees and the examination; tier A on the seven-year period.**

The naturalisation clock counts a different kind of residence from the permanent-residence clock, and the guide keeps the three apart: the permit's own renewal conditions, the long-term-residence presence test, and the naturalisation period. Every competitor page checked collapses at least two of them.

---

## 7. The three tax regimes

| | 5A | 5B | 5C |
| --- | --- | --- | --- |
| What | €100,000 flat on all foreign income | 7% on all foreign income | 50% exemption on Greek employment and business income |
| Prior non-residence | **7 of the last 8 years** | 5 of the last 6 | 5 of the last 6 |
| Extra condition | €500,000 invested within 3 years of applying | Relocating from a state with a tax administrative-cooperation agreement with Greece | From an EU/EEA state or a cooperation state; services to a Greek entity or a Greek permanent establishment; declaration of two years' stay |
| Duration | 15 tax years | 15 tax years | **7 tax years** |
| Starts | The **first** year applied for | The **next** year after the one applied for | — |
| Family | €20,000 per additional relative | — | — |

All three read article by article. **Tier A.**

**The 7% applies to all foreign income, not only the pension.** «φόρο με συντελεστή επτά τοις εκατό (7%) για το σύνολο του εισοδήματός του που αποκτήθηκε στην αλλοδαπή». The pension is the entry condition; the rate then covers everything foreign. This is the most widely misstated fact in the whole Greek set.

**Payment and forfeiture under 5B.** One instalment by the last working day of December; paying it exhausts the liability on that income. Miss a year in full and the regime is lost from that year, with worldwide taxation under the general rules resuming.

**The 31 March deadline is not in the statute.** Article 5B §9 delegates it, and the delegated instrument is **decision Α.1217/2020, article 4 §1**: «υποβάλλει αίτηση, το αργότερο έως την 31η του μηνός Μαρτίου», with sixty days for the administration to decide. **Tier A/B for 5B.** For **5A the same date rests only on AADE's explanatory publication**; Α.1036/2020 was not read. **Tier B for 5A.**

**Not established.** Article 5A paragraphs 3 and 5 to 10 were not read verbatim; anything about the eligible investment categories in detail, the consequences of failing to complete the investment, or inheritance and gift treatment under 5A is **tier D** from this research whatever a summary says.

---

## 8. Applications from citizens of Russia and Belarus

The claim under test: "since 2022 Greece does not accept applications from citizens of Russia and Belarus." It came from two commercial pages that both go on to market a second-citizenship workaround, which is the weakest possible provenance.

**The verdict: substantially true, materially incomplete, and not what the sellers say it is.**

- **28 February 2022**, Ministry of Migration and Asylum announcement: issuance and renewal of investment-purpose permits suspended for citizens of the Russian Federation «μέχρι νεωτέρας». **Tier B.**
- **1 April 2022**, Ministry announcement: renewals released — pending and new — for citizens of Russia **and Belarus** and their family members; **new applications remain suspended**. Carve-outs for Russian and Belarusian family members of non-Russian, non-Belarusian investors, and for family members of investors already holding valid permits. It cites Commission Recommendation C(2022) 2028 as its reason. **Tier B.**
- **April 2026**, circular 1/2026: the suspension remains in force and now extends expressly to change-of-purpose applications under article 12 of Law 5038/2023, closing the route in through another permit type. **Tier C** — reported by Investment Migration Insider from the circular; the circular's own text was not obtained, and Greek-language coverage of the same circular does not mention the passage. This is the single most load-bearing citation in this section and it rests on one source.

**It is not an EU sanction.** No Council Regulation or Decision restricts residence by investment for Russian or Belarusian nationals as a class. The instrument is **Commission Recommendation C(2022) 2028 final of 28 March 2022**, which is by its nature not binding — which is why member states diverged, Italy suspending only in August 2023. **Tier A on the Recommendation's status.** The guide may not say "EU sanctions ban this".

**It is not the visa measures either.** The suspension of the EU–Russia visa facilitation agreement of 9 September 2022 governs short-stay Schengen visas. Different instrument, different subject.

**The statistics support the two-track reading.** Ministry data, statistical annex B, March 2026: Russia holds **458 investor permits in the renewal category, 6.2% of all renewals**, plus 725 family-member renewals. Russia does not appear in the top-ten nationalities for **initial** issuance, in a list published down to 1%. June 2026 data shows the same. **Tier B.** Renewals flowing while initial issuance is absent is precisely what the 1 April 2022 decision describes.

**What is not established.**

- **No primary instrument exists, or none could be found.** No law, no KYA, no gazette reference. The restriction appears to live entirely in announcements and circulars. That is itself worth publishing.
- Whether any Russian citizen received an initial permit in 2024–2026 cannot be proved from published data, which gives rankings rather than full tables.
- **The position of the Ι.8 permit is unknown.** The 2022 decisions are framed around investment-purpose permits and the old article 17; Ι.8 is not named. Absence of mention is not permission. **Tier D — the guide asserts nothing in either direction.**
- No evidence was found of a separate layer of informal refusal, enhanced due diligence or banking obstruction. The picture is a formal bar on new applications, not soft obstruction.

**Editorial position.** The guide reports the restriction, reports that intermediaries market second-citizenship workarounds, and states that this site does not recommend or facilitate one and that anyone weighing it needs independent legal advice. Describing that a practice exists and recommending it are different acts, and only the first belongs on this site.

---

## 9. Everything this document could not establish

Collected in one place, because a guide that reads the same whether or not it checked is a guide nobody can use.

1. The list of Greek islands above 3,100 inhabitants, which decides the €800,000 zone.
2. Whether an unmarried investor with no cohabitation partner may bring a parent under article 95 §2(d).
3. Whether article 144 §1(a) is applied on twelve or fourteen payments by the authority that decides it. The ministry's own arithmetic uses fourteen; the immigration practice is unconfirmed.
4. Any express official statement that investor years count towards Μ.1 or Μ.2.
5. Whether article 143 §2(e) could be read to exclude investors.
6. The substantive text of articles 177 and 178 of Law 5038/2023, the transitional and repealing provisions. It follows that the guide may not print "nothing bridges the old code to the new" — that was not established, only not found.
7. That article 16 of Law 4251/2014 is repealed at all, which is an inference from the new Code's structure and its entry into force on 31 March 2024. **Tier C.**
8. Whether KYA 225679/2024 has been amended since.
9. Article 5A paragraphs 3 and 5–10.
10. The 31 March deadline for article 5A at instrument level.
11. The Greek minimum wage in force before 1 April 2026, which would matter for an application filed earlier in the year.
12. The text of circular 1/2026 itself.
13. The body of the ministry's 7 November 2022 clarification, quoted here only by its heading.
14. The status of the Ι.8 permit for citizens of Russia and Belarus.
15. Any page of the Government Gazette. Not one was read in this research.
