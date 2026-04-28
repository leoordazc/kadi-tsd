import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const tipo = 'transferencia';
        
        // Obtener el registro actual y actualizar en una sola operación
        const { data, error } = await supabase
            .rpc('incrementar_folio', { p_tipo: tipo });
        
        if (error) {
            // Si la función RPC no existe, usar método alternativo
            console.log('RPC no disponible, usando método alternativo');
            
            // Obtener y bloquear para actualizar
            const { data: current, error: selectError } = await supabase
                .from('secuencia_folios')
                .select('ultimo_folio')
                .eq('tipo', tipo)
                .single();
            
            if (selectError && selectError.code === 'PGRST116') {
                // Crear registro inicial
                await supabase
                    .from('secuencia_folios')
                    .insert({ tipo, ultimo_folio: 1, prefijo: 'KADI' });
                
                return NextResponse.json({ 
                    success: true, 
                    folio: 1,
                    folio_completo: 'KADI-00001'
                });
            }
            
            const nuevoFolio = (current?.ultimo_folio || 0) + 1;
            
            const { error: updateError } = await supabase
                .from('secuencia_folios')
                .update({ ultimo_folio: nuevoFolio })
                .eq('tipo', tipo);
            
            if (updateError) throw updateError;
            
            return NextResponse.json({ 
                success: true, 
                folio: nuevoFolio,
                folio_completo: `KADI-${nuevoFolio.toString().padStart(5, '0')}`
            });
        }
        
        return NextResponse.json({ 
            success: true, 
            folio: data,
            folio_completo: `KADI-${data.toString().padStart(5, '0')}`
        });
        
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Error al generar folio' 
        });
    }
}