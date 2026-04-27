"use client";

const tString = (val: string | string[]) =>
  Array.isArray(val) ? val[0] : val;

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ─── Language system ──────────────────────────────────────────────────────────

type Lang = "en" | "pl" | "nl";
type PostLang = "en" | "pl" | "nl";

const LANG_FLAGS: Record<Lang, string> = { en: "🇬🇧", pl: "🇵🇱", nl: "🇳🇱" };
const LANG_LABELS: Record<Lang, string> = { en: "English", pl: "Polski", nl: "Nederlands" };

type Translation = Record<string, string | string[]>;

const T: Record<Lang, Translation> = {
  en: {
    // Greetings
    greeting_morning: "Good morning",
    greeting_afternoon: "Good afternoon",
    greeting_evening: "Good evening",
    tagline: "You don't have to do everything today.",
    // Nav
    nav_home: "Home",
    nav_generator: "Generator",
    nav_calendar: "Calendar",
    nav_engagement: "Engagement",
    nav_drafts: "Drafts",
    nav_brandlab: "Brand Lab",
    nav_signout: "Sign out",
    nav_progress: "Your progress",
    // Dashboard
    btn_generate: "✨ Generate post",
    btn_brandlab: "🧬 Brand Lab",
    btn_calendar: "📅 Open calendar",
    brand_grows: "Your brand is growing",
    posts_label: "Posts",
    scheduled_label: "Scheduled",
    level_label: "Level",
    brand_score: "Brand Score",
    recent_drafts: "Recent drafts",
    see_all: "See all →",
    no_drafts: "No drafts yet. Generate your first post!",
    generate_now: "Generate now",
    brand_profile: "Brand profile",
    edit: "Edit →",
    setup_brand: "Set up your brand profile",
    setup_brand_hint: "Helps AI create better content for you",
    // Language setup
    lang_setup_title: "Language settings",
    lang_app: "App language",
    lang_posting: "Languages I post in",
    lang_posting_hint: "AI will generate content in these languages",
    lang_save: "Save language settings",
    lang_saved: "Saved ✅",
    // Generator
    gen_settings: "Settings",
    gen_platform: "Platform",
    gen_type: "Post type",
    gen_topic: "Topic",
    gen_topic_ph: "e.g. spring offer, new product, client result",
    gen_tone: "Tone",
    gen_tone_default: "Default (brand voice)",
    gen_tone_bold: "Bold & confident",
    gen_tone_casual: "Casual & friendly",
    gen_tone_funny: "Funny & playful",
    gen_tone_formal: "Formal & professional",
    gen_tone_inspiring: "Inspiring & motivational",
    gen_length: "Length",
    gen_length_short: "Short (1–3 lines)",
    gen_length_medium: "Medium (4–6 lines)",
    gen_length_long: "Long (7–10 lines)",
    gen_hashtags: "Add hashtags",
    gen_datetime: "Publication date & time",
    gen_btn: "✨ Generate content",
    gen_loading: "Generating...",
    gen_output: "Output",
    gen_output_title: "Generated post",
    gen_clear: "Clear",
    gen_empty: "Click Generate to see your post.",
    gen_working: "Creating content for your brand...",
    gen_preview: "Preview",
    gen_slot: "Publishing slot",
    gen_no_date: "No date set",
    gen_media: "📎 Add photo (optional)",
    gen_canva: "🎨 Design in Canva, then upload below",
    gen_copy: "Copy",
    gen_regen: "Regenerate",
    gen_save: "Save to calendar",
    gen_saving: "Saving...",
    // Calendar
    cal_title: "Content Calendar",
    cal_subtitle: "Plan and schedule your posts",
    cal_today: "Today",
    cal_selected: "Selected day",
    cal_choose: "Choose a date",
    cal_no_posts: "No posts for this day",
    cal_create: "+ Create post",
    cal_days: ["M","T","W","T","F","S","S"],
    cal_locale: "en-US",
    // Engagement
    eng_title: "AI Engagement",
    eng_subtitle: "Comments that sound human",
    eng_post_label: "Post content (optional)",
    eng_post_ph: "Paste the post you want to comment on...",
    eng_ctx_label: "Context / comment angle",
    eng_ctx_ph: "e.g. thank you, question, compliment...",
    eng_btn: "💬 Generate comments",
    eng_loading: "Generating...",
    eng_output: "Output",
    eng_output_title: "Comment ideas",
    eng_empty: "Fill in the form and click Generate.",
    eng_working: "Crafting comments...",
    // Drafts
    drafts_title: "Saved Drafts",
    drafts_subtitle: "Your content library",
    drafts_new: "+ New draft",
    drafts_loading: "Loading...",
    drafts_empty: "No drafts. Create your first post!",
    drafts_copy: "Copy",
    drafts_edit: "Edit",
    drafts_delete: "Delete",
    drafts_created: "Created:",
    copied: "Copied ✅",
    copy_err: "Copy failed.",
    conn_err: "Connection error.",
    // Brand Lab
    lab_title: "Brand Lab 🧬",
    lab_subtitle: "AI analyzes your brand and learns how to strengthen it.",
    lab_step1: "Brand DNA Analysis",
    lab_step1_hint: "Paste 3–10 of your recent posts (separate each with a blank line). AI will analyze your style.",
    lab_step1_ph: "Paste your posts here...\n\n(Separate each post with a blank line)\n\nPost 1...\n\nPost 2...",
    lab_posts_detected: "posts detected",
    lab_btn: "🧬 Analyze brand DNA",
    lab_analyzing: "Analyzing brand...",
    lab_loading: "Building your brand DNA profile...",
    lab_shadow_headline: "Your brand is strong",
    lab_shadow_desc: "AI matches your style and subtly refines it.",
    lab_upgrade_headline: "We spotted potential",
    lab_upgrade_desc: "We'll help strengthen your communication — step by step.",
    lab_score: "Brand Score",
    lab_strengths: "✅ Strengths",
    lab_weaknesses: "🔧 To strengthen",
    lab_step2: "Rewrite me better 🔥",
    lab_step2_hint: "Paste your post — AI rewrites it in 3 strategic versions.",
    lab_using_dna: " Using your Brand DNA.",
    lab_no_dna: " (Run DNA analysis above for better results.)",
    lab_rewrite_ph: "Paste the post you want to rewrite...",
    lab_rewrite_btn: "🔥 Rewrite me better",
    lab_rewriting: "Rewriting...",
    lab_rewrite_loading: "Creating 3 versions of your post...",
    lab_variants_title: "3 versions of your post",
    // Growth levels
    lvl0_name: "Seed",
    lvl1_name: "Sprout",
    lvl2_name: "Small plant",
    lvl3_name: "First leaves",
    lvl4_name: "Healthy plant",
    lvl5_name: "Buds",
    lvl6_name: "Flower",
    lvl7_name: "Brand Garden",
  },
  pl: {
    greeting_morning: "Dzień dobry",
    greeting_afternoon: "Cześć",
    greeting_evening: "Dobry wieczór",
    tagline: "Nie musisz robić wszystkiego dziś.",
    nav_home: "Home",
    nav_generator: "Generator",
    nav_calendar: "Kalendarz",
    nav_engagement: "Engagement",
    nav_drafts: "Drafty",
    nav_brandlab: "Brand Lab",
    nav_signout: "Wyloguj się",
    nav_progress: "Twój progres",
    btn_generate: "✨ Generuj post",
    btn_brandlab: "🧬 Brand Lab",
    btn_calendar: "📅 Otwórz kalendarz",
    brand_grows: "Twoja marka rośnie",
    posts_label: "Posty",
    scheduled_label: "Zaplanowane",
    level_label: "Poziom",
    brand_score: "Brand Score",
    recent_drafts: "Ostatnie drafty",
    see_all: "Zobacz wszystkie →",
    no_drafts: "Brak draftów. Wygeneruj pierwszy post!",
    generate_now: "Generuj teraz",
    brand_profile: "Profil marki",
    edit: "Edytuj →",
    setup_brand: "Uzupełnij profil marki",
    setup_brand_hint: "Pomoże AI lepiej tworzyć treści dla Ciebie",
    lang_setup_title: "Ustawienia językowe",
    lang_app: "Język aplikacji",
    lang_posting: "Języki w których postuję",
    lang_posting_hint: "AI będzie tworzyć treści w tych językach",
    lang_save: "Zapisz ustawienia",
    lang_saved: "Zapisano ✅",
    gen_settings: "Ustawienia",
    gen_platform: "Platforma",
    gen_type: "Typ posta",
    gen_topic: "Temat",
    gen_topic_ph: "np. wiosenna oferta, nowy produkt, efekt klienta",
    gen_tone: "Ton",
    gen_tone_default: "Domyślny (głos marki)",
    gen_tone_bold: "Odważny i pewny",
    gen_tone_casual: "Casual i przyjazny",
    gen_tone_funny: "Zabawny i lekki",
    gen_tone_formal: "Formalny i profesjonalny",
    gen_tone_inspiring: "Inspirujący i motywujący",
    gen_length: "Długość",
    gen_length_short: "Krótki (1–3 linijki)",
    gen_length_medium: "Średni (4–6 linijek)",
    gen_length_long: "Długi (7–10 linijek)",
    gen_hashtags: "Dodaj hashtagi",
    gen_datetime: "Data i godzina publikacji",
    gen_btn: "✨ Generuj treść",
    gen_loading: "Generowanie...",
    gen_output: "Wynik",
    gen_output_title: "Wygenerowany post",
    gen_clear: "Wyczyść",
    gen_empty: "Kliknij Generuj, żeby zobaczyć swój post.",
    gen_working: "Tworzę treść dla Twojej marki...",
    gen_preview: "Podgląd",
    gen_slot: "Termin publikacji",
    gen_no_date: "Brak daty",
    gen_media: "📎 Dodaj zdjęcie (opcjonalnie)",
    gen_canva: "🎨 Zaprojektuj w Canva, potem wgraj poniżej",
    gen_copy: "Kopiuj",
    gen_regen: "Wygeneruj ponownie",
    gen_save: "Zapisz do kalendarza",
    gen_saving: "Zapisuję...",
    cal_title: "Kalendarz treści",
    cal_subtitle: "Planuj i harmonogramuj posty",
    cal_today: "Dziś",
    cal_selected: "Wybrany dzień",
    cal_choose: "Wybierz datę",
    cal_no_posts: "Brak postów na ten dzień",
    cal_create: "+ Utwórz post",
    cal_days: ["P","W","Ś","C","P","S","N"],
    cal_locale: "pl-PL",
    eng_title: "AI Engagement",
    eng_subtitle: "Komentarze, które brzmią po ludzku",
    eng_post_label: "Treść posta (opcjonalnie)",
    eng_post_ph: "Wklej post, do którego chcesz napisać komentarz...",
    eng_ctx_label: "Kontekst / kąt komentarza",
    eng_ctx_ph: "np. podziękowanie, pytanie, komplement...",
    eng_btn: "💬 Generuj komentarze",
    eng_loading: "Generowanie...",
    eng_output: "Wynik",
    eng_output_title: "Propozycje komentarzy",
    eng_empty: "Wypełnij formularz i kliknij Generuj.",
    eng_working: "Tworzę komentarze...",
    drafts_title: "Zapisane drafty",
    drafts_subtitle: "Twoja biblioteka treści",
    drafts_new: "+ Nowy draft",
    drafts_loading: "Ładowanie...",
    drafts_empty: "Brak draftów. Utwórz pierwszy post!",
    drafts_copy: "Kopiuj",
    drafts_edit: "Edytuj",
    drafts_delete: "Usuń",
    drafts_created: "Utworzono:",
    copied: "Skopiowano ✅",
    copy_err: "Błąd kopiowania.",
    conn_err: "Błąd połączenia.",
    lab_title: "Brand Lab 🧬",
    lab_subtitle: "AI analizuje Twoją markę i uczy się jak ją wzmocnić.",
    lab_step1: "Analiza DNA marki",
    lab_step1_hint: "Wklej 3–10 swoich ostatnich postów (każdy oddziel pustą linią).",
    lab_step1_ph: "Wklej tutaj swoje posty...\n\n(Każdy post oddziel pustą linią)\n\nPost 1...\n\nPost 2...",
    lab_posts_detected: "postów wykrytych",
    lab_btn: "🧬 Analizuj DNA marki",
    lab_analyzing: "Analizuję markę...",
    lab_loading: "Buduję profil DNA Twojej marki...",
    lab_shadow_headline: "Twoja marka jest silna",
    lab_shadow_desc: "AI dopasowuje się do Twojego stylu i subtelnie go wzmacnia.",
    lab_upgrade_headline: "Zauważyliśmy potencjał",
    lab_upgrade_desc: "Pomożemy Ci wzmocnić komunikację — krok po kroku.",
    lab_score: "Brand Score",
    lab_strengths: "✅ Mocne strony",
    lab_weaknesses: "🔧 Do wzmocnienia",
    lab_step2: "Rewrite me better 🔥",
    lab_step2_hint: "Wklej swój post — AI przepisze go w 3 wersjach.",
    lab_using_dna: " Używam Twojego Brand DNA.",
    lab_no_dna: " (Zrób analizę DNA wyżej dla lepszych wyników.)",
    lab_rewrite_ph: "Wklej tutaj post, który chcesz przepisać...",
    lab_rewrite_btn: "🔥 Rewrite me better",
    lab_rewriting: "Przepisuję...",
    lab_rewrite_loading: "Tworzę 3 wersje Twojego posta...",
    lab_variants_title: "3 wersje Twojego posta",
    lvl0_name: "Nasionko",
    lvl1_name: "Kiełek",
    lvl2_name: "Mała roślina",
    lvl3_name: "Pierwsze liście",
    lvl4_name: "Zdrowa roślina",
    lvl5_name: "Pąki",
    lvl6_name: "Kwiat",
    lvl7_name: "Ogród marki",
  },
  nl: {
    greeting_morning: "Goedemorgen",
    greeting_afternoon: "Hoi",
    greeting_evening: "Goedenavond",
    tagline: "Je hoeft niet alles vandaag te doen.",
    nav_home: "Home",
    nav_generator: "Generator",
    nav_calendar: "Kalender",
    nav_engagement: "Engagement",
    nav_drafts: "Concepten",
    nav_brandlab: "Brand Lab",
    nav_signout: "Uitloggen",
    nav_progress: "Jouw voortgang",
    btn_generate: "✨ Post genereren",
    btn_brandlab: "🧬 Brand Lab",
    btn_calendar: "📅 Kalender openen",
    brand_grows: "Jouw merk groeit",
    posts_label: "Posts",
    scheduled_label: "Ingepland",
    level_label: "Niveau",
    brand_score: "Merkscore",
    recent_drafts: "Recente concepten",
    see_all: "Bekijk alle →",
    no_drafts: "Nog geen concepten. Genereer je eerste post!",
    generate_now: "Nu genereren",
    brand_profile: "Merkprofiel",
    edit: "Bewerken →",
    setup_brand: "Stel je merkprofiel in",
    setup_brand_hint: "Helpt AI betere content voor jou te maken",
    lang_setup_title: "Taalinstellingen",
    lang_app: "App-taal",
    lang_posting: "Talen waarin ik post",
    lang_posting_hint: "AI genereert content in deze talen",
    lang_save: "Instellingen opslaan",
    lang_saved: "Opgeslagen ✅",
    gen_settings: "Instellingen",
    gen_platform: "Platform",
    gen_type: "Posttype",
    gen_topic: "Onderwerp",
    gen_topic_ph: "bijv. lenteaanbieding, nieuw product, klantresultaat",
    gen_tone: "Toon",
    gen_tone_default: "Standaard (merkstem)",
    gen_tone_bold: "Gedurfd & zelfverzekerd",
    gen_tone_casual: "Casual & vriendelijk",
    gen_tone_funny: "Grappig & speels",
    gen_tone_formal: "Formeel & professioneel",
    gen_tone_inspiring: "Inspirerend & motiverend",
    gen_length: "Lengte",
    gen_length_short: "Kort (1–3 regels)",
    gen_length_medium: "Middel (4–6 regels)",
    gen_length_long: "Lang (7–10 regels)",
    gen_hashtags: "Hashtags toevoegen",
    gen_datetime: "Publicatiedatum & -tijd",
    gen_btn: "✨ Content genereren",
    gen_loading: "Genereren...",
    gen_output: "Resultaat",
    gen_output_title: "Gegenereerde post",
    gen_clear: "Wissen",
    gen_empty: "Klik op Genereren om je post te zien.",
    gen_working: "Ik maak content voor jouw merk...",
    gen_preview: "Voorbeeld",
    gen_slot: "Publicatietijdslot",
    gen_no_date: "Geen datum",
    gen_media: "📎 Foto toevoegen (optioneel)",
    gen_canva: "🎨 Ontwerp in Canva, upload hieronder",
    gen_copy: "Kopiëren",
    gen_regen: "Opnieuw genereren",
    gen_save: "Opslaan in kalender",
    gen_saving: "Opslaan...",
    cal_title: "Contentkalender",
    cal_subtitle: "Plan en beheer je posts",
    cal_today: "Vandaag",
    cal_selected: "Geselecteerde dag",
    cal_choose: "Kies een datum",
    cal_no_posts: "Geen posts op deze dag",
    cal_create: "+ Post maken",
    cal_days: ["M","D","W","D","V","Z","Z"],
    cal_locale: "nl-NL",
    eng_title: "AI Engagement",
    eng_subtitle: "Reacties die menselijk klinken",
    eng_post_label: "Postinhoud (optioneel)",
    eng_post_ph: "Plak de post waarop je wil reageren...",
    eng_ctx_label: "Context / invalshoek",
    eng_ctx_ph: "bijv. bedankje, vraag, compliment...",
    eng_btn: "💬 Reacties genereren",
    eng_loading: "Genereren...",
    eng_output: "Resultaat",
    eng_output_title: "Reactie-ideeën",
    eng_empty: "Vul het formulier in en klik op Genereren.",
    eng_working: "Reacties maken...",
    drafts_title: "Opgeslagen concepten",
    drafts_subtitle: "Jouw contentbibliotheek",
    drafts_new: "+ Nieuw concept",
    drafts_loading: "Laden...",
    drafts_empty: "Geen concepten. Maak je eerste post!",
    drafts_copy: "Kopiëren",
    drafts_edit: "Bewerken",
    drafts_delete: "Verwijderen",
    drafts_created: "Aangemaakt:",
    copied: "Gekopieerd ✅",
    copy_err: "Kopiëren mislukt.",
    conn_err: "Verbindingsfout.",
    lab_title: "Brand Lab 🧬",
    lab_subtitle: "AI analyseert jouw merk en leert hoe het te versterken.",
    lab_step1: "Merk-DNA Analyse",
    lab_step1_hint: "Plak 3–10 recente posts (elke post gescheiden door een lege regel).",
    lab_step1_ph: "Plak hier je posts...\n\n(Elke post scheiden met een lege regel)\n\nPost 1...\n\nPost 2...",
    lab_posts_detected: "posts gedetecteerd",
    lab_btn: "🧬 Merk-DNA analyseren",
    lab_analyzing: "Merk analyseren...",
    lab_loading: "Merk-DNA profiel opbouwen...",
    lab_shadow_headline: "Jouw merk is sterk",
    lab_shadow_desc: "AI past jouw stijl toe en verfijnt het subtiel.",
    lab_upgrade_headline: "We zien potentieel",
    lab_upgrade_desc: "We helpen je communicatie te versterken — stap voor stap.",
    lab_score: "Merkscore",
    lab_strengths: "✅ Sterke punten",
    lab_weaknesses: "🔧 Te versterken",
    lab_step2: "Rewrite me better 🔥",
    lab_step2_hint: "Plak je post — AI herschrijft hem in 3 versies.",
    lab_using_dna: " Jouw merk-DNA wordt gebruikt.",
    lab_no_dna: " (Doe eerst de DNA-analyse hierboven.)",
    lab_rewrite_ph: "Plak hier de post die je wilt herschrijven...",
    lab_rewrite_btn: "🔥 Rewrite me better",
    lab_rewriting: "Herschrijven...",
    lab_rewrite_loading: "3 versies van je post maken...",
    lab_variants_title: "3 versies van je post",
    lvl0_name: "Zaad",
    lvl1_name: "Spruit",
    lvl2_name: "Klein plantje",
    lvl3_name: "Eerste blaadjes",
    lvl4_name: "Gezonde plant",
    lvl5_name: "Knoppen",
    lvl6_name: "Bloem",
    lvl7_name: "Merktuin",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
};

type GeneratedPost = {
  id: string;
  content: string;
  created_at: string;
  scheduled_for?: string | null;
  media_url?: string | null;
};

type ViewType = "dashboard" | "generator" | "calendar" | "engagement" | "drafts" | "brandlab";

type GeneratorForm = {
  platform: "Instagram" | "Facebook" | "LinkedIn";
  type: "Sales post" | "Educational" | "Storytelling";
  topic: string;
};

type BrandDNA = {
  tone: string; energy: string; structure: string; cta: string;
  consistency: string; language: string; avgLength: string;
  usesEmoji: boolean; dominantStyle: string; score: number;
  mode: "shadow" | "upgrade"; strengths: string[]; weaknesses: string[];
  recommendation: string;
};

type RewriteVariant = { label: string; description: string; content: string; };

// ─── Growth Levels ────────────────────────────────────────────────────────────

const GROWTH_LEVEL_DATA = [
  { emoji: "🌰", description_key: "Seed stage" },
  { emoji: "🌱", description_key: "Sprout stage" },
  { emoji: "🪴", description_key: "Small plant" },
  { emoji: "🌿", description_key: "First leaves" },
  { emoji: "🌳", description_key: "Healthy plant" },
  { emoji: "🌸", description_key: "Buds" },
  { emoji: "🌺", description_key: "Flower" },
  { emoji: "🌻", description_key: "Brand Garden" },
];

const LEVEL_DESCRIPTIONS: Record<Lang, string[]> = {
  en: ["Your brand is waiting to sprout.", "First spark — you're starting!", "Your brand has found its voice.", "First post ready for the world.", "Building rhythm, step by step.", "A full content week planned!", "Your brand is starting to talk.", "First campaign. Well done!"],
  pl: ["Twoja marka czeka, żeby zakiełkować.", "Pierwsza iskra — zaczynasz!", "Twoja marka ma już swój głos.", "Pierwszy post gotowy do świata.", "Budujesz rytm, krok po kroku.", "Tydzień treści zaplanowany!", "Twoja marka zaczyna rozmawiać.", "Pierwsza kampania. Brawo!"],
  nl: ["Jouw merk wacht om te ontkiemen.", "Eerste vonk — je begint!", "Jouw merk heeft zijn stem gevonden.", "Eerste post klaar voor de wereld.", "Ritme opbouwen, stap voor stap.", "Een volle contentweek gepland!", "Jouw merk begint te praten.", "Eerste campagne. Goed gedaan!"],
};

// ─── Challenges ───────────────────────────────────────────────────────────────

type Challenge = {
  id: string;
  label_en: string; label_pl: string; label_nl: string;
  hint_en: string; hint_pl: string; hint_nl: string;
  action?: ViewType;
  check: (posts: GeneratedPost[], profile: BrandProfile | null, ui: Set<string>) => boolean;
};

const CHALLENGES_BY_LEVEL: Challenge[][] = [
  // Level 0
  [
    { id: "c_company",  label_en: "Enter your company name",     label_pl: "Wpisz nazwę firmy",           label_nl: "Bedrijfsnaam invullen",
      hint_en: "What is your brand called?",              hint_pl: "Jak się nazywa Twoja marka?",    hint_nl: "Hoe heet jouw merk?",              action: "dashboard", check: (_, p) => !!p?.company },
    { id: "c_industry", label_en: "Choose your industry",        label_pl: "Wybierz branżę",              label_nl: "Kies je branche",
      hint_en: "What field do you work in?",             hint_pl: "W jakiej dziedzinie działasz?",  hint_nl: "In welk vakgebied werk je?",        action: "dashboard", check: (_, p) => !!p?.industry },
    { id: "c_tone",     label_en: "Choose your communication tone", label_pl: "Wybierz ton komunikacji", label_nl: "Kies je communicatietoon",
      hint_en: "How does your brand speak?",             hint_pl: "Jak mówi Twoja marka?",          hint_nl: "Hoe spreekt jouw merk?",            action: "dashboard", check: (_, p) => !!p?.tone },
    { id: "c_offer",    label_en: "Describe your offer in one sentence", label_pl: "Opisz ofertę jednym zdaniem", label_nl: "Beschrijf je aanbod in één zin",
      hint_en: "What do you offer your customers?",      hint_pl: "Co oferujesz swoim klientom?",   hint_nl: "Wat bied je jouw klanten?",         action: "dashboard", check: (_, p) => !!p?.offer },
    { id: "c_audience", label_en: "Describe your target customer", label_pl: "Opisz swojego klienta",   label_nl: "Beschrijf je doelklant",
      hint_en: "Who is your brand aimed at?",            hint_pl: "Do kogo kierujesz swoją markę?", hint_nl: "Op wie richt jouw merk zich?",      action: "dashboard", check: (_, p) => !!p?.audience },
  ],
  // Level 1
  [
    { id: "c_platform", label_en: "Choose a platform",           label_pl: "Wybierz platformę",           label_nl: "Kies een platform",
      hint_en: "Instagram, Facebook or LinkedIn?",       hint_pl: "Instagram, Facebook czy LinkedIn?", hint_nl: "Instagram, Facebook of LinkedIn?", action: "generator", check: (_, __, ui) => ui.has("platform_chosen") },
    { id: "c_generate", label_en: "Generate your first idea",    label_pl: "Wygeneruj pierwszy pomysł",   label_nl: "Genereer je eerste idee",
      hint_en: "Doesn't have to be perfect — just start", hint_pl: "Nie musi być idealny — zacznij", hint_nl: "Hoeft niet perfect te zijn — begin gewoon", action: "generator", check: (posts) => posts.length >= 1 },
    { id: "c_draft",    label_en: "Save your first draft",       label_pl: "Zapisz pierwszy draft",       label_nl: "Sla je eerste concept op",
      hint_en: "Click 'Save to calendar' in the generator", hint_pl: "Kliknij 'Zapisz do kalendarza'", hint_nl: "Klik op 'Opslaan in kalender'",  action: "generator", check: (posts) => posts.length >= 1 },
  ],
  // Level 2
  [
    { id: "c_variants", label_en: "Try 3 different post variants", label_pl: "Wypróbuj 3 różne warianty", label_nl: "Probeer 3 verschillende varianten",
      hint_en: "Change tone or type and regenerate",     hint_pl: "Zmień ton lub typ i generuj ponownie", hint_nl: "Wijzig toon of type en genereer opnieuw", action: "generator", check: (_, __, ui) => ui.has("three_variants") },
    { id: "c_posts3",   label_en: "Save 3 drafts to library",    label_pl: "Zapisz 3 drafty do biblioteki", label_nl: "Sla 3 concepten op in bibliotheek",
      hint_en: "Build your content library",             hint_pl: "Buduj swoją bibliotekę treści",   hint_nl: "Bouw je contentbibliotheek",        action: "generator", check: (posts) => posts.length >= 3 },
    { id: "c_dna",      label_en: "Analyze your brand DNA",      label_pl: "Przeanalizuj DNA swojej marki", label_nl: "Analyseer jouw merk-DNA",
      hint_en: "Go to Brand Lab and paste your posts",   hint_pl: "Wejdź w Brand Lab i wklej posty", hint_nl: "Ga naar Brand Lab en plak je posts", action: "brandlab", check: (_, __, ui) => ui.has("dna_analyzed") },
  ],
  // Level 3
  [
    { id: "c_schedule1", label_en: "Schedule your first post",   label_pl: "Zaplanuj pierwszy post",      label_nl: "Plan je eerste post in",
      hint_en: "Choose when the post goes out",          hint_pl: "Zaplanuj kiedy post ma wyjść",   hint_nl: "Kies wanneer de post verschijnt",   action: "calendar", check: (posts) => posts.filter(p => p.scheduled_for).length >= 1 },
    { id: "c_media",     label_en: "Add a photo to a post",      label_pl: "Dodaj zdjęcie do posta",      label_nl: "Voeg een foto toe aan een post",
      hint_en: "Posts with photos get 2x more reach",   hint_pl: "Posty ze zdjęciem mają 2x więcej zasięgów", hint_nl: "Posts met foto krijgen 2x meer bereik", action: "generator", check: (posts) => posts.some(p => !!p.media_url) },
    { id: "c_rewrite",   label_en: "Use 'Rewrite me better'",    label_pl: "Użyj 'Rewrite me better'",   label_nl: "Gebruik 'Rewrite me better'",
      hint_en: "Brand Lab → paste post → 3 versions",   hint_pl: "Brand Lab → wklej post → 3 wersje", hint_nl: "Brand Lab → plak post → 3 versies", action: "brandlab", check: (_, __, ui) => ui.has("rewrite_used") },
  ],
  // Level 4
  [
    { id: "c_posts6",   label_en: "Build a library of 6 posts",  label_pl: "Przygotuj 6 postów w bibliotece", label_nl: "Bouw een bibliotheek van 6 posts",
      hint_en: "Content for 3 weeks at 2 posts/week",   hint_pl: "Materiał na 3 tygodnie przy 2 postach/tydzień", hint_nl: "Content voor 3 weken bij 2 posts/week", action: "generator", check: (posts) => posts.length >= 6 },
    { id: "c_edu",      label_en: "Generate an educational post", label_pl: "Wygeneruj post edukacyjny",    label_nl: "Genereer een educatieve post",
      hint_en: "Type 'Educational' — teach and build authority", hint_pl: "Typ 'Educational' — ucz i buduj autorytet", hint_nl: "Type 'Educational' — leer en bouw autoriteit", action: "generator", check: (_, __, ui) => ui.has("educational_generated") },
    { id: "c_sales",    label_en: "Generate a sales post",        label_pl: "Wygeneruj post sprzedażowy",  label_nl: "Genereer een verkooppost",
      hint_en: "Type 'Sales post' — show what you offer", hint_pl: "Typ 'Sales post' — pokaż co oferujesz", hint_nl: "Type 'Sales post' — laat zien wat je biedt", action: "generator", check: (_, __, ui) => ui.has("sales_generated") },
  ],
  // Level 5
  [
    { id: "c_sched3",   label_en: "Schedule 3 posts in calendar", label_pl: "Zaplanuj 3 posty w kalendarzu", label_nl: "Plan 3 posts in de kalender",
      hint_en: "Spread posts across different days",     hint_pl: "Rozkładaj posty na różne dni",   hint_nl: "Verspreid posts over verschillende dagen", action: "calendar", check: (posts) => posts.filter(p => p.scheduled_for).length >= 3 },
    { id: "c_posts10",  label_en: "Reach 10 posts in library",    label_pl: "Osiągnij 10 postów w bibliotece", label_nl: "Bereik 10 posts in bibliotheek",
      hint_en: "Consistency builds brands",             hint_pl: "Regularność buduje markę",        hint_nl: "Consistentie bouwt merken",          action: "generator", check: (posts) => posts.length >= 10 },
    { id: "c_story",    label_en: "Tell your brand story",         label_pl: "Opowiedz historię marki",    label_nl: "Vertel je merkverhaal",
      hint_en: "Type 'Storytelling' — people buy from people they like", hint_pl: "Typ 'Storytelling'", hint_nl: "Type 'Storytelling' — mensen kopen van mensen die ze kennen", action: "generator", check: (_, __, ui) => ui.has("storytelling_generated") },
  ],
  // Level 6
  [
    { id: "c_engage1",  label_en: "Generate comments for posts",  label_pl: "Wygeneruj komentarze do postów", label_nl: "Genereer reacties op posts",
      hint_en: "Use the Engagement tool",               hint_pl: "Skorzystaj z narzędzia Engagement", hint_nl: "Gebruik de Engagement-tool",        action: "engagement", check: (_, __, ui) => ui.has("engagement_used") },
    { id: "c_engage2",  label_en: "Generate reply ideas",         label_pl: "Wygeneruj pomysły na odpowiedzi", label_nl: "Genereer antwoordideeën",
      hint_en: "Engaging with others builds organic reach", hint_pl: "Reagowanie u innych buduje zasięg", hint_nl: "Reageren op anderen bouwt bereik op", action: "engagement", check: (_, __, ui) => ui.has("engagement_ideas") },
    { id: "c_sched5",   label_en: "Have 5 posts scheduled",       label_pl: "Miej 5 postów zaplanowanych", label_nl: "Heb 5 posts ingepland",
      hint_en: "Steady rhythm = growing brand",         hint_pl: "Stały rytm = rosnąca marka",      hint_nl: "Vast ritme = groeiend merk",         action: "calendar", check: (posts) => posts.filter(p => p.scheduled_for).length >= 5 },
  ],
  // Level 7
  [
    { id: "c_posts20",  label_en: "Reach 20 posts in library",    label_pl: "Osiągnij 20 postów w bibliotece", label_nl: "Bereik 20 posts in bibliotheek",
      hint_en: "Building a real content archive",       hint_pl: "Budujesz prawdziwe archiwum treści", hint_nl: "Je bouwt een echt contentarchief",  action: "generator", check: (posts) => posts.length >= 20 },
    { id: "c_sched10",  label_en: "Schedule 10 posts in calendar", label_pl: "Zaplanuj 10 postów w kalendarzu", label_nl: "Plan 10 posts in de kalender",
      hint_en: "Two weeks of planned content 🔥",       hint_pl: "Dwa tygodnie zaplanowanego contentu 🔥", hint_nl: "Twee weken geplande content 🔥",   action: "calendar", check: (posts) => posts.filter(p => p.scheduled_for).length >= 10 },
    { id: "c_media5",   label_en: "Add photos to 5 posts",        label_pl: "Dodaj zdjęcia do 5 postów",   label_nl: "Voeg foto's toe aan 5 posts",
      hint_en: "Visual content = higher reach every time", hint_pl: "Wizualny content = wyższy zasięg", hint_nl: "Visuele content = meer bereik",     action: "generator", check: (posts) => posts.filter(p => !!p.media_url).length >= 5 },
  ],
];

const LEVEL_TITLES: Record<Lang, string[]> = {
  en: ["Level 0 — Know your brand","Level 1 — First spark","Level 2 — Brand voice","Level 3 — First post","Level 4 — Mini routine","Level 5 — Content Week","Level 6 — Engagement","Level 7 — Campaign 🚀"],
  pl: ["Level 0 — Poznaj swoją markę","Level 1 — Pierwsza iskra","Level 2 — Głos marki","Level 3 — Pierwszy post","Level 4 — Mini rutyna","Level 5 — Content Week","Level 6 — Engagement","Level 7 — Kampania 🚀"],
  nl: ["Level 0 — Ken je merk","Level 1 — Eerste vonk","Level 2 — Merkstem","Level 3 — Eerste post","Level 4 — Mini-routine","Level 5 — Contentweek","Level 6 — Engagement","Level 7 — Campagne 🚀"],
};

const LEVEL_SUBTITLES: Record<Lang, string[]> = {
  en: ["Start light. No pressure.","You're not publishing today — just writing. No pressure.","Time to find the style that fits you.","One small, real step. One post ready for the world.","Not every day. 2 small steps a week is enough.","Plan a full week. You'll feel in control — we promise.","You're not just publishing — you're starting to talk.","Time for something bigger. Your first brand campaign."],
  pl: ["Zacznij lekko. Żadnej presji.","Dziś nie publikujesz — tylko piszesz. Bez presji.","Czas znaleźć styl, który pasuje właśnie do Ciebie.","Mały, realny krok. Jeden post gotowy do świata.","Nie codziennie. 2 małe kroki w tygodniu wystarczą.","Zaplanuj cały tydzień. Poczujesz kontrolę — obiecujemy.","Nie tylko publikujesz — zaczynasz rozmawiać.","Czas na coś większego. Pierwsza kampania marki."],
  nl: ["Begin licht. Geen druk.","Je publiceert vandaag niet — je schrijft gewoon. Geen druk.","Tijd om de stijl te vinden die bij jou past.","Een kleine, echte stap. Één post klaar voor de wereld.","Niet elke dag. 2 kleine stappen per week is genoeg.","Plan een hele week. Je voelt controle — we beloven het.","Je publiceert niet alleen — je begint te praten.","Tijd voor iets groters. Jouw eerste merkcampagne."],
};

const LEVEL_ENCOURAGEMENTS: Record<Lang, string[]> = {
  en: ["Small step = progress. That's enough for today.","Today one draft is enough.","You don't have to do everything today.","One post is already enough.","Your brand resting? Come back with one small step.","Feed your brand with one small step.","Small step = progress. One comment changes a lot.","Your brand has grown. Time to build a garden."],
  pl: ["Mały krok = progres. To wystarczy na dziś.","Dzisiaj wystarczy jeden draft.","Nie musisz robić wszystkiego dziś.","Jeden post to już wystarczająco dużo.","Twoja marka chwilę odpoczywa? Wróć z jednym małym krokiem.","Nakarm swoją markę jednym małym krokiem.","Mały krok = progres. Jeden komentarz zmienia dużo.","Twoja marka urosła. Czas zbudować ogród."],
  nl: ["Kleine stap = vooruitgang. Dat is genoeg voor vandaag.","Één concept is genoeg voor vandaag.","Je hoeft niet alles vandaag te doen.","Één post is al genoeg.","Jouw merk rust even? Kom terug met één kleine stap.","Voed je merk met één kleine stap.","Kleine stap = vooruitgang. Één reactie maakt veel uit.","Jouw merk is gegroeid. Tijd om een tuin te bouwen."],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeCurrentLevel(posts: GeneratedPost[], profile: BrandProfile | null, ui: Set<string>): number {
  for (let lvl = 0; lvl <= 7; lvl++) {
    const challenges = CHALLENGES_BY_LEVEL[lvl];
    if (!challenges?.length) continue;
    if (!challenges.every((c) => c.check(posts, profile, ui))) return lvl;
  }
  return 7;
}

function getGreeting(lang: Lang) {
  const h = new Date().getHours();
  if (h < 12) return T[lang].greeting_morning;
  if (h < 17) return T[lang].greeting_afternoon;
  return T[lang].greeting_evening;
}

function getStreakState(): { drops: number; resting: boolean } {
  try {
    const raw = localStorage.getItem("digin_streak");
    if (!raw) return { drops: 0, resting: false };
    const { dates } = JSON.parse(raw) as { dates: string[] };
    const lastDate = dates[dates.length - 1];
    const daysSinceLast = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 999;
    const thisWeek = dates.filter((d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000) < 7).length;
    return { drops: Math.min(thisWeek, 7), resting: daysSinceLast > 2 };
  } catch { return { drops: 0, resting: false }; }
}

function markActivityToday() {
  try {
    const raw = localStorage.getItem("digin_streak");
    const today = new Date().toDateString();
    const { dates = [] } = raw ? JSON.parse(raw) : { dates: [] };
    if (!dates.includes(today)) { dates.push(today); localStorage.setItem("digin_streak", JSON.stringify({ dates: dates.slice(-30) })); }
  } catch {}
}

// ─── Challenge Alert ──────────────────────────────────────────────────────────

function ChallengeAlert({ posts, profile, currentLevel, ui, lang, onNavigate }: {
  posts: GeneratedPost[]; profile: BrandProfile | null; currentLevel: number;
  ui: Set<string>; lang: Lang; onNavigate: (v: ViewType) => void;
}) {
  const challenges = CHALLENGES_BY_LEVEL[currentLevel] ?? [];
  const { drops, resting } = getStreakState();
  const t = T[lang];

  if (currentLevel === 7 && challenges.every((c) => c.check(posts, profile, ui))) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌻</span>
          <div>
            <p className="text-base font-bold text-amber-800">{GROWTH_LEVEL_DATA[7].emoji} {T[lang][`lvl7_name`]} — MAX!</p>
            <p className="text-sm text-amber-600">DiGin Legend 🏆</p>
          </div>
        </div>
      </div>
    );
  }

  const results = challenges.map((c) => ({
    ...c,
    done: c.check(posts, profile, ui),
    label: c[`label_${lang}` as keyof Challenge] as string,
    hint: c[`hint_${lang}` as keyof Challenge] as string,
  }));
  const doneCount = results.filter((r) => r.done).length;
  const progressPct = results.length ? Math.round((doneCount / results.length) * 100) : 0;
  const emoji = GROWTH_LEVEL_DATA[currentLevel]?.emoji ?? "🌱";

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{emoji}</span>
            <p className="text-sm font-bold text-emerald-900">{LEVEL_TITLES[lang][currentLevel]}</p>
          </div>
          <p className="text-xs text-emerald-600 leading-snug pl-7">{LEVEL_SUBTITLES[lang][currentLevel]}</p>
        </div>
        <span className="text-xs font-bold text-white bg-emerald-500 rounded-full px-2.5 py-1 shrink-0 ml-2">{doneCount}/{results.length}</span>
      </div>
      {resting && (
        <div className="mt-3 mb-1 rounded-xl bg-emerald-100/60 px-3 py-2 text-xs text-emerald-700 font-medium">
          🌿 {lang === "en" ? "Your brand is resting. Come back with one small step." : lang === "pl" ? "Twoja marka chwilę odpoczywa. Wróć z jednym małym krokiem." : "Jouw merk rust even. Kom terug met één kleine stap."}
        </div>
      )}
      <div className="mt-3 mb-4 h-2 w-full rounded-full bg-emerald-100">
        <div className="h-2 rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="space-y-2">
        {results.map((c) => (
          <div key={c.id} onClick={() => { if (!c.done && c.action) onNavigate(c.action); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${c.done ? "bg-white/50 cursor-default" : "bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer active:scale-[0.99]"}`}>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.done ? "bg-emerald-500 text-white" : "border-2 border-emerald-200"}`}>{c.done ? "✓" : ""}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${c.done ? "line-through text-slate-400" : "text-slate-800"}`}>{c.label}</p>
              {!c.done && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.hint}</p>}
            </div>
            {!c.done && <span className="text-slate-300 shrink-0">›</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-emerald-600 font-medium italic">{LEVEL_ENCOURAGEMENTS[lang][currentLevel]}</p>
        <div className="flex gap-0.5">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={`text-sm ${i < drops ? "opacity-100" : "opacity-20"}`}>💧</span>)}</div>
      </div>
    </div>
  );
}

// ─── Language Setup Card ──────────────────────────────────────────────────────

function LanguageSetup({ lang, postLangs, onSave }: {
  lang: Lang;
  postLangs: PostLang[];
  onSave: (appLang: Lang, postLangs: PostLang[]) => void;
}) {
  const [appLang, setAppLang] = useState<Lang>(lang);
  const [pLangs, setPLangs] = useState<PostLang[]>(postLangs);
  const [saved, setSaved] = useState(false);
  const t = T[lang];

  const togglePostLang = (l: PostLang) => {
    setPLangs((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  };

  const handleSave = () => {
    onSave(appLang, pLangs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">{t.lang_setup_title}</p>

      <div className="mb-4">
        <p className="text-sm font-medium text-slate-700 mb-2">{t.lang_app}</p>
        <div className="flex gap-2">
          {(["en","pl","nl"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setAppLang(l)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${appLang === l ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"}`}>
              {LANG_FLAGS[l]} {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium text-slate-700 mb-1">{t.lang_posting}</p>
        <p className="text-xs text-slate-400 mb-2">{t.lang_posting_hint}</p>
        <div className="flex gap-2">
          {(["en","pl","nl"] as PostLang[]).map((l) => (
            <button key={l} onClick={() => togglePostLang(l)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${pLangs.includes(l) ? "bg-slate-800 text-white border-slate-800 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}>
              {LANG_FLAGS[l]} {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition">
        {saved ? t.lang_saved : t.lang_save}
      </button>
    </div>
  );
}

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  shadow: { label: "Shadow Mode", emoji: "🔮", bgClass: "bg-emerald-50 border-emerald-200", badgeClass: "bg-emerald-500 text-white" },
  upgrade: { label: "Upgrade Mode", emoji: "🚀", bgClass: "bg-amber-50 border-amber-200", badgeClass: "bg-amber-500 text-white" },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 36; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center"><p className="text-xl font-bold text-slate-900">{score}</p><p className="text-[10px] text-slate-400 leading-none">/ 100</p></div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [view, setView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showLangSettings, setShowLangSettings] = useState(false);

  // Language
  const [lang, setLang] = useState<Lang>("en");
  const [postLangs, setPostLangs] = useState<PostLang[]>(["en"]);

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [savingToCalendar, setSavingToCalendar] = useState(false);

  const [generateError, setGenerateError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [generatorForm, setGeneratorForm] = useState<GeneratorForm>({ platform: "Instagram", type: "Sales post", topic: "" });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [tone, setTone] = useState("default");
  const [length, setLength] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState(() => toDateTimeLocalString(new Date()));
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [engagementPost, setEngagementPost] = useState("");
  const [engagementContext, setEngagementContext] = useState("");
  const [engagementComments, setEngagementComments] = useState<string[]>([]);
  const [loadingEngagement, setLoadingEngagement] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  const [analyzePosts, setAnalyzePosts] = useState("");
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriteVariants, setRewriteVariants] = useState<RewriteVariant[]>([]);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewriteError, setRewriteError] = useState("");
  const [rewriteMeta, setRewriteMeta] = useState<{ mode: string; userStylePct: number; improvePct: number } | null>(null);
  const [copiedRewriteIdx, setCopiedRewriteIdx] = useState<number | null>(null);

  const [uiCompletions, setUiCompletions] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("digin_ui_completions");
      if (stored) setUiCompletions(new Set(JSON.parse(stored)));
      const storedLang = localStorage.getItem("digin_lang") as Lang | null;
      if (storedLang && ["en","pl","nl"].includes(storedLang)) setLang(storedLang);
      const storedPostLangs = localStorage.getItem("digin_post_langs");
      if (storedPostLangs) setPostLangs(JSON.parse(storedPostLangs));
    } catch {}
  }, []);

  function markUiComplete(key: string) {
    setUiCompletions((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      try { localStorage.setItem("digin_ui_completions", JSON.stringify([...next])); } catch {}
      markActivityToday();
      return next;
    });
  }

  useEffect(() => { markUiComplete("platform_chosen"); }, [generatorForm.platform]);
  useEffect(() => {
    if (generatorForm.type === "Educational") markUiComplete("educational_generated");
    if (generatorForm.type === "Sales post") markUiComplete("sales_generated");
    if (generatorForm.type === "Storytelling") markUiComplete("storytelling_generated");
  }, [generatorForm.type]);

  const handleLangSave = (appLang: Lang, pLangs: PostLang[]) => {
    setLang(appLang);
    setPostLangs(pLangs);
    try {
      localStorage.setItem("digin_lang", appLang);
      localStorage.setItem("digin_post_langs", JSON.stringify(pLangs));
    } catch {}
    setShowLangSettings(false);
  };

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const connectFacebook = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;

    if (!appId) {
      alert("Missing NEXT_PUBLIC_META_APP_ID");
      return;
    }

    const redirectUri = encodeURIComponent(
      "https://digin-two.vercel.app/api/meta/connect"
    );

  const scope = encodeURIComponent(
  "pages_show_list,pages_read_engagement"
);

    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  };
  async function loadProfile() {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;
      const json = await res.json();
      if (!res.ok) return;
      if (!json.data) { window.location.href = "/onboarding"; return; }
      setBrandProfile(json.data);
    } catch {} finally { setLoadingProfile(false); }
  }

 async function loadPosts() {
  try {
    setLoadingPosts(true);
    setPostsError("");

    const res = await fetch("/api/posts", {
      method: "GET",
      cache: "no-store",
    });

    const ct = res.headers.get("content-type") || "";

    if (!ct.includes("application/json")) {
      setPostsError("Endpoint error.");
      return;
    }

    const json = await res.json();

    if (!res.ok) {
      setPostsError(json.error || "Load error.");
      return;
    }

    setPosts(json.data || []);
  } catch {
    setPostsError(String(T[lang].conn_err));
  } finally {
    setLoadingPosts(false);
  }
}

  useEffect(() => { loadProfile(); loadPosts(); }, []);

  const t = T[lang];

  const handleGenerate = async () => {
    try {
      setLoadingGenerate(true); setGenerateError(""); setGeneratedPost("");
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...generatorForm, includeHashtags, tone, length, postLangs }),
      });
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Generation error."); return; }
      if (json.output) {
        setGeneratedPost(json.output);
        markActivityToday();
        try {
          const count = parseInt(localStorage.getItem("digin_gen_count") || "0") + 1;
          localStorage.setItem("digin_gen_count", String(count));
          if (count >= 3) markUiComplete("three_variants");
        } catch {}
      }
    } catch {
  setGenerateError(
    Array.isArray(t.conn_err) ? t.conn_err[0] : t.conn_err
  );
} finally {
  setLoadingGenerate(false);
}
};
  const handleSaveToCalendar = async () => {
    try {
      if (!generatedPost.trim()) { setGenerateError("Generate a post first."); return; }
      setSavingToCalendar(true); setGenerateError(""); setSaveMessage("");
      let finalMediaUrl = mediaUrl.startsWith("http") ? mediaUrl : "";
      if (mediaFile && !finalMediaUrl) {
        setUploadingMedia(true);
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileName = `${Date.now()}-${mediaFile.name}`;
        const { data, error } = await supabase.storage.from("post-media").upload(fileName, mediaFile);
        if (!error && data) {
          const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(data.path);
          finalMediaUrl = urlData.publicUrl; setMediaUrl(finalMediaUrl);
        }
        setUploadingMedia(false);
      }
      const scheduledForISO = new Date(scheduledDate).toISOString();
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: generatedPost, scheduled_for: scheduledForISO, media_url: finalMediaUrl || null }) });
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Save error."); return; }
      await loadPosts();
      const savedDate = new Date(scheduledForISO);
      setSelectedDate(savedDate); setCurrentMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
      setSaveMessage("✅");
 markActivityToday();
 handleNavigate("calendar");
    } catch { 
setGenerateError(String(t.conn_err));
} finally { 
setSavingToCalendar(false);
 }
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopyMessage(String(t.copied)); setTimeout(() => setCopyMessage(""), 2000); }
    catch { setCopyMessage(String(t.copy_err)); }
  };

  const handleDelete = async (id: string) => {
    try { const res = await fetch("/api/posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (res.ok) await loadPosts(); } catch {}
  };

  const handleGenerateEngagement = async () => {
    try {
      setLoadingEngagement(true); setEngagementError(""); setEngagementComments([]);
      const res = await fetch("/api/engagement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postContent: engagementPost, commentContext: engagementContext }) });
      const json = await res.json();
      if (!res.ok) { setEngagementError(json.error || "Error."); return; }
      setEngagementComments(json.comments || []);
      markUiComplete("engagement_used"); markUiComplete("engagement_ideas"); markActivityToday();
    } catch {
 setEngagementError(String(t.conn_err));
} finally {
  setLoadingEngagement(false);
}
  };

  const handleAnalyzeDNA = async () => {
    const postList = analyzePosts.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 20);
    if (postList.length < 2) { setAnalyzeError("Paste at least 2 posts separated by a blank line."); return; }
    try {
      setLoadingAnalyze(true); setAnalyzeError(""); setBrandDNA(null);
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts: postList }) });
      const json = await res.json();
      if (!res.ok) { setAnalyzeError(json.error || "Analysis error."); return; }
      setBrandDNA(json.brandDNA); markUiComplete("dna_analyzed"); markActivityToday();
    } catch { 
setAnalyzeError(String(t.conn_err));
 } finally { setLoadingAnalyze(false); }
  };

  const handleRewrite = async () => {
    if (!rewriteInput.trim()) { setRewriteError("Paste a post to rewrite."); return; }
    try {
      setLoadingRewrite(true); setRewriteError(""); setRewriteVariants([]); setRewriteMeta(null);
      const res = await fetch("/api/rewrite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: rewriteInput, brandDNA, postCount: posts.length }) });
      const json = await res.json();
      if (!res.ok) { setRewriteError(json.error || "Error."); return; }
      setRewriteVariants(json.variants || []); setRewriteMeta({ mode: json.mode, userStylePct: json.userStylePct, improvePct: json.improvePct });
      markUiComplete("rewrite_used"); markActivityToday();
    } catch { 
setRewriteError(String(t.conn_err)); 
} finally {
 setLoadingRewrite(false); }
  };

  const handleNavigate = (v: ViewType) => { setView(v); setSidebarOpen(false); if (v === "drafts") markUiComplete("drafts_reviewed"); };

  const stats = useMemo(() => ({ total: posts.length, scheduled: posts.filter((p) => p.scheduled_for).length }), [posts]);
  const recentPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const postsForSelectedDate = useMemo(() => { if (!selectedDate) return []; return posts.filter((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), selectedDate)); }, [posts, selectedDate]);
  const monthLabel = currentMonth.toLocaleDateString(String(t.cal_locale), { month: "long", year: "numeric" });
  const currentLevel = useMemo(() => computeCurrentLevel(posts, brandProfile, uiCompletions), [posts, brandProfile, uiCompletions]);
  const levelEmoji = GROWTH_LEVEL_DATA[currentLevel]?.emoji ?? "🌱";
  const levelName = t[`lvl${currentLevel}_name` as keyof typeof t] ?? "";
  const levelDesc = LEVEL_DESCRIPTIONS[lang][currentLevel] ?? "";
  const greeting = getGreeting(lang);
  const userName = brandProfile?.company || "";

  const NAV_ITEMS = [
    { id: "dashboard" as ViewType, label: t.nav_home, icon: "🏠" },
    { id: "generator" as ViewType, label: t.nav_generator, icon: "✨" },
    { id: "calendar"  as ViewType, label: t.nav_calendar, icon: "📅" },
    { id: "engagement"as ViewType, label: t.nav_engagement, icon: "💬" },
    { id: "drafts"    as ViewType, label: t.nav_drafts, icon: "📝" },
    { id: "brandlab"  as ViewType, label: t.nav_brandlab, icon: "🧬" },
  ];

  const analyzePostList = analyzePosts.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 20);

  const SidebarContent = () => (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white text-lg font-bold shadow-sm">D</div>
        <div><h1 className="text-lg font-bold tracking-tight text-slate-900">DiGin</h1><p className="text-xs text-slate-400">AI Marketing Assistant</p></div>
      </div>

      {/* Language switcher */}
      <div className="mb-4 flex gap-1.5 rounded-xl bg-slate-50 border border-slate-100 p-1">
        {(["en","pl","nl"] as Lang[]).map((l) => (
          <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("digin_lang", l); } catch {} }}
            className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition ${lang === l ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
            {LANG_FLAGS[l]} {l.toUpperCase()}
          </button>
        ))}
      </div>

      <nav className="space-y-1 mb-4">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => handleNavigate(item.id)}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${view === item.id ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
            <span className="text-base">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {item.id === "brandlab" && !uiCompletions.has("dna_analyzed") && <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-400" />}
          </button>
        ))}
      </nav>

      {/* Posting languages indicator */}
      <div className="mb-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{t.lang_posting}</p>
        <div className="flex gap-1.5 flex-wrap">
          {(["en","pl","nl"] as PostLang[]).map((l) => (
            <button key={l} onClick={() => {
              const next = postLangs.includes(l) ? postLangs.filter(x => x !== l) : [...postLangs, l];
              setPostLangs(next); try { localStorage.setItem("digin_post_langs", JSON.stringify(next)); } catch {}
            }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${postLangs.includes(l) ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400"}`}>
              {LANG_FLAGS[l]} {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">{t.nav_progress}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{levelEmoji}</span>
          <div><p className="text-sm font-semibold text-slate-800">{levelName}</p><p className="text-xs text-emerald-600">{t.level_label} {currentLevel}</p></div>
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-snug">{levelDesc}</p>
      </div>
      <button onClick={handleSignOut} className="mt-3 w-full flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
        <span>👋</span> {t.nav_signout}
      </button>
    </>
  );

  const BottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {([
          { id: "dashboard" as ViewType, label: t.nav_home, icon: "🏠" },
          { id: "calendar"  as ViewType, label: t.nav_calendar, icon: "📅" },
          { id: "drafts"    as ViewType, label: t.nav_drafts, icon: "📝" },
          { id: "brandlab"  as ViewType, label: "Lab", icon: "🧬" },
        ]).map((item) => (
          <button key={item.id} onClick={() => handleNavigate(item.id)} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-2xl">{item.icon}</span>
            <span className={`text-xs font-medium ${view === item.id ? "text-emerald-600" : "text-slate-400"}`}>{item.label}</span>
          </button>
        ))}
        <button onClick={() => handleNavigate("generator")} className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg -mt-4">
          <span className="text-xl">+</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
          <img src={lightboxUrl} alt="full" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[270px] flex-col border-r border-slate-100 bg-white px-5 py-6 overflow-y-auto"><SidebarContent /></aside>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-10 w-[270px] bg-white px-5 py-6 overflow-y-auto">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 text-xl">✕</button>
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div className="p-4 lg:p-8 space-y-5 max-w-2xl mx-auto lg:max-w-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{greeting}{userName ? `, ${userName}` : ""}! {levelEmoji}</h2>
<div className="mt-4">
  <button
    onClick={connectFacebook}
    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
  >
    🔗 Połącz z Facebook
  </button>
</div>
                  <p className="text-sm text-slate-500 mt-0.5">{t.tagline}</p>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">☰</button>
              </div>

              {!loadingPosts && !loadingProfile && (
                <ChallengeAlert posts={posts} profile={brandProfile} currentLevel={currentLevel} ui={uiCompletions} lang={lang} onNavigate={handleNavigate} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleNavigate("generator")} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition">{t.btn_generate}</button>
                <button onClick={() => handleNavigate("brandlab")} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">{t.btn_brandlab}</button>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Connect Meta
                    </p>
                    <p className="text-xs text-slate-500">
                      Connect Facebook to publish posts later.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={connectFacebook}
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Połącz z Facebook
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.brand_grows}</p>
                  <span className="text-2xl">{levelEmoji}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{levelName} <span className="text-sm font-normal text-slate-400">— {t.level_label} {currentLevel}</span></p>
                <p className="text-sm text-slate-500 mt-0.5 mb-4">{levelDesc}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-center"><p className="text-xl font-bold text-slate-900">{stats.total}</p><p className="text-xs text-slate-500">{t.posts_label}</p></div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="text-center"><p className="text-xl font-bold text-slate-900">{stats.scheduled}</p><p className="text-xs text-slate-500">{t.scheduled_label}</p></div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="text-center"><p className="text-xl font-bold text-emerald-600">Lv.{currentLevel}</p><p className="text-xs text-slate-500">{t.level_label}</p></div>
                  {brandDNA && <><div className="h-8 w-px bg-slate-100" /><div className="text-center"><p className="text-xl font-bold" style={{ color: brandDNA.score >= 70 ? "#10b981" : brandDNA.score >= 50 ? "#f59e0b" : "#ef4444" }}>{brandDNA.score}</p><p className="text-xs text-slate-500">{t.brand_score}</p></div></>}
                </div>
              </div>

              {/* Posting languages quick display */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.lang_posting}</p>
                  <div className="flex gap-1.5">
                    {(["en","pl","nl"] as PostLang[]).map((l) => (
                      <button key={l} onClick={() => {
                        const next = postLangs.includes(l) ? postLangs.filter(x => x !== l) : [...postLangs, l];
                        setPostLangs(next); try { localStorage.setItem("digin_post_langs", JSON.stringify(next)); } catch {}
                      }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${postLangs.includes(l) ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"}`}>
                        {LANG_FLAGS[l]} {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.lang_posting_hint}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.recent_drafts}</p>
                  <button onClick={() => handleNavigate("drafts")} className="text-xs text-emerald-600 font-medium">{t.see_all}</button>
                </div>
                {loadingPosts && <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-400">{t.drafts_loading}</div>}
                {!loadingPosts && recentPosts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <p className="text-2xl mb-2">🌱</p>
                    <p className="text-sm text-slate-400">{t.no_drafts}</p>
                    <button onClick={() => handleNavigate("generator")} className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">{t.generate_now}</button>
                  </div>
                )}
                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <button key={post.id} onClick={() => handleNavigate("drafts")} className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-emerald-200 hover:shadow-sm transition">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden">
                        {post.media_url ? <img src={post.media_url} alt="media" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-emerald-600">{(post.content.replace(/[^a-zA-Z]/g, "").charAt(0) || "D").toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.content.split("\n")[0] || "Draft"}</p>
                        <p className="mt-0.5 text-xs text-emerald-600 font-medium">{post.scheduled_for ? `📅 ${formatDate(post.scheduled_for, String(t.cal_locale))}` : "Draft"}</p>
                      </div>
                      <span className="text-slate-300">›</span>
                    </button>
                  ))}
                </div>
              </div>

              {brandProfile && (
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.brand_profile}</p>
                    <Link href="/edit-brand" className="text-xs text-emerald-600 font-medium">{t.edit}</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brandProfile.company && <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{brandProfile.company}</span>}
                    {brandProfile.industry && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.industry}</span>}
                    {brandProfile.tone && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.tone}</span>}
                  </div>
                </div>
              )}
              {!brandProfile && !loadingProfile && (
                <Link href="/edit-brand" className="flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition">
                  <span className="text-2xl">🧠</span>
                  <div><p className="text-sm font-semibold text-emerald-800">{t.setup_brand}</p><p className="text-xs text-emerald-600">{t.setup_brand_hint}</p></div>
                  <span className="ml-auto text-emerald-500">›</span>
                </Link>
              )}
            </div>
          )}

          {/* ── GENERATOR ── */}
          {view === "generator" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">{t.nav_generator}</h2><p className="text-sm text-slate-500">AI content for your brand</p></div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.gen_settings}</p>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.gen_platform}</label>
                    <select value={generatorForm.platform} onChange={(e) => setGeneratorForm((p) => ({ ...p, platform: e.target.value as GeneratorForm["platform"] }))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option>Instagram</option><option>Facebook</option><option>LinkedIn</option>
                    </select></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.gen_type}</label>
                    <select value={generatorForm.type} onChange={(e) => setGeneratorForm((p) => ({ ...p, type: e.target.value as GeneratorForm["type"] }))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option>Sales post</option><option>Educational</option><option>Storytelling</option>
                    </select></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{String(t.gen_topic)}</label>
                    <input value={generatorForm.topic} onChange={(e) => setGeneratorForm((p) => ({ ...p, topic: e.target.value }))} placeholder={String(t.gen_topic_ph)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.gen_tone}</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option value="default">{t.gen_tone_default}</option><option value="bold">{t.gen_tone_bold}</option><option value="casual">{t.gen_tone_casual}</option><option value="funny">{t.gen_tone_funny}</option><option value="formal">{t.gen_tone_formal}</option><option value="inspiring">{t.gen_tone_inspiring}</option>
                    </select></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.gen_length}</label>
                    <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option value="short">{t.gen_length_short}</option><option value="medium">{t.gen_length_medium}</option><option value="long">{t.gen_length_long}</option>
                    </select></div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <input type="checkbox" id="hashtags" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                    <label htmlFor="hashtags" className="text-sm font-medium text-slate-700 cursor-pointer">{t.gen_hashtags}</label>
                  </div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.gen_datetime}</label>
                    <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" /></div>
                  <button onClick={handleGenerate} disabled={loadingGenerate} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loadingGenerate ? t.gen_loading : t.gen_btn}
                  </button>
                  {generateError && <p className="text-sm text-red-500">{generateError}</p>}
                  {copyMessage && <p className="text-sm text-emerald-600">{copyMessage}</p>}
                  {saveMessage && <p className="text-sm text-emerald-600">{saveMessage}</p>}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.gen_output}</p><h3 className="text-lg font-bold text-slate-900">{t.gen_output_title}</h3></div>
                    {generatedPost && <button onClick={() => setGeneratedPost("")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">{t.gen_clear}</button>}
                  </div>
                  {!generatedPost && !loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <span className="text-4xl mb-3">✨</span><p className="text-sm text-slate-400">{t.gen_empty}</p>
                    </div>
                  )}
                  {loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
                      <span className="text-4xl mb-3 animate-bounce">🌱</span><p className="text-sm text-emerald-600 font-medium">{t.gen_working}</p>
                    </div>
                  )}
                  {generatedPost && !loadingGenerate && (
                    <>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">{t.gen_preview}</p>
                        <textarea value={generatedPost} onChange={(e) => setGeneratedPost(e.target.value)} className="w-full resize-none rounded-xl bg-transparent text-sm leading-7 text-slate-800 outline-none min-h-[120px]" rows={6} />
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-3 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{t.gen_slot}</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{scheduledDate ? formatDateTime(scheduledDate, String(t.cal_locale)) : String(t.gen_no_date)}</p>
                      </div>
                      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-600 mb-2">{t.gen_media}</p>
                        <a href={generatorForm.platform === "Instagram" ? "https://www.canva.com/create/instagram-posts/" : generatorForm.platform === "Facebook" ? "https://www.canva.com/create/facebook-posts/" : "https://www.canva.com/create/linkedin-banners/"} target="_blank" rel="noopener noreferrer" className="mb-3 flex items-center justify-center gap-2 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition">{t.gen_canva}</a>
                        {mediaUrl && <img src={mediaUrl} alt="preview" className="w-full rounded-lg mb-2 max-h-40 object-cover cursor-pointer" onClick={() => setLightboxUrl(mediaUrl)} />}
                        <input type="file" accept="image/*,video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setMediaFile(file); const r = new FileReader(); r.onload = (ev) => setMediaUrl(ev.target?.result as string); r.readAsDataURL(file); } }} className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCopy(generatedPost)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t.gen_copy}</button>
                        <button onClick={handleGenerate} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t.gen_regen}</button>
                        <button onClick={handleSaveToCalendar} disabled={savingToCalendar || uploadingMedia} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                          {savingToCalendar || uploadingMedia ? t.gen_saving : t.gen_save}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {view === "calendar" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">{t.cal_title}</h2><p className="text-sm text-slate-500">{t.cal_subtitle}</p></div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 capitalize">{monthLabel}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">‹</button>
                      <button onClick={() => setCurrentMonth(new Date())} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">{t.cal_today}</button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">›</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {(t.cal_days as unknown as string[]).map((d: string, i: number) => <div key={i} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isToday = day ? isSameDay(day, new Date()) : false;
                      const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false;
                      const hasPost = !!day && posts.some((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), day));
                      return (
                        <button key={index} onClick={() => { if (!day) return; setSelectedDate(day); setScheduledDate(toDateTimeLocalString(day)); }} disabled={!day}
                          className={`relative min-h-[48px] rounded-xl p-1.5 text-left transition ${!day ? "cursor-default" : isSelected ? "bg-emerald-500 text-white shadow-sm" : isToday ? "bg-emerald-50 border border-emerald-200" : "border border-transparent hover:border-slate-200 hover:bg-slate-50"}`}>
                          {day && <><span className={`text-xs font-medium ${isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-slate-700"}`}>{day.getDate()}</span>{hasPost && <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />}</>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{t.cal_selected}</p>
                  <h3 className="font-bold text-slate-900 mb-4">{selectedDate ? selectedDate.toLocaleDateString(t.cal_locale, { weekday: "long", month: "long", day: "numeric" }) : t.cal_choose}</h3>
                  {postsForSelectedDate.length > 0 ? (
                    <div className="space-y-3">
                      {postsForSelectedDate.map((post) => (
                        <div key={post.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          {post.media_url && <img src={post.media_url} alt="media" className="w-full rounded-lg mb-2 max-h-32 object-cover cursor-pointer" onClick={() => setLightboxUrl(post.media_url ?? null)} />}
                          <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white">{t.gen_copy}</button>
                            <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50">{t.drafts_delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center"><p className="text-sm text-slate-400">{t.cal_no_posts}</p></div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { if (selectedDate) setScheduledDate(toDateTimeLocalString(selectedDate)); handleNavigate("generator"); }} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">{t.cal_create}</button>
                    <button onClick={() => handleNavigate("drafts")} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">{t.nav_drafts}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ENGAGEMENT ── */}
          {view === "engagement" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">{t.eng_title}</h2><p className="text-sm text-slate-500">{t.eng_subtitle}</p></div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.eng_post_label}</label>
                    <textarea value={engagementPost} onChange={(e) => setEngagementPost(e.target.value)} placeholder={String(t.eng_post_ph)} rows={5} className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{t.eng_ctx_label}</label>
                    <input value={engagementContext} onChange={(e) => setEngagementContext(e.target.value)} placeholder={String(t.eng_ctx_ph)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" /></div>
                  <button onClick={handleGenerateEngagement} disabled={loadingEngagement} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                    {loadingEngagement ? t.eng_loading : t.eng_btn}
                  </button>
                  {engagementError && <p className="text-sm text-red-500">{engagementError}</p>}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{t.eng_output}</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t.eng_output_title}</h3>
                  {engagementComments.length === 0 && !loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center"><span className="text-4xl mb-3">💬</span><p className="text-sm text-slate-400">{t.eng_empty}</p></div>
                  )}
                  {loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center"><span className="text-4xl mb-3 animate-bounce">💭</span><p className="text-sm text-emerald-600">{t.eng_working}</p></div>
                  )}
                  <div className="space-y-3">
                    {engagementComments.map((comment, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-700 leading-6">{comment}</p>
                        <div className="mt-2 flex justify-end"><button onClick={() => handleCopy(comment)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">{t.gen_copy}</button></div>
                      </div>
                    ))}
                  </div>
                  {copyMessage && <p className="mt-3 text-sm text-emerald-600">{copyMessage}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── DRAFTS ── */}
          {view === "drafts" && (
            <div className="p-4 lg:p-8 max-w-2xl mx-auto lg:max-w-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                  <div><h2 className="text-xl font-bold text-slate-900">{t.drafts_title}</h2><p className="text-sm text-slate-500">{t.drafts_subtitle}</p></div>
                </div>
                <button onClick={() => handleNavigate("generator")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">{t.drafts_new}</button>
              </div>
              {loadingPosts && <div className="rounded-2xl bg-white border border-slate-100 p-4 text-sm text-slate-400">{t.drafts_loading}</div>}
              {postsError && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-500">{postsError}</div>}
              {!loadingPosts && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                  <span className="text-5xl mb-4">📝</span>
                  <p className="text-slate-500 mb-4">{t.drafts_empty}</p>
                  <button onClick={() => handleNavigate("generator")} className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">{t.generate_now}</button>
                </div>
              )}
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                    {post.media_url && <img src={post.media_url} alt="media" className="w-full rounded-xl mb-3 max-h-48 object-cover cursor-pointer hover:opacity-90 transition" onClick={() => setLightboxUrl(post.media_url ?? null)} />}
                    <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-xs text-slate-400">{t.drafts_created} {formatDateTime(post.created_at, String(t.cal_locale))}</span>
                        {post.scheduled_for && (
  <span className="ml-3 text-xs text-emerald-600">
    📅 {formatDateTime(post.scheduled_for, String(t.cal_locale))}
  </span>
)}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">{t.drafts_copy}</button>
                        <button onClick={() => { setGeneratedPost(post.content); setScheduledDate(post.scheduled_for ? toDateTimeLocalString(new Date(post.scheduled_for)) : toDateTimeLocalString(new Date())); handleNavigate("generator"); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">{t.drafts_edit}</button>
                        <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">{t.drafts_delete}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {copyMessage && <p className="mt-4 text-sm text-emerald-600">{copyMessage}</p>}
            </div>
          )}

          {/* ── BRAND LAB ── */}
          {view === "brandlab" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">{t.lab_title}</h2><p className="text-sm text-slate-500">{t.lab_subtitle}</p></div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
                  <h3 className="font-bold text-slate-900">{t.lab_step1}</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 pl-8">{t.lab_step1_hint}</p>
                <textarea value={analyzePosts} onChange={(e) => setAnalyzePosts(e.target.value)} placeholder={String(t.lab_step1_ph)} rows={8} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition font-mono" />
                <div className="flex items-center justify-between mt-2 mb-4">
                  <p className="text-xs text-slate-400">{analyzePostList.length} {String(t.lab_posts_detected)}</p>
                  {analyzeError && <p className="text-xs text-red-500">{analyzeError}</p>}
                </div>
                <button onClick={handleAnalyzeDNA} disabled={loadingAnalyze || analyzePostList.length < 2} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loadingAnalyze ? t.lab_analyzing : t.lab_btn}
                </button>
              </div>

              {loadingAnalyze && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center">
                  <span className="text-4xl animate-pulse">🧬</span>
                  <p className="mt-3 text-sm text-emerald-700 font-medium">{t.lab_loading}</p>
                </div>
              )}

              {brandDNA && !loadingAnalyze && (() => {
                const modeKey = brandDNA.mode ?? "upgrade";
                const modeCfg = MODE_CONFIG[modeKey];
                return (
                  <div className={`rounded-2xl border p-5 ${modeCfg.bgClass}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${modeCfg.badgeClass}`}>{modeCfg.emoji} {modeCfg.label}</span>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{modeKey === "shadow" ? t.lab_shadow_headline : t.lab_upgrade_headline}</h3>
                        <p className="text-sm text-slate-600 mt-0.5">{modeKey === "shadow" ? t.lab_shadow_desc : t.lab_upgrade_desc}</p>
                        <p className="mt-2 text-sm italic text-slate-500">„{brandDNA.recommendation}"</p>
                      </div>
                      <div className="ml-4 shrink-0 text-center"><ScoreRing score={brandDNA.score} /><p className="text-[10px] text-slate-500 mt-1 font-medium">{t.lab_score}</p></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {[["Tone","tone"],["Energy","energy"],["Structure","structure"],["CTA","cta"],["Consistency","consistency"],["Language","language"],["Length","avgLength"],["Emoji","usesEmoji"]].map(([label, key]) => (
                        <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{key === "usesEmoji" ? (brandDNA.usesEmoji ? "Yes" : "No") : String((brandDNA as any)[key])}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {brandDNA.strengths?.length > 0 && <div className="rounded-xl bg-white/70 p-3"><p className="text-xs font-semibold text-emerald-700 mb-2">{t.lab_strengths}</p>{brandDNA.strengths.map((s,i) => <p key={i} className="text-xs text-slate-700">• {s}</p>)}</div>}
                      {brandDNA.weaknesses?.length > 0 && <div className="rounded-xl bg-white/70 p-3"><p className="text-xs font-semibold text-amber-700 mb-2">{t.lab_weaknesses}</p>{brandDNA.weaknesses.map((w,i) => <p key={i} className="text-xs text-slate-700">• {w}</p>)}</div>}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-xs font-bold">2</span>
                  <h3 className="font-bold text-slate-900">{t.lab_step2}</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 pl-8">{t.lab_step2_hint}{brandDNA ? <span className="text-emerald-600 font-medium">{t.lab_using_dna}</span> : <span>{t.lab_no_dna}</span>}</p>
                {rewriteMeta && (
                  <div className="mb-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center gap-2">
                    <span className="text-sm">{rewriteMeta.mode === "shadow" ? "🔮" : "🚀"}</span>
                    <p className="text-xs text-slate-600"><span className="font-semibold">{rewriteMeta.mode === "shadow" ? "Shadow Mode" : "Upgrade Mode"}</span> — {rewriteMeta.userStylePct}% style, {rewriteMeta.improvePct}% improvement</p>
                  </div>
                )}
                <textarea value={rewriteInput} onChange={(e) => setRewriteInput(e.target.value)} placeholder={tString(t.lab_rewrite_ph)} rows={5} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition mb-3" />
                {rewriteError && <p className="text-sm text-red-500 mb-3">{rewriteError}</p>}
                <button onClick={handleRewrite} disabled={loadingRewrite || !rewriteInput.trim()} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loadingRewrite ? t.lab_rewriting : t.lab_rewrite_btn}
                </button>
              </div>

              {loadingRewrite && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                  <span className="text-4xl animate-bounce">✍️</span>
                  <p className="mt-3 text-sm text-slate-600 font-medium">{t.lab_rewrite_loading}</p>
                </div>
              )}

              {rewriteVariants.length > 0 && !loadingRewrite && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.lab_variants_title}</p>
                  {rewriteVariants.map((v, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white text-[10px] font-bold">{i+1}</span><p className="text-sm font-bold text-slate-900">{v.label}</p></div>
                          <p className="text-xs text-slate-400 mt-0.5 pl-7">{v.description}</p>
                        </div>
                        <button onClick={async () => { await navigator.clipboard.writeText(v.content); setCopiedRewriteIdx(i); setTimeout(() => setCopiedRewriteIdx(null), 2000); }} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                          {copiedRewriteIdx === i ? t.copied : t.gen_copy}
                        </button>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4"><p className="text-sm text-slate-800 leading-7 whitespace-pre-wrap">{v.content}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
      <BottomNav />
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatDateTime(dateString: string, locale: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date); next.setMonth(next.getMonth() + amount); return next;
}

function buildCalendarDays(currentMonth: Date): Array<Date | null> {
  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
  const mondayBasedStart = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];
  for (let i = 0; i < mondayBasedStart; i++) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toDateTimeLocalString(date: Date) {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}