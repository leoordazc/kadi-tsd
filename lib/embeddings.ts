// lib/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera un embedding para un texto usando OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", // 1536 dimensiones, mejor relación calidad/precio
            input: text.replace(/\n/g, ' '), // Limpiar saltos de línea
            encoding_format: "float",
        });
        
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generando embedding:', error);
        throw error;
    }
}

/**
 * Genera embeddings para múltiples textos (batch)
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
        // Limpiar textos
        const cleanedTexts = texts.map(t => t.replace(/\n/g, ' '));
        
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: cleanedTexts,
            encoding_format: "float",
        });
        
        // Ordenar por índice para mantener correspondencia
        return response.data
            .sort((a, b) => a.index - b.index)
            .map(item => item.embedding);
    } catch (error) {
        console.error('Error generando embeddings batch:', error);
        throw error;
    }
}

/**
 * Calcula similitud coseno entre dos vectores
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Los vectores deben tener la misma dimensión');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
        return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}