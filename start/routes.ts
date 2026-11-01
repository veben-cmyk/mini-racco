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
const ShortUrlsController = () => import('#controllers/short_urls_controller')

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
// Suppression d'un lien
router.post('/urls/:id', [ShortUrlsController, 'destroy']).as('urls.destroy')
// deconnexion
router.post('/logout', [AuthController, 'logout'])
    })
    .use(middleware.auth())

// --- 3. Routes publiques ---
// Accueil : visible par tous, la création d'un lien exigera d'être connecté
// Page d'accueil : Affiche le formulaire
router.get('/', [ShortUrlsController, 'index']).as('urls.home')


// Redirection dynamique via le shortCode (ex: localhost:3333/mon-code)
router.get('/:code', [ShortUrlsController, 'redirect']).as('urls.redirect')



