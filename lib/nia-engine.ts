// lib/nia-engine.ts
import { supabase } from './supabase';
import { modelosEspeciales } from './modelosDatabase';

type ProcessMessageResult = string | {
    type: 'product_recommendations';
    message: string;
    products: any[];
};

type NiaState = 'ESPERANDO_SALUDO' | 'ESPERANDO_DATOS_VEHICULO' | 'LISTO_PARA_MOSTRAR';

export class NIAEngine {
    private state: NiaState = 'ESPERANDO_SALUDO';
    private vehicleData: {
        brand?: string;
        model?: string;
        year?: number;
        fuel?: string;
    } = {};
    
    async processMessage(message: string): Promise<ProcessMessageResult> {
        console.log('📨 Mensaje:', message);
        console.log('📌 Estado:', this.state);
        console.log('📦 Datos:', this.vehicleData);
        
        const lowerMsg = message.toLowerCase();
        
        if (this.isAutomaticQuery(lowerMsg)) {
            return "En KADI solo manejamos transmisiones MANUALES y diferenciales.";
        }
        
        if (this.state === 'ESPERANDO_SALUDO') {
            return this.handleInitialGreeting(lowerMsg);
        }
        
        if (this.state === 'ESPERANDO_DATOS_VEHICULO') {
            return await this.handleVehicleDataCollection(message, lowerMsg);
        }
        
        if (this.state === 'LISTO_PARA_MOSTRAR') {
            return await this.showProducts();
        }
        
        return "¿En qué puedo ayudarte?";
    }
    
    private isAutomaticQuery(msg: string): boolean {
        const autoWords = ['automática', 'automatica', 'automático', 'automatico'];
        return autoWords.some(word => msg.includes(word));
    }
    
    private detectModel(msg: string): { brand: string; model: string } | null {
        const models: Record<string, string> = {
            'np300': 'nissan',
            'd21': 'nissan',
            'd22': 'nissan',
            'hilux': 'toyota',
            'hiace': 'toyota',
            'l200': 'mitsubishi',
            'ranger': 'ford',
            's10': 'chevrolet',
            'duster': 'renault',
            'vento': 'volkswagen',
            'ibiza': 'seat'
        };
        
        for (const [model, brand] of Object.entries(models)) {
            if (msg.includes(model)) {
                return { brand, model };
            }
        }
        return null;
    }
    
    private handleInitialGreeting(msg: string): string {
        const detected = this.detectModel(msg);
        
        if (detected) {
            this.state = 'ESPERANDO_DATOS_VEHICULO';
            this.vehicleData = detected;
            
            const especial = modelosEspeciales[detected.model.toUpperCase()];
            if (especial) {
                return especial.preguntaClave + ' ¿Me compartes el año?';
            }
            
            return `¿Tu ${detected.model.toUpperCase()} es de qué año?`;
        }
        
        if (msg.includes('hola')) {
            return "Hola, soy NIA. ¿Qué modelo buscas? (NP300, D21, Hilux, etc.)";
        }
        
        return "¿En qué puedo ayudarte? Puedes decirme un modelo como NP300, D21 o Hilux.";
    }
    
    private async handleVehicleDataCollection(message: string, lowerMsg: string): Promise<ProcessMessageResult | string> {
        const yearMatch = message.match(/\b(19|20)\d{2}\b/);
        if (yearMatch && !this.vehicleData.year) {
            this.vehicleData.year = parseInt(yearMatch[0]);
            console.log('✅ Año detectado:', this.vehicleData.year);
        }
        
        if (this.vehicleData.model === 'np300' && !this.vehicleData.fuel) {
            if (lowerMsg.includes('gasolina')) {
                this.vehicleData.fuel = 'gasolina';
                console.log('✅ Combustible: gasolina');
            } else if (lowerMsg.includes('diesel') || lowerMsg.includes('diésel')) {
                this.vehicleData.fuel = 'diesel';
                console.log('✅ Combustible: diesel');
            }
        }
        
        const missing = [];
        if (!this.vehicleData.year) missing.push('año');
        if (this.vehicleData.model === 'np300' && !this.vehicleData.fuel) missing.push('combustible');
        
        if (missing.length > 0) {
            return `Necesito saber: ${missing.join(' y ')}.`;
        }
        
        this.state = 'LISTO_PARA_MOSTRAR';
        return await this.showProducts();
    }
    
    private async showProducts(): Promise<ProcessMessageResult> {
        console.log('🔍 Buscando en Supabase con estos datos:', this.vehicleData);
        
        let query = supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .gt('stock', 0);
        
        if (this.vehicleData.model) {
            const modeloBusqueda = this.vehicleData.model.toUpperCase();
            console.log(`🔍 Buscando modelo que contenga: ${modeloBusqueda}`);
            query = query.contains('modelo_vehiculo', [modeloBusqueda]);
        }
        
        if (this.vehicleData.year) {
            const año = this.vehicleData.year;
            console.log(`📅 Filtrando año: ${año} (rango: año_inicio <= ${año} AND año_fin >= ${año})`);
            query = query.lte('año_inicio', año)
                        .gte('año_fin', año);
        }
        
        if (this.vehicleData.model === 'np300' && this.vehicleData.fuel) {
            console.log(`⛽ Filtro adicional por combustible: ${this.vehicleData.fuel}`);
            query = query.or(`descripcion.ilike.%${this.vehicleData.fuel}%`);
        }
        
        const { data, error } = await query.limit(8);
        
        console.log('📦 RESULTADO DE LA CONSULTA:', data);
        
        if (error) {
            console.error('❌ Error en Supabase:', error);
            return "Lo siento, tuve un problema al buscar en la base de datos.";
        }
        
        if (data && data.length > 0) {
            console.log(`✅ Encontré ${data.length} producto(s)`);
            this.state = 'ESPERANDO_SALUDO';
            return {
                type: 'product_recommendations',
                message: `Para **${this.vehicleData.brand} ${this.vehicleData.model} ${this.vehicleData.year}** encontré:`,
                products: data
            };
        } else {
            console.log('❌ No se encontraron productos');
            this.state = 'ESPERANDO_SALUDO';
            return `No encontré transmisiones para ${this.vehicleData.brand} ${this.vehicleData.model} ${this.vehicleData.year}.`;
        }
    }
    
    resetConversation() {
        this.state = 'ESPERANDO_SALUDO';
        this.vehicleData = {};
        console.log('🔄 Conversación reiniciada');
    }
}

export const nia = new NIAEngine();