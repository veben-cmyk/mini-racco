import type { HttpContext } from '@adonisjs/core/http'
import ShortUrl from '#models/short_url'
import string from '@adonisjs/core/helpers/string'

export default class ShortUrlsController {

  // 1. Page d'accueil
    async index({ view }: HttpContext) {
    return view.render('pages/home')
    }

  // 2. Création de l'URL
    async shorten({ request, response, auth, session }: HttpContext) {
        const originalUrl = request.input('url')
        const customShortCode = request.input('shortCode')

    // Tente de récupérer l'utilisateur connecté (si disponible)
    await auth.check()
    const user = auth.user

    // Code court personnalisé ou généré
    const shortCode = customShortCode && customShortCode.trim() !== ''
        ? customShortCode
        : string.generateRandom(6)

    // Vérification des doublons sur le code court
    const existing = await ShortUrl.findBy('shortCode', shortCode)
    if (existing) {
        session.flash('errors', { shortCode: 'Ce code court est déjà utilisé. Choisis-en un autre !' })
        return response.redirect().back()
    }

    // Création de l'enregistrement
    const shortUrlRecord = new ShortUrl()
    shortUrlRecord.originalUrl = originalUrl
    shortUrlRecord.shortCode = shortCode

    // Association STRICTE à l'utilisateur si connecté
    if (user) {
        shortUrlRecord.userId = user.id
    }

    await shortUrlRecord.save()

    session.flash('success', 'URL créée avec succès !')
    return response.redirect().toRoute('urls.goToUrl')
    }

  // 3. Affichage de la liste des liens (go_to_url)
    async goToUrl({ view, auth }: HttpContext) {
    // Vérifie l'état de connexion actuel
        await auth.check()
        const user = auth.user

        let urls: ShortUrl[] = []

    if (user) {
      // SI CONNECTÉ : Charge UNIQUEMENT les liens créés par cet utilisateur précis
        urls = await ShortUrl.query()
        .where('userId', user.id)
        .orderBy('createdAt', 'desc')
    } else {
      // SI NON CONNECTÉ : Seuls les liens anonymes (userId NULL) sont affichés
        urls = await ShortUrl.query()
        .whereNull('userId')
        .orderBy('createdAt', 'desc')
    }

    return view.render('pages/go_to_url', { urls })
}

  // 4. Redirection vers l'URL d'origine
    async redirect({ params, response }: HttpContext) {
    const record = await ShortUrl.findBy('shortCode', params.code)

    if (!record) {
        return response.notFound('URL non trouvée')
    }

        let targetUrl = record.originalUrl
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl
        }

        return response.redirect().toPath(targetUrl)
    }

  // 5. Suppression sécurisée
    async destroy({ params, response, session, auth }: HttpContext) {
        await auth.check()
        const user = auth.user

        const query = ShortUrl.query().where('id', params.id)

        if (user) {
            query.where('userId', user.id)
        } else {
            query.whereNull('userId')
        }

        const record = await query.first()

        if (record) { 
            await record.delete()
            session.flash('success', 'L\'URL a été supprimée avec succès !')
        } else {
        session.flash('errors', { destroy: 'Vous n\'avez pas la permission de supprimer cette URL.' })
        }

    return response.redirect().back()
    }
}