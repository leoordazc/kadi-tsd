import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia';
        
        console.log('🔍 Generando folio...');
        
        // Leer el valor actual
        let { data: current, error: selectError } = await supabase
            .from('secuencia_folios')
            .select('ultimo_folio')
            .eq('tipo', tipo)
            .single();
        
        // Si no existe, crearlo
        if (selectError && selectError.code === 'PGRST116') {
            console.log('📝 Creando registro inicial...');
            await supabase
                .from('secuencia_folios')
                .insert({ tipo, ultimo_folio: 0, prefijo: 'KADI' });
            current = { ultimo_folio: 0 };
        } else if (selectError) {
            console.error('❌ Error al leer:', selectError);
            throw selectError;
        }
        
        // Asegurar que current tiene un valor
        const valorActual = current?.ultimo_folio ?? 0;
        const nuevoFolio = valorActual + 1;
        
        console.log(`📝 Valor actual: ${valorActual}, Nuevo folio: ${nuevoFolio}`);
        
        // Actualizar con el nuevo valor
        const { error: updateError } = await supabase
            .from('secuencia_folios')
            .update({ ultimo_folio: nuevoFolio, updated_at: new Date().toISOString() })
            .eq('tipo', tipo);
        
        if (updateError) {
            console.error('❌ Error al actualizar:', updateError);
            throw updateError;
        }
        
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