import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia';
        
        console.log('🔍 Generando folio...');
        
        // 1. Obtener el valor actual
        let { data: current, error: selectError } = await supabase
            .from('secuencia_folios')
            .select('ultimo_folio')
            .eq('tipo', tipo)
            .single();
        
        // 2. Si no existe el registro, crearlo
        if (selectError && selectError.code === 'PGRST116') {
            console.log('📝 Creando registro inicial...');
            await supabase
                .from('secuencia_folios')
                .insert({ tipo, ultimo_folio: 1, prefijo: 'KADI' });
            
            return NextResponse.json({
                success: true,
                folio: 1,
                folio_completo: 'KADI-00001'
            });
        }
        
        if (selectError) {
            console.error('❌ Error al leer:', selectError);
            throw selectError;
        }
        
        // 3. Calcular el nuevo folio (incrementar)
        const nuevoFolio = (current?.ultimo_folio || 0) + 1;
        console.log(`📝 Nuevo folio calculado: ${nuevoFolio}`);
        
        // 4. ACTUALIZAR la base de datos con el nuevo valor
        const { error: updateError } = await supabase
            .from('secuencia_folios')
            .update({ ultimo_folio: nuevoFolio, updated_at: new Date().toISOString() })
            .eq('tipo', tipo);
        
        if (updateError) {
            console.error('❌ Error al actualizar:', updateError);
            throw updateError;
        }
        
        console.log(`✅ Folio generado y guardado: ${nuevoFolio}`);
        
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