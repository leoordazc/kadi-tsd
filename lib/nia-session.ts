// lib/nia-session.ts
import { supabase } from './supabase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface SessionData {
    userId: string;
    messages: Message[];
    vehicleData?: {
        brand?: string;
        model?: string;
        year?: number;
        fuel?: string;
    };
    lastActivity: Date;
}

// Almacenamiento en memoria (para desarrollo)
// En producción, usa Supabase o Redis
const sessions = new Map<string, SessionData>();

export class NIASessionManager {
    
    /**
     * Obtener o crear una sesión para un usuario
     */
    getSession(userId: string): SessionData {
        if (!sessions.has(userId)) {
            sessions.set(userId, {
                userId,
                messages: [],
                lastActivity: new Date()
            });
        }
        
        const session = sessions.get(userId)!;
        session.lastActivity = new Date();
        return session;
    }
    
    /**
     * Agregar un mensaje a la sesión
     */
    addMessage(userId: string, role: 'user' | 'assistant', content: string): void {
        const session = this.getSession(userId);
        session.messages.push({
            role,
            content,
            timestamp: new Date()
        });
        
        // Limitar historial a los últimos 20 mensajes (evita tokens excesivos)
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }
    }
    
    /**
     * Obtener historial de conversación (últimos N mensajes)
     */
    getHistory(userId: string, limit: number = 10): Message[] {
        const session = this.getSession(userId);
        return session.messages.slice(-limit);
    }
    
    /**
     * Guardar datos del vehículo detectado
     */
    setVehicleData(userId: string, vehicleData: SessionData['vehicleData']): void {
        const session = this.getSession(userId);
        session.vehicleData = { ...session.vehicleData, ...vehicleData };
    }
    
    /**
     * Obtener datos del vehículo
     */
    getVehicleData(userId: string): SessionData['vehicleData'] {
        const session = this.getSession(userId);
        return session.vehicleData;
    }
    
    /**
     * Limpiar sesión
     */
    clearSession(userId: string): void {
        sessions.delete(userId);
    }
    
    /**
     * Generar resumen de contexto para OpenAI
     */
    getContextForOpenAI(userId: string): string {
        const vehicleData = this.getVehicleData(userId);
        let context = '';
        
        if (vehicleData?.brand || vehicleData?.model) {
            context += `\n**VEHÍCULO DEL CLIENTE:** ${vehicleData.brand || ''} ${vehicleData.model || ''}`;
            if (vehicleData.year) context += ` ${vehicleData.year}`;
            if (vehicleData.fuel) context += ` (${vehicleData.fuel})`;
            context += '\n';
        }
        
        return context;
    }
}

export const niaSession = new NIASessionManager();