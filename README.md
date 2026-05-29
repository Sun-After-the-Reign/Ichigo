# Ichigo
Discord BOT for Sun After the Reign — communauté Beyblade X.

**Présentation**
- **But**: `Ichigo` automatise la gestion et la communication des tournois, annonces et classements pour la communauté "Sun After the Reign".
- **Public cible**: organisateurs, arbitres et membres du serveur Discord Sun After the Reign.

**Fonctionnalités principales**
- **Gestion de tournois**: création (`ajout-tournoi`), modification (`modif-tournoi`), publication (`envoyer-tournoi`), lancement live (`lancer-tournoi`), fin et publication des résultats (`fin-tournoi`), rafraîchissement d'embeds (`rafraichir-tournoi`). Intégration Challonge pour la création et le suivi d'arbre.
- **Annonces et messages programmés**: envoi d'annonces, messages et règles (`envoyer-annonce`, `envoyer-message`, `envoyer-regle`, `modif-message`) avec planification via `cron`.
- **Classements**: calcul et export vers Google Sheets (`maj-classement`) en se basant sur les tournois enregistrés.
- **Interactivité et utilitaires**: commandes d'aide (`aide`), sondages (`sondage`), ajout d'emojis (`ajout-emoji`), répétition de texte (`repete`).
- **Diffusion Twitch**: annonce de résultats en direct sur la chaîne Twitch via `tmi.js` lors du lancement et du suivi des matchs (`lancer-tournoi`).
- **Règles & médias**: stockage et publication des règles/banlists et images (dossier `medias/`), génération d'embeds d'annonce.

**Architecture & composants clés**
- **Entrée**: [ichigo.js](ichigo.js) — initialisation du bot, connexion Discord/Twitch, configuration SQLite et chargement des événements.
- **Chargement des commandes**: [slashcommands_loader.js](slashcommands_loader.js) — conversion des fichiers `commands/` en commandes slash et enregistrement auprès de l'API Discord.
- **Commandes**: dossier [commands/](commands) — logique de chaque commande (création/édition de tournois, messages, utilitaires).
- **Événements**: dossier [events/](events) — gestion des interactions, messages et tâches internes (post d'embed, calcul de classement, publication automatisée).
- **Base de données**: SQLite via `sequelize` (`ichigo.db`) — tables `Tournaments`, `Inscriptions`, `Places` définies dans l'initialisation.

**Installation & configuration**
- **Dépendances**: voir `package.json` (`discord.js`, `cron`, `sequelize`, `sqlite3`, `googleapis`, `tmi.js`, ...).

Fichiers de configuration importants:
- **`dev_config.json`**: contient `token` Discord, `challonge` API key, `twitch` token et `top_bladers` (ID du Google Sheet).
- **`google.json`**: clé de service pour Google Sheets (utilisée par `maj-classement`).

**Utilisation (exemples)**
- Créer un tournoi (exécuté par un administrateur) : `/ajout-tournoi id:123 title:"BBT" date:DD/MM/YYYY-HH:mm:SS post_pub:#channel ruleset:3on3 format:"Double Élimination" place:PLACE_ID`
- Publier une annonce programmée : `/envoyer-tournoi nom:"Titre" date:... poster:URL post_pub:#channel`
- Lancer le suivi live (Twitch) : `/lancer-tournoi tournament_id:123`
- Mettre à jour le classement et exporter : `/maj-classement send_message:true`

**Notes techniques**
- Les commandes utilisent les options et l'autocomplétion définies dans les fichiers sous `commands/`.
- La planification des publications se fait via des jobs `cron` internes.
- Les règles et images sont stockées dans `medias/` et référencées par les commandes.
- Les événements `interactionCreate` et `messageCreate` gèrent l'autocomplétion, les boutons (ex: inscription aux notifications) et quelques raccourcis `!` pour liens rapides.

**Licence**
- Projet sous licence MIT (voir `LICENSE`).
