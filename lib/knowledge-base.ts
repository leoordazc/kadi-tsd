// lib/knowledge-base.ts
import { supabase } from './supabase';
import { generateEmbedding, generateEmbeddingsBatch } from './embeddings';

// Definimos un tipo más flexible que acepta cualquier string
export type TipoDocumento = string;

export interface KnowledgeChunk {
    content: string;
    metadata: {
        tipo: TipoDocumento;  // Ahora acepta cualquier string
        fuente?: string;
        categoria?: string;
        tags?: string[];
        pregunta?: string;    // Para FAQs
        producto_id?: any;    // Para productos
        codigo?: any;
        precio?: any;
        [key: string]: any;   // Permite cualquier propiedad adicional
    };
}

export class KnowledgeBaseManager {
    
    /**
     * Indexar un chunk de conocimiento
     */
    async indexChunk(chunk: KnowledgeChunk): Promise<boolean> {
        try {
            const embedding = await generateEmbedding(chunk.content);
            
            const { error } = await supabase
                .from('conocimiento_kadi')
                .insert({
                    content: chunk.content,
                    metadata: chunk.metadata,
                    embedding: embedding
                });
            
            if (error) throw error;
            return true;
            
        } catch (error) {
            console.error('Error indexando chunk:', error);
            return false;
        }
    }
    
    /**
     * Indexar múltiples chunks (batch)
     */
    async indexChunksBatch(chunks: KnowledgeChunk[]): Promise<number> {
        try {
            const contents = chunks.map(c => c.content);
            const embeddings = await generateEmbeddingsBatch(contents);
            
            const inserts = chunks.map((chunk, i) => ({
                content: chunk.content,
                metadata: chunk.metadata,
                embedding: embeddings[i]
            }));
            
            const { error } = await supabase
                .from('conocimiento_kadi')
                .insert(inserts);
            
            if (error) throw error;
            return inserts.length;
            
        } catch (error) {
            console.error('Error indexando chunks batch:', error);
            return 0;
        }
    }
    
    /**
     * Buscar conocimiento relevante
     */
    async searchRelevantKnowledge(
        query: string,
        options: {
            threshold?: number;
            limit?: number;
            filterTipo?: string | string[];
            filterMetadata?: Record<string, any>;
        } = {}
    ): Promise<any[]> {
        try {
            const {
                threshold = 0.7,
                limit = 5,
                filterTipo,
                filterMetadata = {}
            } = options;
            
            const queryEmbedding = await generateEmbedding(query);
            
            let metadataFilter = { ...filterMetadata };
            if (filterTipo) {
                metadataFilter.tipo = Array.isArray(filterTipo) ? filterTipo[0] : filterTipo;
            }
            
            const { data, error } = await supabase
                .rpc('match_conocimiento_kadi', {
                    query_embedding: queryEmbedding,
                    match_threshold: threshold,
                    match_count: limit,
                    filter_metadata: Object.keys(metadataFilter).length > 0 
                        ? metadataFilter 
                        : null
                });
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Error buscando conocimiento:', error);
            return [];
        }
    }
    
    /**
     * Búsqueda híbrida
     */
    async hybridSearch(
        query: string,
        limit: number = 5
    ): Promise<{
        conocimiento: any[];
        productos: any[];
    }> {
        const conocimiento = await this.searchRelevantKnowledge(query, {
            threshold: 0.65,
            limit: 3
        });
        
        const { data: productos } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .gt('stock', 0)
            .or(
                `nombre.ilike.%${query}%,` +
                `descripcion.ilike.%${query}%,` +
                `categoria.ilike.%${query}%`
            )
            .limit(limit);
        
        return {
            conocimiento,
            productos: productos || []
        };
    }
    
    /**
     * Eliminar todo el conocimiento
     */
    async clearKnowledgeBase(): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('conocimiento_kadi')
                .delete()
                .neq('id', 0);
            
            if (error) throw error;
            return true;
            
        } catch (error) {
            console.error('Error limpiando knowledge base:', error);
            return false;
        }
    }
    
    /**
     * Indexar FAQs
     */
    async indexFAQs(faqs: Array<{ pregunta: string; respuesta: string; categoria?: string }>) {
        const chunks: KnowledgeChunk[] = faqs.map(faq => ({
            content: `Pregunta: ${faq.pregunta}\nRespuesta: ${faq.respuesta}`,
            metadata: {
                tipo: 'faq',
                categoria: faq.categoria || 'general',
                pregunta: faq.pregunta,
                tags: ['faq']
            }
        }));
        
        return await this.indexChunksBatch(chunks);
    }
    
    /**
     * Indexar manual técnico
     */
    async indexManual(manualText: string, nombre: string, chunkSize: number = 500) {
        const paragraphs = manualText.split('\n\n').filter(p => p.trim().length > 0);
        
        const chunks: KnowledgeChunk[] = [];
        let currentChunk = '';
        
        for (const para of paragraphs) {
            if ((currentChunk + para).length > chunkSize) {
                if (currentChunk) {
                    chunks.push({
                        content: currentChunk,
                        metadata: {
                            tipo: 'manual',
                            fuente: nombre
                        }
                    });
                    currentChunk = para;
                } else {
                    const words = para.split(' ');
                    let tempChunk = '';
                    for (const word of words) {
                        if ((tempChunk + ' ' + word).length > chunkSize) {
                            chunks.push({
                                content: tempChunk,
                                metadata: {
                                    tipo: 'manual',
                                    fuente: nombre
                                }
                            });
                            tempChunk = word;
                        } else {
                            tempChunk += (tempChunk ? ' ' : '') + word;
                        }
                    }
                    if (tempChunk) {
                        currentChunk = tempChunk;
                    }
                }
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
            }
        }
        
        if (currentChunk) {
            chunks.push({
                content: currentChunk,
                metadata: {
                    tipo: 'manual',
                    fuente: nombre
                }
            });
        }
        
        return await this.indexChunksBatch(chunks);
    }
}

export const knowledgeBase = new KnowledgeBaseManager();