import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia'; // Forzamos el tipo para seguridad
        
        console.log('🔍 Generando folio para tipo:', tipo);
        
        // Obtener el registro actual
        let { data: folioData, error: selectError } = await supabase
            .from('secuencia_folios')
            .select('ultimo_folio')
            .eq('tipo', tipo)
            .single();
        
        // Si no existe el registro, crearlo
        if (selectError && selectError.code === 'PGRST116') {
            console.log('📝 No existe registro, creando...');
            const { error: insertError } = await supabase
                .from('secuencia_folios')
                .insert({ tipo, ultimo_folio: 1, prefijo: 'KADI' });
            
            if (insertError) {
                console.error('❌ Error al crear:', insertError);
                return NextResponse.json({ 
                    success: false, 
                    error: 'Error al crear registro de folios' 
                });
            }
            
            return NextResponse.json({ 
                success: true, 
                folio: 1,
                folio_completo: 'KADI-00001'
            });
        }
        
        if (selectError) {
            console.error('❌ Error al seleccionar:', selectError);
            return NextResponse.json({ 
                success: false, 
                error: 'Error al leer folio' 
            });
        }
        
        const nuevoFolio = (folioData?.ultimo_folio || 0) + 1;
        console.log('📝 Nuevo folio:', nuevoFolio);
        
        // Actualizar el folio
        const { error: updateError } = await supabase
            .from('secuencia_folios')
            .update({ ultimo_folio: nuevoFolio })
            .eq('tipo', tipo);
        
        if (updateError) {
            console.error('❌ Error al actualizar:', updateError);
            return NextResponse.json({ 
                success: false, 
                error: 'Error al actualizar folio' 
            });
        }
        
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