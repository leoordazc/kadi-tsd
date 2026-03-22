"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KnowledgeBaseAdmin() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        loadStats();
    }, []);
    
    async function loadStats() {
        const { count } = await supabase
            .from('conocimiento_kadi')
            .select('*', { count: 'exact', head: true });
        
        const { data: tipos } = await supabase
            .from('conocimiento_kadi')
            .select('metadata');
        
        const stats = {
            total: count,
            porTipo: {} as Record<string, number>
        };
        
        tipos?.forEach(item => {
            const tipo = item.metadata?.tipo || 'unknown';
            stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
        });
        
        setStats(stats);
    }
    
    async function handleSearch() {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/admin/search-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });
            
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <main className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-8 border-b border-[#4ade80] pb-4">
                Knowledge Base Admin
            </h1>
            
            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-sm text-white/40">Total documentos</div>
                        <div className="text-2xl font-light text-[#4ade80]">{stats.total}</div>
                    </div>
                    
                    {Object.entries(stats.porTipo).map(([tipo, count]) => (
                        <div key={tipo} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="text-sm text-white/40 capitalize">{tipo}</div>
                            <div className="text-2xl font-light text-[#60a5fa]">{count as number}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Buscador semántico */}
            <div className="mb-8">
                <h2 className="text-xl mb-4">Probar búsqueda semántica</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej: ¿qué garantía tienen las transmisiones?"
                        className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-[#4ade80] text-black px-6 py-2 rounded-lg hover:bg-[#4ade80]/80 disabled:opacity-50"
                    >
                        Buscar
                    </button>
                </div>
            </div>
            
            {/* Resultados */}
            {searchResults.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg">Resultados ({searchResults.length})</h3>
                    {searchResults.map((result, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-[#4ade80]">
                                    {result.metadata?.tipo || 'documento'}
                                </span>
                                <span className="text-xs text-white/40">
                                    {Math.round(result.similarity * 100)}% relevante
                                </span>
                            </div>
                            <p className="text-sm text-white/80 whitespace-pre-line">
                                {result.content}
                            </p>
                            {result.metadata && Object.keys(result.metadata).length > 0 && (
                                <pre className="mt-2 text-xs text-white/30">
                                    {JSON.stringify(result.metadata, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}