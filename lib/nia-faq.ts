// lib/nia-faq.ts
// Copia y pega TODO este código

export interface FAQ {
  patrones: RegExp[];
  respuesta: string | ((match: RegExpMatchArray, productos?: any[]) => string);
  keywords: string[];
}

export const faqDatabase: FAQ[] = [
  {
    patrones: [
      /hola|buenos días|buenas tardes|qué tal|oye/i,
      /buenas/i
    ],
    keywords: ['saludo', 'inicio'],
    respuesta: (match) => {
      const hora = new Date().getHours();
      let saludo = '';
      if (hora < 12) saludo = '¡Buenos días';
      else if (hora < 19) saludo = '¡Buenas tardes';
      else saludo = '¡Buenas noches';
      
      return `${saludo}! Soy NIA, tu asesora estratégica de KADI TS&D. ¿En qué puedo ayudarte con transmisiones hoy?`;
    }
  },
  {
    patrones: [
      /horarios?|abren|atienden|horario de atención/i
    ],
    keywords: ['horario', 'atención', 'oficina'],
    respuesta: `Atendemos de lunes a viernes de 9:00 a 18:00 hrs y sábados de 9:00 a 14:00 hrs. ¿Necesitas algo en especial?`
  },
  {
    patrones: [
      /garantía|garantias|qué garantía tienen|cuánto tiempo de garantía/i
    ],
    keywords: ['garantía', 'garantias'],
    respuesta: `Manejamos diferentes garantías según el tipo:\n• Transmisiones nuevas: 24 meses\n• Reconstruidas: 12 meses\n• Usadas: 3 meses\n\n¿Qué tipo te interesa?`
  },
  {
    patrones: [
      /pagos?|formas de pago|aceptan tarjeta|transferencia|efectivo/i
    ],
    keywords: ['pago', 'pagos', 'tarjeta'],
    respuesta: `Aceptamos:\n• Transferencia bancaria\n• Tarjeta de crédito/débito (3, 6 y 12 meses sin intereses)\n• Efectivo (5% de descuento)\n• Pago referenciado en tiendas de conveniencia\n\n¿Qué método prefieres?`
  },
  {
    patrones: [
      /envíos?|envian|entregas|cuánto tarda el envío|a dónde envían/i
    ],
    keywords: ['envío', 'envios', 'entrega'],
    respuesta: `Realizamos envíos a toda la república:\n• CDMX/Edomex: 24-48 hrs\n• Zona centro: 2-3 días\n• Norte/Sur: 3-5 días\n• Costa: 4-6 días\n\nEl costo varía según tu ubicación. ¿Dónde te encuentras?`
  },
  {
    patrones: [
      /precios?|cuánto cuesta|costo|cuál es el precio/i
    ],
    keywords: ['precio', 'costos', 'precios'],
    respuesta: (_, productos) => {
      if (productos && productos.length > 0) {
        const min = Math.min(...productos.map(p => p.precio));
        const max = Math.max(...productos.map(p => p.precio));
        return `Los precios van desde $${min.toLocaleString()} hasta $${max.toLocaleString()} dependiendo del tipo. ¿Qué modelo te interesa específicamente?`;
      }
      return `Los precios varían según el tipo:\n• Usadas: $8,000 - $15,000\n• Reconstruidas: $15,000 - $25,000\n• Nuevas: $25,000 - $45,000\n\n¿Qué presupuesto manejas?`;
    }
  },
  {
    patrones: [
      /recomienda|qué me recomiendas|cuál es mejor|opinión/i
    ],
    keywords: ['recomendación', 'recomienda'],
    respuesta: `Para recomendarte la mejor opción necesito saber:\n1. ¿Qué vehículo tienes? (marca, modelo, año)\n2. ¿Uso? (ciudad, carretera, carga)\n3. ¿Presupuesto aproximado?\n\n¡Con eso te doy la mejor opción!`
  },
  {
    patrones: [
      /gracias|thanks|agradezco|te lo agradezco/i
    ],
    keywords: ['gracias', 'agradecer'],
    respuesta: `¡Con gusto! Aquí estoy para lo que necesites. Si tienes más dudas, ya sabes dónde encontrarme.`
  }
];

// ============================================
// 🚗 BASE DE DATOS DE VEHÍCULOS (ACTUALIZADA)
// ============================================
// Agregué todos los modelos que mencionamos:
// D21, D22, L200, NP300, etc.
// ============================================

export const vehiculosDB: Record<string, string[]> = {
  // Toyota
  toyota: [
    'hilux', 'hiace', 'tacoma', '4runner', 'land cruiser', 
    'corolla', 'camry', 'tundra', 'prius', 'rav4', 'avanza'
  ],
  
  // Nissan (AGREGADOS: d21, d22, np300, frontier)
  nissan: [
    'np300', 'frontier', 'd21', 'd22', 'tsuru', 'sentra', 
    'versa', 'march', 'x-trail', 'pathfinder'
  ],
  
  // Chevrolet (AGREGADO: s10 max)
  chevrolet: [
    'silverado', 's10', 's10 max', 'aveo', 'spark', 'sonic', 
    'cruze', 'tracker', 'blazer', 'tornado'
  ],
  
  // Ford (AGREGADO: ranger)
  ford: [
    'f150', 'f250', 'f350', 'ranger', 'focus', 'fiesta', 
    'fusion', 'escape', 'explorer'
  ],
  
  // Volkswagen (AGREGADOS: vento, polo, gol, saveiro, amarok)
  volkswagen: [
    'jetta', 'vento', 'polo', 'gol', 'saveiro', 'amarok', 
    'beetle', 'tiguan', 'golf'
  ],
  
  // Honda
  honda: [
    'civic', 'accord', 'cr-v', 'hr-v', 'pilot', 'odyssey'
  ],
  
  // Mitsubishi (AGREGADOS: l200, montero)
  mitsubishi: [
    'l200', 'montero', 'outlander'
  ],
  
  // Renault (AGREGADOS: duster, sandero, logan, kangoo)
  renault: [
    'duster', 'sandero', 'logan', 'kangoo'
  ],
  
  // SEAT (AGREGADOS: ibiza, cordoba, leon, altea)
  seat: [
    'ibiza', 'cordoba', 'leon', 'altea'
  ],
  
  // Audi (AGREGADO: a1, a3)
  audi: [
    'a1', 'a3', 'a4'
  ],
  
  // Mazda
  mazda: [
    'bt50', 'cx5', 'mazda3', 'mazda6'
  ],
  
  // Dodge / RAM
  dodge: [
    'ram', 'journey'
  ],
  
  // Mercedes
  mercedes: [
    'sprinter'
  ]
};