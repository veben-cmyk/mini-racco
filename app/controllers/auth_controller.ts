import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
/**
   * Afficher la page d'inscription
   */
    async renderRegister({ view }: HttpContext) {
        return view.render('pages/auth/register')
    }

    /**
   * Traiter l'inscription
   */
    async register({ request, response, session }: HttpContext) {

    // 1. Récupération des données du formulaire
        const data = request.only(['username', 'email', 'password'])

    // 2. Création de l'utilisateur
            await User.create(data)

    // 3. Connexion automatique de l'utilisateur après inscription
        session.flash('success', 'Votre compte a été créé ! Connectez-vous maintenant.')

    // 4. Redirection vers la page d'accueil ou le dashboard
        return response.redirect().toPath('/login')
    }

    /**
   * Afficher la page de connexion
   */
    async renderLogin({ view }: HttpContext) {
        return view.render('pages/auth/login')
    }

    /**
   * Traiter la connexion
   */
    async login({ request, response, auth, session }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        try {
        // Vérifie les identifiants et connecte l'utilisateur
            const user = await User.verifyCredentials(email, password)
            await auth.use('web').login(user)

            return response.redirect().toPath('/')
        } catch {
            session.flash('errors', { login: 'Identifiants invalides' })
            return response.redirect().back()
        }
    }

    /**
   * Traiter la déconnexion
   */
    async logout({ auth, response }: HttpContext) {
        await auth.use('web').logout()
        return response.redirect().toPath('/login')
    }
}