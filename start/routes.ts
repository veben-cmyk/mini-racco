/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const AdminController = () => import('#controllers/admin_controller')
const ShortUrlsController = () => import('#controllers/short_urls_controller')
const PasswordResetController = () => import('#controllers/password_reset_controller')

const AuthController = () => import('#controllers/auth_controller')


// Routes réservées aux visiteurs (non connectés)
router
    .group(() => {
    router.get('/register', [AuthController, 'renderRegister'])
    router.post('/register', [AuthController, 'register'])
    router.get('/login', [AuthController, 'renderLogin'])
    router.post('/login', [AuthController, 'login'])
    })
.use(middleware.guest())


// --- 2. Routes réservées aux membres (connectés) ---
router
    .group(() => {
 // Traitement du formulaire : Enregistre en BDD   
router.post('/shorten', [ShortUrlsController, 'shorten']).as('urls.shorten')
// Page goToUrl : Affiche la page de test et la sidebar d'historique
router.get('/go-to-url', [ShortUrlsController, 'goToUrl']).as('urls.goToUrl')
// Afficher le formulaire de modification d'un lien
router.get('/urls/:id/edit', [ShortUrlsController, 'edit']).as('urls.edit')
// Enregistrer la modification (PUT, via ?_method=PUT dans le formulaire)
router.put('/urls/:id', [ShortUrlsController, 'update']).as('urls.update')
// Supprimer un lien (DELETE, via ?_method=DELETE dans le formulaire)
router.delete('/urls/:id', [ShortUrlsController, 'destroy']).as('urls.destroy')
// deconnexion
router.post('/logout', [AuthController, 'logout'])
    })
    .use(middleware.auth())

// --- 3. Routes d'administration ---
// Deux vigiles, dans cet ordre :
//   1. auth : es-tu connecté ? (sinon → /login)
//   2. role : as-tu le badge admin ? (sinon → accueil)
router
  .group(() => {
    // Tableau de bord : tous les liens et tous les utilisateurs
    router.get('/', [AdminController, 'index']).as('admin.index')
    // Supprimer n'importe quel lien (modération)
    router.delete('/links/:id', [AdminController, 'destroyLink']).as('admin.links.destroy')
  })
  // .prefix ajoute "/admin" devant chaque route du groupe :
  // '/' devient '/admin', '/links/:id' devient '/admin/links/:id'
  .prefix('/admin')
  .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

// --- 4. Routes publiques ---
// Accueil : visible par tous, la création d'un lien exigera d'être connecté
// Page d'accueil : Affiche le formulaire
router.get('/', [ShortUrlsController, 'index']).as('urls.home')

    // --- Mot de passe oublié ---
    // Page "Mot de passe oublié" : une case pour l'email
    router.get('/forgot-password', [PasswordResetController, 'showForgot']).as('password.forgot')
    // Envoi du lien par email
    router.post('/forgot-password', [PasswordResetController, 'sendResetLink']).as('password.email')
    // Lien reçu par email : formulaire du nouveau mot de passe
    router.get('/reset-password/:token', [PasswordResetController, 'showReset']).as('password.reset')
    // Enregistrement du nouveau mot de passe
    router.post('/reset-password/:token', [PasswordResetController, 'resetPassword']).as('password.update')


// Redirection dynamique via le shortCode (ex: localhost:3333/mon-code)
router.get('/:code', [ShortUrlsController, 'redirect']).as('urls.redirect')



