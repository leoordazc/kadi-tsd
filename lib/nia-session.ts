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
    waitingForData: boolean;
    lastActivity: Date;
}

const sessions = new Map<string, SessionData>();

export class NIASessionManager {
    
    getSession(userId: string): SessionData {
        if (!sessions.has(userId)) {
            sessions.set(userId, {
                userId,
                messages: [],
                waitingForData: false,
                lastActivity: new Date()
            });
        }
        
        const session = sessions.get(userId)!;
        session.lastActivity = new Date();
        return session;
    }
    
    addMessage(userId: string, role: 'user' | 'assistant', content: string): void {
        const session = this.getSession(userId);
        session.messages.push({ role, content, timestamp: new Date() });
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }
    }
    
    getHistory(userId: string, limit: number = 10): Message[] {
        const session = this.getSession(userId);
        return session.messages.slice(-limit);
    }
    
    setVehicleData(userId: string, vehicleData: SessionData['vehicleData']): void {
        const session = this.getSession(userId);
        session.vehicleData = { ...session.vehicleData, ...vehicleData };
    }
    
    getContextForOpenAI(userId: string): string {
        const session = this.getSession(userId);
        const data = session.vehicleData;
        if (!data?.model) return '';
        return `${data.brand || ''} ${data.model} ${data.year || ''} ${data.fuel || ''}`.trim();
    }
    
    setWaitingForData(userId: string, waiting: boolean): void {
        const session = this.getSession(userId);
        session.waitingForData = waiting;
    }
    
    getWaitingForData(userId: string): boolean {
        const session = this.getSession(userId);
        return session.waitingForData || false;
    }
    
    clearSession(userId: string): void {
        sessions.delete(userId);
    }
}

export const niaSession = new NIASessionManager();