import type { HttpContext } from '@adonisjs/core/http'
import ShortUrl from '#models/short_url'

export default class ShortUrlsController {
    // 1. afficher la page d'accueil
    async index({view}: HttpContext){
        return view.render('pages/home')
    }

    // 2. Traiter le formulaire et sauvegarder en BDD
    async shorten({ request, response }: HttpContext) {
    // Étape A : Extraction des données du formulaire
    const originalUrl = request.input('url')
    const customShortCode = request.input('shortCode')

    // Étape B : Enregistrement dans PostgreSQL via le modèle ShortUrl
    const shortUrlRecord = new ShortUrl()
    shortUrlRecord.originalUrl = originalUrl
    shortUrlRecord.shortCode = customShortCode
    await shortUrlRecord.save()

    // Étape C : Redirection vers la page goToUrl
    return response.redirect().toRoute('urls.goToUrl')
    }

    // 3. Afficheur de la page goToUrl (avec la liste BDD pour la sidebar)
    async goToUrl({ view }: HttpContext) {
    // Étape A : Récupération de tous les enregistrements
    const urls = await ShortUrl.all()

    // Étape B : Rendu de la vue avec injection des données
        return view.render('pages/go_to_url', { urls })
    }

    
    // 4. Rediriger l'utilisateur vers le site d'origine
    async redirect({ params, response }: HttpContext) {
    const record = await ShortUrl.findBy('shortCode', params.code)

    if (!record) {
        return response.notFound('URL non trouvée')
    }

    let targetUrl = record.originalUrl

    // On s'assure que l'URL est bien absolue pour forcer la redirection externe
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl
    }

    return response.redirect(targetUrl)
    }

    // 5. Supprimer un lien depuis la sidebar
    async destroy({ params, response, session }: HttpContext) {
    // Étape A : Trouver le lien par son ID 
    const record = await ShortUrl.findOrFail(params.id)

    // Étape B : Supprimer la ligne dans PostgreSQL
        await record.delete()

    // On enregistre un message flash dans la session
    session.flash('success', 'L\'URL a été supprimée avec succès !')

    // Étape C : Recharger la page goToUrl
        return response.redirect().toRoute('urls.goToUrl')
    }

}