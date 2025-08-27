# 🚀 Guide de Génération .exe pour YGestion

## Configuration VS Code pour la génération d'exécutables

### 📋 Prérequis
- Node.js 18+ installé
- VS Code avec les extensions recommandées
- Windows, macOS ou Linux (pour cross-compilation)

### 🛠️ Scripts VS Code Disponibles

Utilisez **Ctrl+Shift+P** puis tapez **"Tasks: Run Task"** pour accéder aux scripts :

#### Scripts Principaux :
- **🚀 Build Desktop App (Windows .exe)** - Build complet (web + desktop + .exe)
- **💻 Generate Windows .exe** - Génère l'installeur Windows .exe
- **📱 Generate Portable .exe** - Génère une version portable .exe
- **⚡ Quick .exe (Skip Web Build)** - Build rapide (ignore la partie web)

#### Scripts Utilitaires :
- **📦 Build Web App** - Construit uniquement l'application web
- **🧹 Clean Build** - Nettoie tous les fichiers de build
- **🔍 Test Electron (Development)** - Lance l'app en mode développement

### 🎯 Workflow Recommandé

#### Pour un Build Complet (Première fois) :
1. **Ctrl+Shift+P** → **"Tasks: Run Task"**
2. Sélectionnez **"🚀 Build Desktop App (Windows .exe)"**
3. Attendez la compilation complète
4. Fichiers générés dans `desktop/build/`

#### Pour des Builds Rapides (Modifications Electron seulement) :
1. **Ctrl+Shift+P** → **"Tasks: Run Task"**
2. Sélectionnez **"⚡ Quick .exe (Skip Web Build)"**
3. Plus rapide si aucun changement dans l'app web

### 📁 Structure des Fichiers Générés

```
desktop/build/
├── YGestion Setup 1.0.0.exe          # Installeur Windows
├── YGestion-1.0.0-portable.exe       # Version portable
└── win-unpacked/                      # Version non-packagée
    └── YGestion.exe                   # Exécutable principal
```

### 🎛️ Types de Distribution

#### 1. **Installeur Windows (.exe)**
- Crée un vrai installeur avec désinstalleur
- Ajoute au menu Démarrer et Bureau
- Recommandé pour la distribution finale

#### 2. **Version Portable (.exe)**
- Un seul fichier exécutable
- Aucune installation requise
- Parfait pour les tests et démos

#### 3. **Version Non-packagée**
- Dossier avec tous les fichiers
- Utile pour le debugging et les tests

### ⚙️ Configuration Avancée

#### Modifier les Détails de l'App :
Éditez `desktop/package.json` :
```json
{
  "build": {
    "productName": "YGestion",
    "appId": "com.ygestion.desktop",
    "copyright": "Copyright © 2024 YGestion Team"
  }
}
```

#### Ajouter des Icônes :
1. Placez vos icônes dans `desktop/assets/`
2. Formats requis :
   - Windows: `.ico` (256x256 recommandé)
   - macOS: `.icns`
   - Linux: `.png` (512x512 recommandé)

### 🔧 Dépannage

#### Problème : "electron-builder command not found"
```bash
cd desktop
npm install
```

#### Problème : "Build failed - backend not found"
```bash
# Assurez-vous que le build web est fait d'abord
npm run build
cd desktop
npm run dist:windows
```

#### Problème : "Permission denied"
- Sur Windows : Exécutez VS Code en tant qu'administrateur
- Sur Linux/macOS : Vérifiez les permissions des dossiers

### 📊 Performance de Build

| Type de Build | Temps Approximatif | Taille Finale |
|---------------|-------------------|---------------|
| Build complet | 2-5 minutes | ~150-200 MB |
| Build rapide | 30-60 secondes | ~150-200 MB |
| Clean build | 3-8 minutes | ~150-200 MB |

### 🚀 Distribution

#### Pour les Tests :
- Utilisez la **version portable** (.exe)
- Partage facile, aucune installation

#### Pour la Production :
- Utilisez l'**installeur Windows** (.exe)
- Signature de code recommandée (certificat)
- Tests sur machines Windows propres

### 💡 Conseils Pro

1. **Testez toujours** sur une machine propre avant distribution
2. **Utilisez des versions** cohérentes dans `desktop/package.json`
3. **Gardez des backups** des builds fonctionnels
4. **Documentez les changements** entre versions
5. **Optimisez la taille** en excluant les fichiers inutiles

### 🔄 Automatisation CI/CD

Pour automatiser avec GitHub Actions, créez `.github/workflows/build-desktop.yml` :
```yaml
name: Build Desktop App
on: [push, pull_request]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: cd desktop && npm install && npm run dist:windows
```

---
**🎉 Félicitations !** Vous êtes maintenant prêt à générer des exécutables Windows pour YGestion depuis VS Code !