import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia';
        
        console.log('🔍 Solicitando folio para tipo:', tipo);
        
        // Intentar usar la función RPC (recomendado)
        const { data, error } = await supabase
            .rpc('obtener_siguiente_folio', { p_tipo: tipo });
        
        if (error) {
            console.log('⚠️ RPC no disponible, usando método alternativo...');
            
            // Método alternativo seguro
            const { data: current, error: selectError } = await supabase
                .from('secuencia_folios')
                .select('ultimo_folio')
                .eq('tipo', tipo)
                .single();
            
            let nuevoFolio = 1;
            
            if (selectError && selectError.code === 'PGRST116') {
                // No existe, crearlo
                await supabase
                    .from('secuencia_folios')
                    .insert({ tipo, ultimo_folio: 1, prefijo: 'KADI' });
                nuevoFolio = 1;
            } else if (current) {
                nuevoFolio = current.ultimo_folio + 1;
                await supabase
                    .from('secuencia_folios')
                    .update({ ultimo_folio: nuevoFolio })
                    .eq('tipo', tipo);
            }
            
            console.log('✅ Folio generado (fallback):', nuevoFolio);
            
            return NextResponse.json({
                success: true,
                folio: nuevoFolio,
                folio_completo: `KADI-${nuevoFolio.toString().padStart(5, '0')}`
            });
        }
        
        console.log('✅ Folio generado (RPC):', data);
        
        return NextResponse.json({
            success: true,
            folio: data,
            folio_completo: `KADI-${data.toString().padStart(5, '0')}`
        });
        
    } catch (error) {
        console.error('❌ Error general:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Error al generar folio' 
        });
    }
}