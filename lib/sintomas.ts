// lib/sintomas.ts
import { tipsPorCodigo, tipsPorSintoma } from './tipsDatabase';
import { modelosEspeciales } from './modelosDatabase';

// ============================================
// DETECCIÓN DE CÓDIGOS
// ============================================
export function obtenerTipPorCodigo(codigo: string): {
    diagnostico?: string;
    consejo?: string;
    advertencia?: string;
} | null {
    const codigoUpper = codigo.toUpperCase();
    const tip = tipsPorCodigo[codigoUpper];
    
    if (!tip) return null;
    
    return {
        diagnostico: tip.diagnostico,
        consejo: tip.consejo,
        advertencia: tip.advertencia
    };
}

// ============================================
// DETECCIÓN DE MODELOS ESPECIALES
// ============================================
export function detectarModeloEspecial(mensaje: string): {
    modelo: string;
    pregunta: string;
    posibleCausa: string;
} | null {
    const mensajeLower = mensaje.toLowerCase();
    
    for (const [modelo, info] of Object.entries(modelosEspeciales)) {
        if (mensajeLower.includes(modelo.toLowerCase())) {
            return {
                modelo,
                pregunta: info.preguntaClave,
                posibleCausa: info.nota
            };
        }
    }
    
    return null;
}

// ============================================
// 🚫 DETECCIÓN DE AUTOMÁTICAS (REDIRECCIÓN)
// ============================================
export function detectarAutomatica(mensaje: string): {
    esAutomatica: boolean;
    respuesta?: string;
} {
    const mensajeLower = mensaje.toLowerCase();
    
    const palabrasAutomatica = [
        'automática', 'automatica', 'automático', 'automatico',
        'triptronic', 'triptronic', 'dsg', 'cvt', 'convertidor',
        'convertidor de par', 'caja automática', 'caja automatica'
    ];
    
    for (const palabra of palabrasAutomatica) {
        if (mensajeLower.includes(palabra)) {
            return {
                esAutomatica: true,
                respuesta: "En KADI nos especializamos en **transmisiones manuales y diferenciales**. No manejamos transmisiones automáticas. ¿Quieres que te ayude con una transmisión manual o diferencial para tu vehículo?"
            };
        }
    }
    
    return { esAutomatica: false };
}

// ============================================
// DETECCIÓN DE SÍNTOMAS
// ============================================
export function detectarSintoma(mensaje: string): {
    componente: 'transmision' | 'diferencial';
    pregunta: string;
    posibleCausa: string;
    seguimientoPersonalizado: string;
} | null {
    const mensajeLower = mensaje.toLowerCase();
    
    const esTransmision = mensajeLower.includes('transmision') || 
                          mensajeLower.includes('caja') || 
                          mensajeLower.includes('velocidades') ||
                          mensajeLower.includes('cambios') ||
                          mensajeLower.includes('palanca');
    
    const esDiferencial = mensajeLower.includes('diferencial') || 
                          mensajeLower.includes('atrás') || 
                          mensajeLower.includes('trasero') ||
                          mensajeLower.includes('detrás') ||
                          mensajeLower.includes('rueda');
    
    if (!esTransmision && !esDiferencial) {
        return null;
    }
    
    for (const tip of tipsPorSintoma) {
        for (const keyword of tip.keywords) {
            if (mensajeLower.includes(keyword)) {
                const componente = tip.modelos?.some((m: string) => 
                    mensajeLower.includes(m.toLowerCase())
                ) ? 'transmision' : (esDiferencial ? 'diferencial' : 'transmision');
                
                return {
                    componente,
                    pregunta: tip.pregunta,
                    posibleCausa: tip.posibleCausa,
                    seguimientoPersonalizado: tip.pregunta
                };
            }
        }
    }
    
    return null;
}