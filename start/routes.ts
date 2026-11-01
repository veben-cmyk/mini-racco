/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const ShortUrlsController = () => import('#controllers/short_urls_controller')

const AuthController = () => import('#controllers/auth_controller')


// Routes Invités (non connectés)
router.get('/register', [AuthController, 'renderRegister'])
router.post('/register', [AuthController, 'register'])
router.get('/login', [AuthController, 'renderLogin'])
router.post('/login', [AuthController, 'login'])

// Route Déconnexion
router.post('/logout', [AuthController, 'logout'])

// Page d'accueil : Affiche le formulaire
router.get('/', [ShortUrlsController, 'index']).as('urls.home')

// Traitement du formulaire : Enregistre en BDD
router.post('/shorten', [ShortUrlsController, 'shorten']).as('urls.shorten')

// Page goToUrl : Affiche la page de test et la sidebar d'historique
router.get('/go-to-url', [ShortUrlsController, 'goToUrl']).as('urls.goToUrl')

// Suppression d'un lien
router.post('/urls/:id', [ShortUrlsController, 'destroy']).as('urls.destroy')

// Redirection dynamique via le shortCode (ex: localhost:3333/mon-code)
router.get('/:code', [ShortUrlsController, 'redirect']).as('urls.redirect')



