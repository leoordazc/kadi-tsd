// scripts/populate-knowledge-base.ts
import { knowledgeBase } from '../lib/knowledge-base';
import { supabase } from '../lib/supabase';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function populateKnowledgeBase() {
    console.log('🚀 Iniciando población de Knowledge Base...');
    
    // 1. Limpiar base existente
    console.log('🧹 Limpiando base existente...');
    await knowledgeBase.clearKnowledgeBase();
    
    // 2. FAQs comunes
    console.log('📝 Indexando FAQs...');
    const faqs = [
        {
            pregunta: '¿Qué tipos de transmisión venden?',
            respuesta: 'Manejamos transmisiones nuevas, reconstruidas y usadas para todas las marcas principales. Las reconstruidas tienen 12 meses de garantía.',
            categoria: 'general'
        },
        {
            pregunta: '¿Hacen envíos a toda la república?',
            respuesta: 'Sí, realizamos envíos a todos los estados de México. El tiempo de entrega es de 24-48 horas.',
            categoria: 'envios'
        },
        {
            pregunta: '¿Qué garantía ofrecen?',
            respuesta: 'Transmisiones nuevas: 24 meses, reconstruidas: 12 meses, usadas: 3 meses.',
            categoria: 'garantia'
        }
    ];
    
    const faqCount = await knowledgeBase.indexFAQs(faqs);
    console.log(`✅ ${faqCount} FAQs indexadas`);
    
    // 3. Información de productos desde la BD
    console.log('📦 Indexando información de productos...');
    const { data: productos } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true);
    
    if (productos && productos.length > 0) {
        const productChunks = productos.map(p => ({
            content: `Producto: ${p.nombre}\nTipo: ${p.tipo}\nCódigo: ${p.codigo_caja}\nPrecio: $${p.precio}\nStock: ${p.stock}\nCategoría: ${p.categoria}\nDescripción: ${p.descripcion || 'Sin descripción'}`,
            metadata: {
                tipo: 'producto',
                producto_id: p.id,
                codigo: p.codigo_caja,
                precio: p.precio,
                categoria: p.categoria
            }
        }));
        
        const productCount = await knowledgeBase.indexChunksBatch(productChunks);
        console.log(`✅ ${productCount} productos indexados`);
    }
    
    // 4. Guías de venta (conocimiento experto)
    console.log('📘 Indexando conocimiento experto...');
    const guiasVenta = [
        {
            content: `Guía de venta: Cómo manejar la objeción de precio
Cuando un cliente dice "está muy caro":
1. Validar: "Entiendo que la inversión es significativa"
2. Explicar valor: "Incluye garantía de 12 meses y envío gratis"
3. Ofrecer financiamiento: "Podemos dividirlo en 12 meses sin intereses"`,
            metadata: { 
                tipo: 'guia', 
                categoria: 'ventas' 
            }
        }
    ];
    
    const guiasCount = await knowledgeBase.indexChunksBatch(guiasVenta);
    console.log(`✅ ${guiasCount} guías indexadas`);
    
    console.log('🎉 ¡Knowledge Base poblada exitosamente!');
}

// Ejecutar la función
populateKnowledgeBase().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});