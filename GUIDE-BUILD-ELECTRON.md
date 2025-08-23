# 🚀 Guide pour Créer un Fichier .exe avec Electron

Ce guide vous explique comment créer facilement un fichier exécutable Windows (.exe) de votre application YGestion.

## ⚡ Méthode Rapide

### Option 1: Script Automatique (Recommandé)

**Sur Windows:**
```bash
# Double-cliquez sur ce fichier ou exécutez dans le terminal:
build-electron.bat
```

**Sur Linux/Mac:**
```bash
# Rendez le script exécutable et lancez-le:
chmod +x build-electron.sh
./build-electron.sh
```

### Option 2: Commandes Manuelles

1. **Construire l'application web:**
   ```bash
   npm run build
   ```

2. **Aller dans le dossier desktop et installer les dépendances:**
   ```bash
   cd desktop
   npm install
   ```

3. **Construire l'application Electron:**
   ```bash
   npm run build
   ```

4. **Créer l'exécutable Windows:**
   ```bash
   # Installeur NSIS + Version portable
   npm run dist:windows
   
   # Ou juste la version portable:
   npm run dist:portable
   ```

## 📁 Où Trouver les Fichiers

Après la construction, vos fichiers seront dans:
```
dist/setup/
├── YGestion-1.0.0-portable.exe  (Version portable)
├── YGestion Setup 1.0.0.exe     (Installateur)
└── latest.yml                    (Métadonnées)
```

## 🎯 Types de Fichiers Créés

- **Version Portable (.exe)**: Peut être exécutée directement sans installation
- **Installateur (.exe)**: Installe l'application dans le système Windows

## 🔧 Configuration Avancée

### Personnaliser l'Application

Vous pouvez modifier les paramètres dans `desktop/package.json`:

- **Nom de l'application**: Changez `productName`
- **Version**: Changez `version`
- **Description**: Changez `description`
- **Icônes**: Ajoutez vos icônes dans `desktop/assets/`

### Ajouter des Icônes (Optionnel)

Pour une apparence professionnelle, ajoutez des icônes:

1. Créez vos icônes:
   - `desktop/assets/icon.ico` (pour Windows)
   - `desktop/assets/icon.png` (512x512px, pour Linux)

2. Décommentez les lignes d'icônes dans `desktop/package.json`:
   ```json
   "win": {
     "icon": "./assets/icon.ico"
   }
   ```

## 🐛 Dépannage

### Erreur: "electron-builder not found"
```bash
cd desktop
npm install electron-builder --save-dev
```

### Erreur: "Cannot find module"
1. Supprimez `node_modules` et `package-lock.json`
2. Relancez `npm install`

### L'app ne démarre pas
1. Vérifiez que l'application web fonctionne avec `npm run dev`
2. Testez l'app Electron avec `cd desktop && npm run dev`

## 📋 Checklist Avant Distribution

- [ ] L'application web se lance correctement (`npm run dev`)
- [ ] L'application Electron démarre en développement (`cd desktop && npm run dev`)
- [ ] Les icônes sont ajoutées (optionnel mais recommandé)
- [ ] La version est mise à jour dans `desktop/package.json`
- [ ] Le build s'exécute sans erreur

## 💡 Conseils

1. **Testez toujours** l'exécutable avant de le distribuer
2. **Version portable** est plus facile à distribuer (pas d'installation requise)
3. **Installez** electron-builder globalement pour plus de facilité:
   ```bash
   npm install -g electron-builder
   ```

## 🚀 Distribution

Une fois votre `.exe` créé:
- **Version portable**: Peut être copiée directement sur d'autres machines
- **Installateur**: Peut être distribuée comme un logiciel normal Windows

---

**Bonne construction ! 🎉**