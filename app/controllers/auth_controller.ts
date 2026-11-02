import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

// L'inspecteur du formulaire d'inscription
import { registerValidator } from '#validators/user'

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
    // 1. On confie le formulaire à l'inspecteur.
    //    Refusé : retour automatique au formulaire avec les erreurs.
    //    Accepté : on récupère username, email et password vérifiés.
    const data = await request.validateUsing(registerValidator)

    // 2. Création de l'utilisateur, avec le rôle "user" attribué explicitement.
    //    Le mot de passe est haché automatiquement par le modèle User (withAuthFinder).
    await User.create({ ...data, role: 'user' })

    // 3. Message de succès affiché sur la page de connexion
    session.flash('success', 'Ton compte a été créé ! Connecte-toi maintenant.')

    // 4. Redirection vers la page de connexion
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
        // Même règle qu'à l'inscription : on compare toujours l'email en minuscules
        const emailNormalise = String(email ?? '').trim().toLowerCase()

        try {
        // Vérifie les identifiants et connecte l'utilisateur
            const user = await User.verifyCredentials(emailNormalise, password)
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