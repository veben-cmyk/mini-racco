import type { HttpContext } from '@adonisjs/core/http'
import ShortUrl from '#models/short_url'
import string from '@adonisjs/core/helpers/string'
// L'inspecteur qui vérifie le formulaire de création
import { shortenUrlValidator } from '#validators/short_url'

export default class ShortUrlsController {
  /**
   * 1. Page d'accueil (route publique)
   * Affiche simplement le formulaire de création.
   */
  async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

  /**
   * 2. Création d'un lien court (route protégée par le middleware auth)
   */
    /**
   * 2. Création d'un lien court (route protégée par le middleware auth)
   */
  async shorten({ request, response, auth, session }: HttpContext) {
    // Le middleware auth garantit qu'un utilisateur est connecté ici
    const user = auth.getUserOrFail()

    // On confie le formulaire à l'inspecteur.
    // Refusé : retour automatique au formulaire avec les erreurs.
    // Accepté : on récupère url et shortCode déjà vérifiés.
    const { url, shortCode } = await request.validateUsing(shortenUrlValidator)

    // Si l'utilisateur a choisi un code, on le garde (l'inspecteur a vérifié qu'il est libre).
    // Sinon (case vide), on en fabrique un au hasard.
    const code = shortCode ?? (await this.genererCodeUnique())

    // Création du lien en base, rattaché à l'utilisateur connecté
    await ShortUrl.create({
      originalUrl: url,
      shortCode: code,
      userId: user.id,
    })

    session.flash('success', 'URL créée avec succès !')
    return response.redirect().toRoute('urls.goToUrl')
  }

  /**
   * 3. Liste des liens de l'utilisateur connecté (route protégée)
   */
  async goToUrl({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    // On ne charge QUE les liens de cet utilisateur, du plus récent au plus ancien
    const urls = await ShortUrl.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')

    return view.render('pages/go_to_url', { urls })
  }

/**
   * 4. Redirection vers l'URL d'origine (route publique)
   * Celui qui clique sur un lien court n'a pas besoin de compte.
   */
  async redirect({ params, response }: HttpContext) {
    // findByOrFail cherche le lien ; s'il n'existe pas, Adonis affiche automatiquement une page 404
    const record = await ShortUrl.findByOrFail('shortCode', params.code)

    // Plus besoin d'ajouter https:// : le validateur l'impose à la création
    return response.redirect().toPath(record.originalUrl)
  }

  /**
   * 5. Suppression d'un lien (route protégée)
   * Un utilisateur ne peut supprimer QUE ses propres liens.
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    // On cherche le lien par son id ET par son propriétaire :
    // si le lien appartient à quelqu'un d'autre, la requête ne trouve rien
    const record = await ShortUrl.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (record) {
      await record.delete()
      session.flash('success', "L'URL a été supprimée avec succès !")
    } else {
      session.flash('errors', { destroy: "Vous n'avez pas la permission de supprimer cette URL." })
    }

    return response.redirect().back()
  }

    /**
   * Fabrique un code aléatoire de 6 caractères qui n'existe pas encore en base.
   * Deux codes identiques sont très improbables, mais on vérifie quand même (5 essais max).
   */
  private async genererCodeUnique() {
    for (let essai = 0; essai < 5; essai++) {
      const code = string.generateRandom(6)
      const existant = await ShortUrl.findBy('shortCode', code)
      if (!existant) return code // code libre : on le renvoie
    }
    throw new Error('Impossible de générer un code unique, réessaie.')
  }
}

// Le ?? dans shortCode ?? (await this.genererCodeUnique()) se lit « sinon » :
//  prends shortCode, sinon (s’il est vide) génère-en un.