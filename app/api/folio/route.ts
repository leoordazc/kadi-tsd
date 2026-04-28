import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo') || 'transferencia';
        
        // Llamar a la función de PostgreSQL
        const { data, error } = await supabase
            .rpc('obtener_siguiente_folio', { p_tipo: tipo });
        
        if (error) throw error;
        
        return NextResponse.json({ 
            success: true, 
            folio: data,
            folio_completo: `KADI-${data.toString().padStart(5, '0')}`
        });
        
    } catch (error) {
        console.error('Error generando folio:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Error al generar folio' 
        });
    }
}