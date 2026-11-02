import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/user'

/**
 * Réinitialisation du mot de passe par email.
 * Parcours : demander un lien → recevoir l'email → choisir un nouveau mot de passe.
 */
export default class PasswordResetController {
  /**
   * 1. Page "Mot de passe oublié" : une case pour l'email
   */
  async showForgot({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  /**
   * 2. Fabriquer un jeton et envoyer le lien par email
   */
  async sendResetLink({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    // On cherche le compte, SANS jamais dire au visiteur s'il existe
    const user = await User.findBy('email', email)

    if (user) {
      // On efface les anciens jetons de ce compte : seul le dernier lien envoyé reste valable
      await PasswordResetToken.query().where('userId', user.id).delete()

      // Le jeton en clair : il part dans l'email et n'est JAMAIS enregistré tel quel
      const jeton = PasswordResetToken.genererJeton()

      // En base, on ne garde que son empreinte, avec une date limite d'une heure
      await PasswordResetToken.create({
        userId: user.id,
        tokenHash: PasswordResetToken.empreinte(jeton),
        expiresAt: DateTime.now().plus({ hours: 1 }),
      })

      // Le lien complet, par exemple http://localhost:3333/reset-password/Xk9f...
      const lien = `${request.protocol()}://${request.host()}/reset-password/${jeton}`

      // Envoi de l'email, mis en page par la vue emails/reset_password.edge
      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Réinitialise ton mot de passe Mini Racco')
          .htmlView('emails/reset_password', { username: user.username, lien })
      })
    }

    // Même message dans tous les cas, que le compte existe ou non (règle n° 4)
    session.flash('success', 'Si un compte existe avec cette adresse, un email vient de lui être envoyé.')
    return response.redirect().back()
  }

  /**
   * 3. Le lien a été cliqué : on vérifie le jeton, puis on affiche le formulaire
   */
  async showReset({ params, view, response, session }: HttpContext) {
    const token = await this.trouverJetonValide(params.token)

    if (!token) {
      session.flash('errors', { reset: 'Ce lien est invalide ou a expiré. Demande-en un nouveau.' })
      return response.redirect().toRoute('password.forgot')
    }

    // On renvoie le jeton à la vue, pour qu'il reparte avec le formulaire
    return view.render('pages/auth/reset_password', { token: params.token })
  }

  /**
   * 4. Enregistrer le nouveau mot de passe
   */
  async resetPassword({ params, request, response, session }: HttpContext) {
    // On revérifie le jeton : la page a pu rester ouverte au-delà de l'heure limite
    const token = await this.trouverJetonValide(params.token)

    if (!token) {
      session.flash('errors', { reset: 'Ce lien est invalide ou a expiré. Demande-en un nouveau.' })
      return response.redirect().toRoute('password.forgot')
    }

    // L'inspecteur vérifie le nouveau mot de passe et sa confirmation
    const { password } = await request.validateUsing(resetPasswordValidator)

    // On change le mot de passe (il est haché automatiquement par le modèle User)
    const user = await User.findOrFail(token.userId)
    user.password = password
    await user.save()

    // Usage unique : on détruit tous les jetons de ce compte
    await PasswordResetToken.query().where('userId', user.id).delete()

    session.flash('success', 'Ton mot de passe a été modifié. Tu peux te connecter.')
    return response.redirect().toPath('/login')
  }

  /**
   * Retrouve un jeton à partir de sa version en clair (celle du lien),
   * et vérifie qu'il n'a pas expiré. Renvoie null sinon.
   */
  private async trouverJetonValide(jeton: string) {
    // On calcule l'empreinte du jeton reçu, et on cherche cette empreinte en base
    const token = await PasswordResetToken.findBy('tokenHash', PasswordResetToken.empreinte(jeton))

    if (!token) return null

    // Jeton expiré : on le supprime au passage, et on le refuse
    if (!token.estValide()) {
      await token.delete()
      return null
    }

    return token
  }
}