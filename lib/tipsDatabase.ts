// lib/tipsDatabase.ts
// ============================================
// TIPS DE EXPERTO POR CÓDIGO DE CAJA
// ============================================
// 📌 Cómo usar:
// 1. Busca el código de caja (ej: "02T", "R151", "TL8")
// 2. Si existe, agrega más info
// 3. Si no existe, crea una nueva entrada
// ============================================

export const tipsPorCodigo: Record<string, {
    modelo: string;           // Ej: "Ibiza/Vento/Polo"
    diagnostico: string;       // Pregunta que debe hacer NIA
    consejo: string;           // Información técnica
    advertencia?: string;      // Opcional: algo que NO hacer
    aceite?: string;           // Opcional: tipo de aceite
}> = {
    "02T": {
        modelo: "Ibiza/Vento/Polo/Gol/A1",
        diagnostico: "¿Tu auto trae marcha larga o corta? La base de tornillos cambia.",
        consejo: "Compatible con 1.6L, 1.2 TSI y 1.0L 3 cil. Años 2002-2024.",
        advertencia: "Verifica la campana donde va la marcha antes de comprar.",
        aceite: "75W-90"
    },
    "R151": {
        modelo: "Hilux 2.7 / Hiace",
        diagnostico: "¿Se bota la velocidad o es ruido interno?",
        consejo: "Caja sólida para trabajo pesado. Revisa kit de embrague si hay vibración.",
        aceite: "GL-4 75W-90"
    },
    "TL8": {
        modelo: "Renault Duster 6 vel",
        diagnostico: "¿Tu Duster es 4x4 o 4x2? La TL8 tiene primera ultra-corta.",
        consejo: "Usa aceite 75W-80 específico para proteger sincronizadores.",
        advertencia: "NO uses GL-5, daña los bronces.",
        aceite: "75W-80"
    },
    "JR5": {
        modelo: "Renault Duster 5 vel",
        diagnostico: "¿La tercera velocidad raspa?",
        consejo: "Es la versión más básica. Si falla tercera, revisa bronces.",
        aceite: "75W-80"
    },
    "FS5R50A": {
        modelo: "Nissan NP300 / Frontier",
        diagnostico: "¿Tu NP300 es gasolina o diésel? La campana cambia.",
        consejo: "Las de 6 velocidades diésel tienen campana diferente.",
        advertencia: "NO uses GL-5. Usa GL-4 obligatorio.",
        aceite: "GL-4 75W-90"
    },
    "RE4R01A": {
        modelo: "Nissan NP300 Automática",
        diagnostico: "¿Problemas al pasar cambios?",
        consejo: "Cambia aceite cada 60,000 km.",
        aceite: "ATF DEXRON III"
    },
    "SC15M5": {
        modelo: "Chevrolet S10 (anterior)",
        diagnostico: "¿Tu S10 es la Max o la anterior?",
        consejo: "La transmisión cambia completamente entre modelos.",
        aceite: "GL-4 75W-90"
    },
    "SC25M6": {
        modelo: "Chevrolet S10 Max Turbo",
        diagnostico: "¿La sexta zumba o la reversa está dura?",
        consejo: "Sensible al nivel de aceite. Revisa lubricación.",
        aceite: "GL-4 75W-90"
    }
};

// ============================================
// TIPS POR SÍNTOMA
// ============================================
export const tipsPorSintoma: Array<{
    keywords: string[];
    pregunta: string;
    posibleCausa: string;
    modelos?: string[];
}> = [
    {
        keywords: ["zumba", "zumba en quinta", "ruido en quinta"],
        pregunta: "¿El zumbido es en quinta velocidad?",
        posibleCausa: "En D21 puede ser desgaste de baleros o la flecha de mando.",
        modelos: ["D21"]
    },
    {
        keywords: ["reversa dura", "no entra reversa", "reversa no entra"],
        pregunta: "¿La reversa no entra o está dura?",
        posibleCausa: "Puede ser ajuste de chicotes o engrane de reversa.",
        modelos: ["D21", "D22", "Hilux"]
    },
    {
        keywords: ["se bota", "se sale cambio", "brinca cambio"],
        pregunta: "¿Se bota la velocidad al acelerar o desacelerar?",
        posibleCausa: "Horquillas desgastadas o seguros dañados.",
        modelos: ["Hilux", "L200", "Ranger"]
    },
    {
        keywords: ["raspa", "raspa cambio", "rechina"],
        pregunta: "¿Raspa al meter el cambio?",
        posibleCausa: "Sincronizadores (bronces) desgastados.",
        modelos: ["Duster", "Ibiza", "Vento", "NP300"]
    },
    {
        keywords: ["vibra", "vibración", "tiembla"],
        pregunta: "¿La vibración es al arrancar o en carretera?",
        posibleCausa: "Si es al arrancar, puede ser volante bimasa. En carretera, cruzas o baleros.",
        modelos: ["Ranger", "Hilux"]
    }
];