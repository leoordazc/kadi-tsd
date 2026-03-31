// components/JsonLd.tsx
export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "KADI Transmission Systems",
    "description": "Especialistas en transmisiones automotrices y diferenciales con soporte de IA.",
    "areaServed": {
      "@type": "Country",
      "name": "Mexico"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ciudad de México",
      "addressCountry": "MX"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-55-7338-2923",
      "contactType": "customer service",
      "availableLanguage": ["Spanish"]
    },
    "sameAs": [
      "https://twitter.com/kaditsd",
      "https://facebook.com/kaditsd"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}