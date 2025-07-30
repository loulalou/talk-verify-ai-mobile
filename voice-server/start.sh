#!/bin/bash

# Script de démarrage du serveur vocal

echo "🚀 Démarrage du serveur vocal Pipecat..."

# Vérifier si le virtualenv existe
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances si nécessaire
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env non trouvé!"
    echo "📝 Copie du fichier .env.example..."
    cp .env.example .env
    echo "✏️  Veuillez éditer le fichier .env avec vos clés API"
    echo "   - DAILY_API_KEY: Obtenez-la sur https://dashboard.daily.co"
    echo "   - GEMINI_API_KEY: Obtenez-la sur https://aistudio.google.com"
    echo "   - OPENAI_API_KEY: Obtenez-la sur https://platform.openai.com"
    exit 1
fi

# Démarrer le serveur
echo "🟢 Serveur vocal démarré sur http://localhost:7860"
python server.py