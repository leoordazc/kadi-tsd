// lib/modelosDatabase.ts
// ============================================
// BASE DE DATOS DE MODELOS COMPATIBLES
// ============================================
// 📌 Cuando agregues un producto en Supabase,
//    también agrega el modelo aquí si es nuevo
// ============================================

export const modelosPorMarca: Record<string, string[]> = {
    "Volkswagen": [
        "vento", "polo", "gol", "lupo", "jetta", "beetle", "amarok", "saveiro"
    ],
    "SEAT": [
        "ibiza", "cordoba", "leon", "altea"
    ],
    "Audi": [
        "a1", "a3", "a4"
    ],
    "Nissan": [
        "np300", "frontier", "d21", "d22", "tsuru", "sentra", "versa", "march"
    ],
    "Toyota": [
        "hilux", "hiace", "tacoma", "4runner", "land cruiser", "corolla", "camry"
    ],
    "Renault": [
        "duster", "sandero", "logan", "kangoo"
    ],
    "Mitsubishi": [
        "l200", "montero", "outlander"
    ],
    "Ford": [
        "ranger", "f150", "f250", "focus", "fiesta"
    ],
    "Chevrolet": [
        "s10", "s10 max", "silverado", "aveo", "spark", "tornado"
    ],
    "Mazda": [
        "bt50", "cx5", "mazda3", "mazda6"
    ],
    "Dodge": [
        "ram", "journey"
    ],
    "Mercedes": [
        "sprinter"
    ],
    "Honda": [
        "civic", "crv", "hrv", "pilot"
    ]
};

// ============================================
// MODELOS CON NOTAS ESPECIALES (DIAGNÓSTICO)
// ============================================
export const modelosEspeciales: Record<string, {
    nota: string;
    preguntaClave: string;
}> = {
    "D21": {
        nota: "La legendaria D21 2.4L. La flecha de mando tiene dos medidas. Dime el año para confirmar.",
        preguntaClave: "¿Tu D21 zumba en quinta o te cuesta la reversa?"
    },
    "D22": {
        nota: "Delicada con aceite. Usar GL-4 obligatorio. La entrada de flecha cambia entre 2.4 y diésel.",
        preguntaClave: "¿Tu D22 es 2.4 gasolina o diésel?"
    },
    "Hilux": {
        nota: "Caja R151 para 2.7 gasolina. Revisar kit de embrague si hay vibración.",
        preguntaClave: "¿Se bota la velocidad o tienes ruido interno?"
    },
    "L200": {
        nota: "Baleros sufren en terracería. Cuarta velocidad se bota es síntoma clásico.",
        preguntaClave: "¿La cuarta se bota? Síntoma de baleros internos."
    },
    "Ranger": {
        nota: "Si vibra al arrancar, revisa volante bimasa (no es la transmisión).",
        preguntaClave: "¿Raspa la tercera o vibra al arrancar?"
    },
    "NP300": {
        nota: "Las diésel de 6 vel tienen campana diferente. NO uses GL-5.",
        preguntaClave: "¿Tu NP300 es gasolina o diésel?"
    },
    "S10": {
        nota: "La transmisión cambia completamente entre S10 normal y S10 Max.",
        preguntaClave: "¿Tu S10 es la Max o la versión anterior?"
    },
    "Duster": {
        nota: "La TL8 (6 vel) tiene primera ultra-corta para off-road.",
        preguntaClave: "¿Tu Duster es de 5 o 6 velocidades?"
    },
    "Vento": {
        nota: "Comparte transmisión 02T con Ibiza, Polo y Gol.",
        preguntaClave: "¿Tu motor es 1.6, 1.2 TSI o 1.0?"
    },
    "Ibiza": {
        nota: "Comparte transmisión 02T con Vento, Polo y Gol.",
        preguntaClave: "¿Tu Ibiza trae marcha larga o corta?"
    }
};