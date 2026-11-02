import type { HttpContext } from '@adonisjs/core/http'
import ShortUrl from '#models/short_url'
import User from '#models/user'

/**
 * Contrôleur de l'administration.
 * Toutes ses routes sont gardées par auth PUIS role({ roles: ['admin'] }) :
 * ces méthodes ne sont donc jamais atteintes par un simple utilisateur.
 */
export default class AdminController {
    /**
   * Tableau de bord : tous les liens et tous les utilisateurs
   */
    async index({ view }: HttpContext) {
        // TOUS les liens (pas de filtre par userId : c'est le passe-partout).
        // preload('user') charge en même temps le propriétaire de chaque lien,
        // pour afficher son nom sans faire une requête par lien.
        const liens = await ShortUrl.query().preload('user').orderBy('createdAt', 'desc')

        // Tous les utilisateurs, avec leur nombre de liens.
        // withCount ajoute un compteur, rangé dans user.$extras.shortUrls_count
        const utilisateurs = await User.query().withCount('shortUrls').orderBy('createdAt', 'desc')

        return view.render('pages/admin/index', { liens, utilisateurs })
    }

    /**
     * Supprimer N'IMPORTE QUEL lien (modération d'un lien abusif)
     */
    async destroyLink({ params, response, session }: HttpContext) {
        // findOrFail : page 404 si le lien n'existe pas.
        // Pas de vérification du propriétaire ici : c'est justement le rôle de l'admin.
        const lien = await ShortUrl.findOrFail(params.id)
        await lien.delete()

        session.flash('success', `Le lien /${lien.shortCode} a été supprimé.`)
        return response.redirect().toRoute('admin.index')
    }
}