<!-- En-tête centré : logo, titre, phrase d'accroche, badges -->
<p align="center">
  <!-- <picture> : GitHub affiche le logo clair ou sombre selon le thème du visiteur -->
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/veben-symbole-inverse.svg">
    <img src="docs/veben-symbole.svg" width="64" height="64" alt="Veben">
  </picture>
</p>

<h1 align="center">Mini Racco</h1>

<p align="center">
  Un lien long, rendu court.<br>
  Raccourcisseur d'URL avec comptes, QR codes et espace d'administration.
</p>

<!-- Statut : la seule touche de bleu calque -->
<p align="center">
  <img src="https://img.shields.io/badge/statut-en%20d%C3%A9veloppement-2348c4?style=for-the-badge" alt="Statut : en développement">
  <img src="https://img.shields.io/badge/d%C3%A9mo-bient%C3%B4t-5c5e64?style=for-the-badge" alt="Démo : bientôt">
</p>

<!-- Technologies : tout en graphite, avec leur logo en blanc -->
<p align="center">
  <img src="https://img.shields.io/badge/AdonisJS-6-1a1b1d?style=for-the-badge&logo=adonisjs&logoColor=white" alt="AdonisJS 6">
  <img src="https://img.shields.io/badge/TypeScript-1a1b1d?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-1a1b1d?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-1a1b1d?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/VineJS-validation-1a1b1d?style=for-the-badge" alt="VineJS">
</p>

<p align="center">
  <sub>Projet réalisé pendant ma formation en développement web chez Kadea Academy.</sub>
</p>


## Ce que fait l'application

- **Raccourcir un lien** : une adresse longue devient `monsite.com/aB3x9z`, ou un code choisi comme `monsite.com/portfolio`.
- **Générer un QR code** pour chaque lien, téléchargeable en image.
- **Gérer ses liens** : chaque utilisateur retrouve, modifie et supprime uniquement les siens.
- **Créer un compte** et se connecter, avec des sessions sécurisées.
- **Administrer** : un administrateur voit tous les liens et tous les comptes, et peut supprimer un lien abusif.

## Ce que j'ai construit, et pourquoi

**Authentification et autorisation.** J'ai distingué les deux : l'authentification vérifie *qui* est connecté (middleware `auth`), l'autorisation vérifie *ce qu'il a le droit de faire*. Un utilisateur ne peut toucher qu'à ses propres liens : chaque requête filtre par propriétaire. Un middleware `role` réserve l'administration aux comptes `admin`.

**Le rôle admin ne s'obtient jamais par le formulaire.** L'inscription attribue toujours le rôle `user` côté serveur. Le compte administrateur est créé par un *seeder*, avec des identifiants lus dans les variables d'environnement.

**Validation côté serveur avec VineJS.** Le navigateur filtre déjà les erreurs, mais le serveur ne fait confiance à rien de ce qu'il reçoit. Les URL doivent commencer par `http(s)://`, les codes personnalisés n'acceptent que lettres, chiffres, `-` et `_`, et les mots réservés aux pages du site (`login`, `admin`…) sont refusés.

**Mots de passe hachés** avec scrypt : même avec un accès à la base, ils restent illisibles.

**QR codes générés sur le serveur**, à partir du lien court, sans service externe : les adresses des utilisateurs ne quittent pas l'application.

**Un CRUD respectueux de HTTP** : `GET` pour lire, `POST` pour créer, `PUT` pour modifier, `DELETE` pour supprimer, grâce au *method spoofing* d'AdonisJS.

## Technologies

| Rôle | Outil |
| --- | --- |
| Framework | AdonisJS 6 (TypeScript) |
| Base de données | PostgreSQL, via l'ORM Lucid |
| Validation | VineJS |
| Vues | Edge, avec un layout commun |
| Style | Tailwind CSS 4, aux couleurs de ma charte graphique Veben |
| QR codes | `qrcode` |

## Lancer le projet en local

**Prérequis** : Node.js 20 ou plus, et PostgreSQL.

```bash
# 1. Récupérer le projet et installer les dépendances
git clone https://github.com/veben-cmyk/mini-racco.git
cd mini-racco
npm install

# 2. Créer le fichier de configuration à partir du modèle, puis le remplir
cp .env.example .env
node ace generate:key

# 3. Créer une base vide nommée mini_racco dans PostgreSQL, puis construire les tables
node ace migration:run

# 4. Créer le compte administrateur (identifiants ADMIN_* du .env)
node ace db:seed

# 5. Démarrer
npm run dev
```

L'application est alors disponible sur `http://localhost:3333`.

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Connexion à PostgreSQL |
| `APP_KEY` | Clé de chiffrement des sessions (générée par `node ace generate:key`) |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Compte administrateur créé par le seeder |

## Organisation du code

```
app/
  controllers/   # auth, liens, administration
  middleware/    # auth, guest, silent_auth, role
  models/        # User, ShortUrl, PasswordResetToken
  validators/    # règles VineJS (inscription, création et modification de liens)
database/
  migrations/    # structure des tables
  seeders/       # création du compte admin
resources/
  views/         # pages Edge et layout commun
start/
  routes.ts      # routes publiques, membres et administration
```

## Prochaines étapes

- [ ] Réinitialisation du mot de passe par email
- [ ] Mise en ligne
- [ ] Limitation des tentatives de connexion
- [ ] Tests automatisés de l'authentification

## Auteur

**Isaac Veben**, développeur web venu de l'architecture et du dessin.
[GitHub](https://github.com/veben-cmyk)