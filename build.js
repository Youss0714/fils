#!/usr/bin/env node

// Script de build global pour YGestion en Node.js
// Compatible avec tous les systèmes d'exploitation

import { execSync } from 'child_process';
import { rmSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

console.log('🚀 Début du build global YGestion...\n');

// Fonction utilitaire pour exécuter des commandes
function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} terminé avec succès\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de ${description.toLowerCase()}`);
    console.error(error.message);
    return false;
  }
}

try {
  // 1. Nettoyer le dossier dist
  console.log('🧹 Nettoyage du dossier dist...');
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  mkdirSync('dist', { recursive: true });
  console.log('✅ Dossier dist nettoyé\n');

  // 2. Build du frontend (React + Vite)
  if (!runCommand('npx vite build', 'Build du frontend')) {
    process.exit(1);
  }

  // 3. Build du backend (Express + TypeScript)
  const backendCommand = 'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist';
  if (!runCommand(backendCommand, 'Build du backend')) {
    process.exit(1);
  }

  // 4. Build du processus Electron
  process.chdir('desktop');
  if (!runCommand('npm run build', 'Build du processus Electron')) {
    process.exit(1);
  }
  process.chdir('..');

  // 5. Copier les assets nécessaires
  console.log('📁 Copie des assets...');
  
  // Copier le splash.html vers dist/electron pour Electron
  const splashSource = path.join('desktop', 'splash.html');
  const splashDest = path.join('dist', 'electron', 'splash.html');
  
  if (existsSync(splashSource)) {
    copyFileSync(splashSource, splashDest);
    console.log('✅ splash.html copié');
  } else {
    console.log('⚠️  splash.html non trouvé, ignoré');
  }

  // Créer un fichier de version
  const buildInfo = {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    components: {
      frontend: 'React + Vite',
      backend: 'Express + TypeScript',
      desktop: 'Electron'
    }
  };
  
  writeFileSync(
    path.join('dist', 'version.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  console.log('✅ Fichier de version créé\n');

  // Résumé final
  console.log('🎉 Build global terminé avec succès !\n');
  console.log('📦 Structure de sortie :');
  console.log('  dist/');
  console.log('  ├── public/          # Frontend compilé (React)');
  console.log('  ├── index.js         # Backend compilé (Express)');
  console.log('  ├── electron/        # Processus Electron compilé');
  console.log('  └── version.json     # Informations de build\n');
  console.log('🚀 Pour démarrer :');
  console.log('  • Production web: npm start');
  console.log('  • Application Electron: cd desktop && npm start\n');

} catch (error) {
  console.error('❌ Erreur fatale lors du build:', error.message);
  process.exit(1);
}