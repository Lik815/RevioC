# Revio Pitch MVP

Stand der Analyse: 18.03.2026
Proben-Pitch: 26.03.2026
Verbleibende Zeit: 8 Tage

## 1. Kurzfassung

Revio ist eine Plattform, die Patientinnen und Patienten hilft, den passenden Physiotherapeuten nicht nur nach Name oder Zufall zu finden, sondern gezielt nach ihrem Problem, ihrem Standort und praktischen Kriterien wie Sprache, Hausbesuch oder Kassenart.

Der aktuelle MVP-Fokus ist klar: Physiotherapie in Deutschland, Start in Koeln. Das Produkt ist noch in Entwicklung, aber die Codebasis zeigt bereits einen belastbaren MVP-Kern: Suche, Therapeuten-Onboarding, Praxis-Verknuepfung, Admin-Review und mobile Oberflaeche sind vorhanden. Fuer den Pitch ist das stark genug, wenn klar kommuniziert wird: Revio ist kein fertiges Massenprodukt, sondern ein validierbarer MVP mit erkennbarem Nutzen und konkreter Roadmap.

## 2. Pitch-Text

### 30-Sekunden-Version

Viele Menschen suchen nach einem Physio, wissen aber nicht, wer wirklich zu ihrem konkreten Problem passt. Heute landet man oft bei Google Maps, Listen oder Empfehlungen aus dem Bekanntenkreis. Revio loest dieses Problem, indem wir die Suche vom Namen auf den Bedarf drehen: nicht "Welche Praxis ist in meiner Naehe?", sondern "Wer hilft mir bei Rueckenschmerzen, Knie-Reha oder neurologischer Rehabilitation?"

Unser MVP startet fokussiert mit Physiotherapie in Deutschland, zuerst in Koeln. Patientinnen und Patienten koennen ohne Account nach Beschwerde, Standort und passenden Filtern suchen. Gleichzeitig koennen Therapeutinnen und Therapeuten strukturierte Profile anlegen, sich mit Praxen verknuepfen und werden vor der Veroeffentlichung geprueft. So schaffen wir mehr Relevanz auf der Suchseite und mehr Vertrauen auf der Angebotsseite.

### 2-Minuten-Version

Das Kernproblem ist einfach: Die Suche nach einem passenden Physiotherapeuten ist heute unklar, unstrukturiert und oft ineffizient. Wer Schmerzen oder ein konkretes Reha-Thema hat, sucht selten nach einem Namen. Gesucht wird eigentlich Kompetenz fuer ein spezifisches Problem, in einer passenden Lage, mit passenden Rahmenbedingungen. Genau da setzt Revio an.

Revio ist eine spezialisierte Discovery-Plattform fuer Physiotherapie. Im MVP koennen Patientinnen und Patienten ohne Account nach Problemen wie Rueckenschmerzen, Sportphysiotherapie oder neurologischer Rehabilitation suchen. Dazu kommen Filter wie Sprache, Hausbesuch und Kassenart. Ergebnisse werden als Therapeutenprofile und zugehoerige Praxen dargestellt, inklusive Kartenbezug und Kontaktdaten.

Auf der Anbieterseite koennen Therapeutinnen und Therapeuten sich registrieren, ihr Profil anlegen und sich mit einer oder mehreren Praxen verknuepfen. Praxen koennen neue Therapeutinnen und Therapeuten einladen oder bestehende Profile anbinden. Wichtig fuer das Vertrauen: Profile und Praxen werden nicht automatisch live geschaltet, sondern durch einen Admin-Review-Prozess geprueft.

Fuer den Marktstart ist der Scope bewusst eng: nur Physiotherapie, nur Deutschland, Start in Koeln. Dadurch bleibt der MVP fokussiert und messbar. Unser Ziel ist nicht, alles rund um Gesundheit abzubilden. Wir bauen keine Diagnosen, keine Behandlungsplaene, keine Patientenakten und kein Terminbuchungssystem. Unser erster Job ist, die passende Versorgung schneller und klarer auffindbar zu machen.

Wenn Revio funktioniert, dann fuehlt sich die Suche nach einem Physio erstmals so an, als waere sie fuer das eigentliche Problem gebaut worden und nicht fuer allgemeine Branchenverzeichnisse.

### Problem-Solution-Fit in 3 Saetzen

Problem: Patientinnen und Patienten finden heute schwer den richtigen Physio fuer ihr konkretes Anliegen.

Loesung: Revio verbindet problemorientierte Suche, strukturierte Therapeutenprofile und gepruefte Praxisdaten in einer fokussierten Plattform.

Vorteil: Bessere Auffindbarkeit fuer passende Therapieangebote und mehr Vertrauen durch Review statt unkontrollierter Selbstdarstellung.

## 3. Was laut Code heute schon vorhanden ist

### Patientenseite / Mobile App

- Mobile App mit Suchoberflaeche fuer Problem + Standort.
- Filter fuer Sprache, Hausbesuch und Kassenart.
- Detailansichten fuer Therapeuten und Praxen.
- Favoriten werden lokal gespeichert.
- Standortfreigabe oder manuelle Stadtauswahl ist vorgesehen.
- Teilen von Profilen und Oeffnen von Kartenlinks ist eingebaut.

### Therapeuten-Seite

- Registrierung per E-Mail.
- Login, Profil laden, Profil bearbeiten und Account loeschen.
- Angaben wie Bio, Sprachen, Spezialisierungen, Fortbildungen, Foto, Hausbesuch und Verfuegbarkeit sind vorgesehen.
- Therapeuten koennen neue Praxen anlegen oder bestehende Praxen suchen und Verknuepfungen anfragen.

### Praxis-Seite

- Eine Praxis kann von einem Therapeuten administriert werden.
- Praxisdaten koennen gepflegt werden: Name, Stadt, Adresse, Telefon, Oeffnungszeiten, Beschreibung, Logo, Fotos.
- Praxis-Admins koennen Verknuepfungsanfragen annehmen oder ablehnen.
- Praxis-Admins koennen Therapeuten einladen und Einladungen erneut senden.

### Admin / Trust Layer

- Admin-Login vorhanden.
- Dashboard mit Kennzahlen zu Therapeuten, Praxen und Verknuepfungen.
- Review-Queue fuer Therapeuten und Praxen.
- Aktionen fuer approve, reject, request changes, suspend.
- Geocoding- und Moderationslogik vorhanden.

### Backend / Plattform

- Fastify API mit klaren Routen fuer Suche, Auth, Registrierung, Uploads, Praxen, Einladungen und Admin.
- Prisma-Datenmodell mit Therapeuten, Praxen, Verknuepfungen, Suchvorschlaegen und Einladungen.
- Sichtbarkeits- und Review-Status sauber modelliert.
- Suche besitzt Relevanzlogik, nicht nur einfaches Filtern.

### Qualitaet / Technik

- API-Tests vorhanden und aktuell gruen.
- Workspace-Typecheck ist gruen.
- Seed-Daten fuer Demo und Entwicklung vorhanden.

## 4. Was noch nicht als voll fertiges Produkt gelten sollte

- Die App ist noch klar ein MVP in Entwicklung, kein fertig ausgerolltes Produkt.
- Die Mobile-App arbeitet teilweise mit Demo- oder Platzhalterdaten und Platzhalterbildern.
- E-Mail-Versand ist vorbereitet, aber ohne gesetzten `RESEND_API_KEY` nicht produktionsbereit.
- Es gibt aktuell keine echten Admin-Tests fuer das Frontend.
- Es gibt in der Mobile-App keine sichtbare eigene Test-Suite.
- Die Suche ist aktuell stark auf exakte Stadtlogik ausgelegt; das ist fuer den MVP okay, aber noch nicht maximal nutzerfreundlich.
- Terminbuchung, Zahlungen, Bewertungen und Patientenaccounts sind bewusst nicht Teil des MVP.
- Fuer den Pitch solltest du nichts behaupten, was nach "voll live am Markt" klingt.

## 5. Ehrliche Positionierung fuer den Pitch

Die beste Formulierung ist:

"Revio ist ein spezialisierter MVP fuer die Suche nach passenden Physiotherapeutinnen und Physiotherapeuten. Wir haben den Kern-Workflow bereits gebaut: problemorientierte Suche, strukturierte Profile, Praxisverknuepfung und einen Review-Prozess fuer Vertrauen. Bis zum Marktstart bauen wir den Produktkern weiter aus und validieren Nutzung, Datenqualitaet und Onboarding."

Weniger gut waere:

"Unsere App ist fertig" oder "wir sind schon komplett live".

## 6. Was du bis zum 26.03. vorbereiten solltest

### A. Pitch-Inhalt

- Eine klare Ein-Satz-Erklaerung: Was ist Revio?
- Ein klares Problembeispiel aus dem Alltag.
- Ein klares Warum jetzt.
- Eine klare Begrenzung des MVP-Scope.
- 1 bis 2 plausible Zielgruppen-Personas.
- Ein kurzer Satz zur Vision nach dem MVP.

### B. Demo-Vorbereitung

- Entscheiden, ob du nur mit Seed-Daten pitchst oder mit echten kuratierten Beispielen.
- 3 Suchszenarien vorbereiten:
  - Rueckenschmerzen in Koeln
  - Sportphysiotherapie in Koeln
  - Neurologische Rehabilitation in Koeln
- 1 Therapeuten-Onboarding vorbereiten.
- 1 Praxis-Admin-Szenario vorbereiten.
- 1 Admin-Review-Szenario vorbereiten.
- Vorher testen, dass API, Mobile-App und Admin lokal sauber starten.

### C. Produktdaten

- Anzahl Seed-Praxen und Therapeuten sauber benennen oder bewusst nicht numerisch nennen.
- Entscheiden, ob du "Koeln zuerst" als Testmarkt aktiv betonst.
- Kassenart-Begriffe sprachlich vereinheitlichen.
- Falls moeglich 5 bis 10 hochwertige Demo-Profile manuell kuratieren.

### D. Glaubwuerdigkeit

- Eine kurze Begruendung, warum problemorientierte Suche besser ist als Google Maps.
- Eine kurze Begruendung, warum Review wichtig fuer Vertrauen ist.
- Eine kurze Begruendung, warum du mit einem engen Scope startest.

### E. Technische Vorbereitung

- `EXPO_PUBLIC_API_URL` fuer die Mobile-App korrekt setzen.
- `NEXT_PUBLIC_API_URL` fuer das Admin-Frontend korrekt setzen.
- `RESEND_API_KEY` und `MOBILE_URL` setzen, wenn du Einladungs-E-Mails live zeigen willst.
- Seed-Daten und Demo-Logins vor dem Pitch pruefen.
- Backup-Plan ohne Internet vorbereiten.

## 7. Demo-Ablauf fuer den Proben-Pitch

### Demo in 3 Minuten

1. Problem erklaeren: "Ich habe Rueckenschmerzen und suche nicht irgendeine Praxis, sondern jemanden, der genau dazu passt."
2. In der App nach einem Problem und Standort suchen.
3. Ergebnisse mit Filtern zeigen.
4. Ein Therapeutenprofil oeffnen.
5. Zugehoerige Praxis oeffnen.
6. Kurz zeigen, dass Anbieterprofile nicht unkontrolliert live gehen, sondern ueber Review laufen.

### Demo in 5 Minuten

1. Patientensuche zeigen.
2. Therapeuten-Onboarding anreissen.
3. Praxisverknuepfung oder Einladung zeigen.
4. Admin-Dashboard und Freigabe-Workflow zeigen.
5. Mit dem Satz abschliessen: "Wir bauen nicht den gesamten Gesundheitsmarkt, sondern loesen zuerst ein enges, reales Discovery-Problem."

## 8. Daten und Fakten, die du im Pitch nennen kannst

- Fokusbereich: Physiotherapie.
- Startmarkt: Deutschland.
- Startstadt im MVP: Koeln.
- Patientenseite ohne Pflicht-Account.
- Suche nach Problem statt nur nach Namen.
- Filter wie Sprache, Hausbesuch und Kassenart.
- Praxis- und Therapeutenprofile.
- Review vor oeffentlicher Sichtbarkeit.
- Admin-Dashboard fuer Moderation und Freigabe.
- API-Tests vorhanden und aktuell erfolgreich.

## 9. Daten und Fakten, die du besser nur mit Vorsicht formulierst

- Keine Aussage, dass schon viele echte Nutzer aktiv sind, wenn das nicht belegt ist.
- Keine Aussage, dass das Produkt produktionsreif skaliert.
- Keine Aussage, dass Einladungs- oder E-Mail-Workflows live fertig sind, wenn die Umgebungsvariablen nicht gesetzt sind.
- Keine Aussage, dass alle Inhalte echte verifizierte Marktdaten sind, wenn noch Seed- oder Demodaten verwendet werden.

## 10. Offene Punkte / Luecken, die im Q&A kommen koennen

- Wie gewinnt ihr die ersten echten Therapeuten?
- Wie verhindert ihr falsche Spezialisierungsangaben?
- Warum startet ihr ohne Terminbuchung?
- Wie messt ihr Suchqualitaet?
- Wie skaliert das ueber Koeln hinaus?
- Wie grenzt ihr euch gegen Google Maps, Doctolib oder Jameda ab?
- Wie sichert ihr Datenqualitaet und Vertrauen?
- Wie monetarisiert ihr spaeter?

## 11. 50 moegliche Fragen, die kommen koennen

1. Welches konkrete Problem loest Revio besser als bestehende Plattformen?
2. Warum braucht es dafuer ein eigenes Produkt und nicht nur bessere Google-Suchen?
3. Warum startet ihr mit Physiotherapie und nicht breiter?
4. Warum startet ihr in Koeln?
5. Wer ist eure wichtigste Zielgruppe im MVP?
6. Wie sieht der Kernnutzen fuer Patientinnen und Patienten aus?
7. Wie sieht der Kernnutzen fuer Therapeutinnen und Therapeuten aus?
8. Was ist der Kernnutzen fuer Praxen?
9. Wie funktioniert eure Suche genau?
10. Warum ist die Suche nach Problem besser als die Suche nach Namen?
11. Wie stellt ihr sicher, dass die Suchergebnisse relevant sind?
12. Welche Filter sind im MVP wirklich wichtig?
13. Warum braucht der Patient keinen Account?
14. Wie geht ihr mit Datenschutz um?
15. Welche Daten speichert ihr bewusst nicht?
16. Wie verifiziert ihr Therapeutenprofile?
17. Wie verifiziert ihr Praxisdaten?
18. Was passiert, wenn jemand falsche Angaben macht?
19. Warum habt ihr einen manuellen Review-Prozess eingebaut?
20. Ist manueller Review langfristig skalierbar?
21. Wie gewinnt ihr die ersten Therapeutinnen und Therapeuten auf die Plattform?
22. Wie gewinnt ihr die ersten Praxen?
23. Wie loest ihr das Henne-Ei-Problem auf einem Marktplatz?
24. Habt ihr schon echte Nutzer oder noch Testdaten?
25. Welche Teile des Produkts sind schon funktionsfaehig?
26. Welche Teile sind noch nicht produktionsreif?
27. Warum ist Terminbuchung nicht Teil des MVP?
28. Warum sind Bewertungen und Rezensionen nicht Teil des MVP?
29. Wie wollt ihr spaeter Geld verdienen?
30. Was ist euer moegliches Geschaeftsmodell?
31. Wer sind eure staerksten Wettbewerber?
32. Wodurch differenziert sich Revio wirklich?
33. Was waere euer wichtigster KPI im MVP?
34. Woran erkennt ihr, dass der MVP funktioniert?
35. Wie messt ihr Sucherfolg oder Matching-Qualitaet?
36. Wie viele Profile braucht ihr, damit das Produkt fuer Nutzer relevant wird?
37. Wie geht ihr mit Regionen um, in denen es noch wenige Profile gibt?
38. Wie verhindert ihr, dass das Produkt leer wirkt?
39. Welche Rolle spielt die mobile App gegenueber einer Web-Version?
40. Warum habt ihr euch technisch fuer diese Architektur entschieden?
41. Wie robust ist das Produkt heute technisch?
42. Welche Risiken seht ihr bis zum Marktstart?
43. Welche rechtlichen oder regulatorischen Risiken gibt es?
44. Warum ist Revio kein medizinisches Diagnose-Tool?
45. Wie geht ihr mit sensiblen Gesundheitsdaten um?
46. Was ist nach dem MVP der naechste logische Schritt?
47. Wollt ihr spaeter weitere Berufsgruppen aufnehmen?
48. Was passiert, wenn ein Therapeut seine Sichtbarkeit aendern will?
49. Wie funktioniert die Praxisverknuepfung und Einladung von Teammitgliedern?
50. Wenn ihr nur eine Sache bis zum Launch perfekt machen koenntet, welche waere das?

## 12. Gute Kurzantworten fuer kritische Fragen

### Warum nicht einfach Google Maps?

Google Maps zeigt vor allem Orte. Revio soll passende fachliche Profile fuer konkrete Beschwerden auffindbar machen und diese strukturiert filtern koennen.

### Warum kein Terminbuchungssystem?

Weil der groesste Engpass im MVP nicht die Buchung ist, sondern die passende Auswahl. Erst muss der richtige Physio gefunden werden, dann kann man weitere Prozesse ausbauen.

### Warum manueller Review?

Weil Vertrauen im Gesundheitskontext zentral ist. Oeffentliche Profile sollen nicht ungeprueft live gehen.

### Warum so enger Scope?

Weil Fokus die Erfolgswahrscheinlichkeit im MVP erhoeht. Lieber eine Kategorie und ein Startmarkt gut loesen als alles halb.

## 13. Meine ehrliche Code-Einschaetzung

Revio hat bereits einen ueberzeugenden MVP-Kern und ist pitchbar. Die Staerke liegt nicht darin, dass alles schon perfekt fertig ist, sondern darin, dass die Produktlogik klar erkennbar und technisch bereits umgesetzt ist. Besonders stark fuer den Pitch sind die Kombination aus problemorientierter Suche, strukturiertem Onboarding und Review-Schicht.

Die groesste Gefahr im Pitch ist nicht die Technik, sondern Overclaiming. Wenn du offen sagst, dass es sich um einen MVP in Entwicklung handelt, aber den bereits gebauten Kern sauber zeigst, wirkt das deutlich staerker und glaubwuerdiger.

## 14. Meine Empfehlung fuer deine naechsten 8 Tage

### Tag 1-2

- Pitch-Narrativ finalisieren.
- Demo-Story festlegen.
- 5 Demo-Profile kuratieren.

### Tag 3-4

- Mobile-App, API und Admin gemeinsam testen.
- Login-, Such- und Review-Flow trocken durchspielen.
- Technische Stolperstellen notieren.

### Tag 5-6

- 50 Fragen durchgehen und Kurzantworten ueben.
- Kritische Fragen zu Wettbewerb, Datenschutz und Monetarisierung scharfziehen.

### Tag 7

- Pitch laut sprechen und auf Zeit ueben.
- Demo ohne Erklaerung einmal komplett durchklicken.

### Tag 8

- Generalprobe.
- Backup-Plan, Screenshots und Demo-Daten final bereitlegen.

