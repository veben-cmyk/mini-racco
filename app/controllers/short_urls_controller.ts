import ShortUrl from '#models/short_url'
import type { HttpContext } from '@adonisjs/core/http'
import QRCode from 'qrcode'

export default class ShortUrlsController {

  // 1. Affiche simplement le formulaire sur la page d'accueil
    async index({ view }: HttpContext) {
    return view.render('pages/home')
    }

  // 2. Traite le formulaire : génère le code, enregistre en BDD et crée le QR Code
    async shorten({ request, view }: HttpContext) {
        const url = request.input('url')
        const code = await this.genererCode()

    // Création et sauvegarde en BDD
    const shortUrlRecord = new ShortUrl()
    shortUrlRecord.originalUrl = url
    shortUrlRecord.shortCode = code
    await shortUrlRecord.save()

    // Fabrication de l'URL courte (ex: http://localhost:3330/aX9zQ)
    const shortUrl = `${request.completeUrl().split('/shorten')[0]}/${code}`

    // Génération du QR Code sous forme d'image (Data URL Base64)
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl)

    // On renvoie la page HTML avec les variables pour l'affichage
    return view.render('pages/result', {
        shortUrl,
        qrCodeDataUrl,
        
    })
    }

  // 3. Redirige l'utilisateur vers le vrai site d'origine
    async redirect({ params, response }: HttpContext) {
    // Cherche en BDD la ligne qui a ce shortCode
    const record = await ShortUrl.findByOrFail('shortCode', params.code)

    // Redirige le navigateur vers l'URL originale
    return response.redirect(record.originalUrl)
    }

  // Ta fonction personnalisée pour fabriquer le code aléatoire
    async genererCode() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const code = []

    for (let i = 0; i < 5; i++) {
      const index = Math.floor(Math.random() * caracteres.length)
        code.push(caracteres[index])
    }

    return code.join('')
    }
}