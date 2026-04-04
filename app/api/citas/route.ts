import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            cliente_nombre, 
            cliente_telefono, 
            cliente_email, 
            tipo_servicio, 
            vehiculo_marca, 
            vehiculo_modelo, 
            vehiculo_año, 
            sintoma, 
            fecha_solicitada, 
            hora_solicitada, 
            sucursal,
            notas,
            userId 
        } = body;
        
        // Validar datos mínimos
        if (!cliente_nombre || !cliente_telefono || !tipo_servicio) {
            return NextResponse.json({ 
                success: false, 
                error: 'Faltan datos requeridos: nombre, teléfono y tipo de servicio' 
            });
        }
        
        // Guardar cita en Supabase
        const { data, error } = await supabase
            .from('citas')
            .insert({
                cliente_nombre,
                cliente_telefono,
                cliente_email,
                tipo_servicio,
                vehiculo_marca,
                vehiculo_modelo,
                vehiculo_año,
                sintoma,
                fecha_solicitada: fecha_solicitada || null,
                hora_solicitada: hora_solicitada || null,
                sucursal: sucursal || 'CDMX',
                status: 'pendiente',
                notas,
                user_id: userId || 'anonymous'
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // NOTIFICACIÓN: Aquí puedes agregar envió de WhatsApp o correo
        // Por ahora, solo enviamos una respuesta exitosa
        console.log('📅 Nueva cita agendada:', data);
        
        return NextResponse.json({ 
            success: true, 
            cita: data,
            message: 'Cita agendada correctamente. Nos pondremos en contacto contigo pronto.'
        });
        
    } catch (error) {
        console.error('Error al guardar cita:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Error al guardar la cita' 
        });
    }
}

// Endpoint para obtener citas (solo para admin, puedes protegerlo después)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pendiente';
    
    const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
    
    if (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
    
    return NextResponse.json({ success: true, citas: data });
}