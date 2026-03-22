// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { nia } from '@/lib/nia-engine'; // Cambia la importación

export async function POST(req: Request) {
    try {
        const { message, reset } = await req.json();
        
        // Resetear conversación si se solicita
        if (reset) {
            nia.resetConversation();
            return NextResponse.json({ 
                reply: 'Conversación reiniciada. ¿En qué puedo ayudarte?' 
            });
        }
        
        if (!message?.trim()) {
            return NextResponse.json({ 
                reply: '¿En qué puedo ayudarte con las transmisiones hoy?' 
            });
        }
        
        // Procesar con NIA
        const result = await nia.processMessage(message);
        
        // 🟢 Verificar si el resultado es un objeto con productos
        if (result && typeof result === 'object' && 'type' in result) {
            // Es una respuesta con productos
            return NextResponse.json(result);
        } else {
            // Es una respuesta de texto normal
            return NextResponse.json({ reply: result });
        }
        
    } catch (error) {
        console.error('Error en API chat:', error);
        return NextResponse.json({
            reply: 'Lo siento, tuve un problema técnico. Por favor intenta de nuevo en unos momentos.'
        });
    }
}