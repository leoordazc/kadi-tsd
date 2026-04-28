import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia';
        
        console.log('🔍 Generando folio para tipo:', tipo);
        
        // Método 1: Intentar actualizar directamente
        let { data: updated, error: updateError } = await supabase
            .from('secuencia_folios')
            .update({ 
                ultimo_folio: supabase.rpc('increment', { row_id: 1 })
            })
            .eq('tipo', tipo)
            .select('ultimo_folio')
            .single();
        
        // Si falla, usar método de lectura + actualización
        if (updateError) {
            console.log('⚠️ Usando método alternativo...');
            
            // Leer valor actual
            let { data: current, error: selectError } = await supabase
                .from('secuencia_folios')
                .select('ultimo_folio')
                .eq('tipo', tipo)
                .single();
            
            // Si no existe el registro, crearlo
            if (selectError && selectError.code === 'PGRST116') {
                console.log('📝 Creando registro inicial...');
                const { data: newRecord, error: insertError } = await supabase
                    .from('secuencia_folios')
                    .insert({ tipo, ultimo_folio: 1, prefijo: 'KADI' })
                    .select('ultimo_folio')
                    .single();
                
                if (insertError) {
                    console.error('❌ Error al crear:', insertError);
                    throw insertError;
                }
                
                const nuevoFolio = newRecord?.ultimo_folio || 1;
                return NextResponse.json({ 
                    success: true, 
                    folio: nuevoFolio,
                    folio_completo: `KADI-${nuevoFolio.toString().padStart(5, '0')}`
                });
            }
            
            if (selectError) {
                console.error('❌ Error al leer:', selectError);
                throw selectError;
            }
            
            const nuevoFolio = (current?.ultimo_folio || 0) + 1;
            console.log(`📝 Nuevo folio calculado: ${nuevoFolio}`);
            
            // Actualizar con el nuevo valor
            const { error: finalUpdateError } = await supabase
                .from('secuencia_folios')
                .update({ ultimo_folio: nuevoFolio, updated_at: new Date().toISOString() })
                .eq('tipo', tipo);
            
            if (finalUpdateError) {
                console.error('❌ Error al actualizar:', finalUpdateError);
                throw finalUpdateError;
            }
            
            return NextResponse.json({ 
                success: true, 
                folio: nuevoFolio,
                folio_completo: `KADI-${nuevoFolio.toString().padStart(5, '0')}`
            });
        }
        
        const nuevoFolio = updated?.ultimo_folio;
        console.log(`✅ Folio generado: ${nuevoFolio}`);
        
        return NextResponse.json({ 
            success: true, 
            folio: nuevoFolio,
            folio_completo: `KADI-${nuevoFolio.toString().padStart(5, '0')}`
        });
        
    } catch (error) {
        console.error('❌ Error general:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Error al generar folio' 
        });
    }
}