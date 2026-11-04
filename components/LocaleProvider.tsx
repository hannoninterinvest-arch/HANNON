"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "ar" | "fr" | "en";
type Messages = Record<string, string>;

const messages: Record<Locale, Messages> = {
  ar: {
    home:"الرئيسية", about:"من نحن", services:"خدماتنا", projects:"مشاريعنا", reach:"حضورنا الدولي", contact:"اتصل بنا", admin:"الإدارة",
    heroEyebrow:"شركة تونسية للاستثمار وتطوير المشاريع", heroTitle:"نحوّل الفرص الاستراتيجية إلى مشاريع ذات أثر", heroBody:"تربط حانون للإستثمارات العالمية المستثمرين والشركاء الصناعيين ومزودي التكنولوجيا لتطوير مشاريع مستدامة في تونس وإفريقيا والأسواق الدولية.", explore:"اكتشف مشاريعنا", proposal:"قدّم مقترحاً", pillar1:"استثمار استراتيجي", pillar1Body:"تطوير فرص واعدة عبر قطاعات متعددة.", pillar2:"شراكات دولية", pillar2Body:"ربط الخبرات المحلية بالشركاء العالميين.", pillar3:"تنفيذ متكامل", pillar3Body:"مرافقة المشروع من الفكرة إلى الإنجاز.",
    trust:"شريك موثوق للمؤسسات والشركاء الدوليين", trust1:"المؤسسات", trust2:"الشركاء الاستراتيجيون", trust3:"المستثمرون الدوليون", trust4:"التعاون العابر للحدود",
    aboutEyebrow:"من نحن", aboutTitle:"حانون للإستثمارات العالمية", aboutBody:"شركة استثمار وتطوير أعمال مقرها تونس، تعمل على تحديد فرص الاستثمار الاستراتيجية وهيكلتها والترويج لها.", aboutBody2:"نجمع المستثمرين والشركاء الصناعيين ومزودي التكنولوجيا ورواد الأعمال لتطوير مشاريع في الطاقة المتجددة والصحة والفلاحة والتكنولوجيا والتجارة الدولية والصناعة والبنية التحتية.", aboutBody3:"نعمل على تحويل الفرص إلى مشاريع مستدامة من خلال التعاون الدولي وتطوير المشاريع والشراكات الاستراتيجية.", learn:"اكتشف حانون", glance:"حانون في لمحة", headquarters:"المقر", markets:"الأسواق", identify:"نحدّد", identifyBody:"فرص الاستثمار ذات الإمكانات الصناعية والتجارية.", structure:"نهيكل", structureBody:"مشاريع بالشراكة مع المستثمرين والخبراء الصناعيين.", promote:"نطوّر", promoteBody:"فرصاً قابلة للتنفيذ ونوصلها بالشركاء المناسبين.",
    servicesEyebrow:"خدماتنا", servicesTitle:"حلول استراتيجية. تنفيذ دولي.", servicesBody:"نرافق تطوير المشاريع والاستثمار عبر قطاعات متعددة، وننسق بين الشركاء والخبرات والتمويل اللازم لتحقيق نتائج مستدامة.", viewServices:"عرض جميع الخدمات", publishedServices:"ستظهر الخدمات المنشورة هنا.",
    projectsEyebrow:"مشاريع استثمارية", projectsTitle:"فرص مختارة. أثر ملموس.", projectsBody:"اكتشف فرصاً ومشاريع قيد التطوير في تونس والمنطقة والأسواق الدولية.", viewProjects:"عرض جميع المشاريع", publishedProjects:"ستُنشر فرص الاستثمار هنا.",
    globalEyebrow:"حضور دولي", globalTitle:"روابط تمتد عبر القارات", globalBody:"نعمل في تونس وإفريقيا والشرق الأوسط وأوروبا وآسيا، ونتعاون مع المؤسسات المالية والمستثمرين والشركاء الاستراتيجيين.", globalButton:"تواصل مع فريقنا", leadership:"القيادة", managingDirector:"الرئيس التنفيذي", profile:"نبذة عن الرئيس التنفيذي",
    ctaEyebrow:"لنبنِ شراكة مثمرة", ctaTitle:"هل لديكم مشروع استراتيجي؟", ctaBody:"أرسلوا مقترحكم أو استفساركم، وسيتواصل فريقنا معكم عبر البريد الإلكتروني.", discoverServices:"اكتشف خدماتنا",
    quickLinks:"روابط سريعة", allServices:"جميع الخدمات", footerTagline:"نستثمر في الفرص. ونطوّر أثراً مستداماً.", language:"اللغة",
  },
  fr: {
    home:"Accueil", about:"À propos", services:"Services", projects:"Projets", reach:"Présence internationale", contact:"Contact", admin:"Administration",
    heroEyebrow:"Investissement & développement de projets depuis la Tunisie", heroTitle:"Transformer les opportunités stratégiques en projets à impact", heroBody:"HANNON International Investments réunit investisseurs, partenaires industriels et fournisseurs technologiques pour développer des projets durables en Tunisie, en Afrique et sur les marchés internationaux.", explore:"Découvrir nos projets", proposal:"Présenter un projet", pillar1:"Investissement stratégique", pillar1Body:"Développement d’opportunités dans plusieurs secteurs.", pillar2:"Partenariats internationaux", pillar2Body:"Relier l’expertise locale aux partenaires mondiaux.", pillar3:"Accompagnement intégré", pillar3Body:"Accompagner le projet de l’idée à la réalisation.",
    trust:"Au service des institutions et partenaires internationaux", trust1:"Institutions", trust2:"Partenaires stratégiques", trust3:"Investisseurs internationaux", trust4:"Coopération transfrontalière",
    aboutEyebrow:"À propos", aboutTitle:"HANNON International Investments", aboutBody:"Société tunisienne d’investissement et de développement des affaires, HANNON identifie, structure et promeut des opportunités d’investissement stratégiques.", aboutBody2:"Nous rapprochons investisseurs, partenaires industriels, fournisseurs de technologies et entrepreneurs pour développer des projets dans les énergies renouvelables, la santé, l’agriculture, la technologie, le commerce international, l’industrie et les infrastructures.", aboutBody3:"Par la coopération internationale, le développement de projets et les partenariats stratégiques, nous transformons les opportunités en initiatives durables.", learn:"Découvrir HANNON", glance:"HANNON en bref", headquarters:"Siège", markets:"Marchés", identify:"Identifier", identifyBody:"Des opportunités d’investissement à potentiel industriel et commercial.", structure:"Structurer", structureBody:"Des projets avec investisseurs et partenaires industriels.", promote:"Développer", promoteBody:"Des projets réalisables avec les partenaires adaptés.",
    servicesEyebrow:"Nos services", servicesTitle:"Solutions stratégiques. Réalisation internationale.", servicesBody:"Nous accompagnons le développement de projets et d’investissements dans plusieurs secteurs, en coordonnant partenaires, expertises et financements.", viewServices:"Voir tous les services", publishedServices:"Les services publiés apparaîtront ici.",
    projectsEyebrow:"Projets d’investissement", projectsTitle:"Opportunités sélectionnées. Impact concret.", projectsBody:"Découvrez des opportunités et projets en développement en Tunisie, dans la région et sur les marchés internationaux.", viewProjects:"Voir tous les projets", publishedProjects:"Les opportunités d’investissement seront publiées ici.",
    globalEyebrow:"Présence internationale", globalTitle:"Des connexions sur plusieurs continents", globalBody:"Nous intervenons en Tunisie, en Afrique, au Moyen-Orient, en Europe et en Asie, avec des institutions financières, des investisseurs et des partenaires stratégiques.", globalButton:"Contacter notre équipe", leadership:"Direction", managingDirector:"Président-directeur général", profile:"Profil du dirigeant",
    ctaEyebrow:"Construisons un partenariat", ctaTitle:"Vous portez un projet stratégique ?", ctaBody:"Envoyez-nous votre proposition ou votre question. Notre équipe vous répondra par e-mail.", discoverServices:"Découvrir nos services",
    quickLinks:"Liens rapides", allServices:"Tous les services", footerTagline:"Investir dans les opportunités. Développer un impact durable.", language:"Langue",
  },
  en: {
    home:"Home", about:"About", services:"Services", projects:"Projects", reach:"Global Reach", contact:"Contact", admin:"Administration",
    heroEyebrow:"Investment & project development from Tunisia", heroTitle:"Turning strategic opportunities into lasting impact", heroBody:"HANNON International Investments connects investors, industrial partners and technology providers to develop sustainable projects in Tunisia, Africa and international markets.", explore:"Explore our projects", proposal:"Present a proposal", pillar1:"Strategic investment", pillar1Body:"Developing opportunities across multiple sectors.", pillar2:"International partnerships", pillar2Body:"Connecting local expertise with global partners.", pillar3:"End-to-end support", pillar3Body:"Supporting projects from concept to delivery.",
    trust:"Trusted by institutions and international partners", trust1:"Institutions", trust2:"Strategic partners", trust3:"International investors", trust4:"Cross-border cooperation",
    aboutEyebrow:"About us", aboutTitle:"HANNON International Investments", aboutBody:"A Tunisia-based investment and business development company focused on identifying, structuring and promoting strategic opportunities.", aboutBody2:"We connect investors, industrial partners, technology providers and entrepreneurs to develop projects in renewable energy, healthcare, agriculture, technology, international trade, industry and infrastructure.", aboutBody3:"Through international cooperation and strategic partnerships, we turn opportunities into sustainable projects.", learn:"Discover HANNON", glance:"HANNON at a glance", headquarters:"Headquarters", markets:"Markets", identify:"Identify", identifyBody:"Investment opportunities with industrial and commercial potential.", structure:"Structure", structureBody:"Projects with investors and industrial partners.", promote:"Develop", promoteBody:"Investment-ready opportunities with the right partners.",
    servicesEyebrow:"Our services", servicesTitle:"Strategic solutions. Global delivery.", servicesBody:"We support project and investment development across sectors, coordinating partners, expertise and the resources needed for sustainable outcomes.", viewServices:"View all services", publishedServices:"Published services will appear here.",
    projectsEyebrow:"Investment projects", projectsTitle:"Selected opportunities. Tangible impact.", projectsBody:"Explore opportunities and projects under development in Tunisia, the region and international markets.", viewProjects:"View all projects", publishedProjects:"Investment opportunities will be published here.",
    globalEyebrow:"Global reach", globalTitle:"Connected across continents", globalBody:"We work across Tunisia, Africa, the Middle East, Europe and Asia with financial institutions, investors and strategic partners.", globalButton:"Contact our team", leadership:"Leadership", managingDirector:"Chief Executive Officer", profile:"Leadership profile",
    ctaEyebrow:"Let’s build a partnership", ctaTitle:"Are you developing a strategic project?", ctaBody:"Send us your proposal or question. Our team will reply by email.", discoverServices:"Discover our services",
    quickLinks:"Quick links", allServices:"All services", footerTagline:"Investing in opportunity. Building lasting impact.", language:"Language",
  },
};

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  useEffect(() => {
    const saved = window.localStorage.getItem("hannon-locale") as Locale | null;
    if (saved === "ar" || saved === "fr" || saved === "en") setLocale(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("hannon-locale", locale);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (key: string) => messages[locale][key] ?? messages.en[key] ?? key }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
