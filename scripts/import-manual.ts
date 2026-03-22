// scripts/import-manual.ts
import { knowledgeBase } from '../lib/knowledge-base';
import fs from 'fs';
import path from 'path';

/**
 * Importar un manual de texto a la knowledge base
 */
async function importManual(filePath: string, nombre: string) {
    console.log(`📄 Importando manual: ${nombre}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const count = await knowledgeBase.indexManual(content, nombre, 800);
        console.log(`✅ ${count} chunks indexados del manual ${nombre}`);
    } catch (error) {
        console.error(`Error importando manual ${nombre}:`, error);
    }
}

/**
 * Función para procesar múltiples manuales
 */
async function importAllManuals() {
    const manualsDir = path.join(__dirname, '../docs');
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(manualsDir)) {
        fs.mkdirSync(manualsDir, { recursive: true });
        console.log(`📁 Creado directorio ${manualsDir}. Coloca tus manuales en formato .txt ahí.`);
        return;
    }
    
    const files = fs.readdirSync(manualsDir);
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    
    for (const file of txtFiles) {
        const filePath = path.join(manualsDir, file);
        const nombre = path.basename(file, '.txt');
        await importManual(filePath, nombre);
    }
}

// Ejecutar
importAllManuals().catch(console.error);