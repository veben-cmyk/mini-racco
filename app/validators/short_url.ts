import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const shortenUrlValidator = vine.compile(
    vine.object({
        url: vine
            .string()
            .trim()
            .maxLength(2048)
            .url({
            require_protocol: true, // refuse "exemple.com" sans http(s)://
            protocols: ['http', 'https'], // refuse javascript:, ftp:, etc.
        }),
    })
)

// Messages d'erreur en français
shortenUrlValidator.messagesProvider = new SimpleMessagesProvider({
    'url.required': 'Merci de saisir une URL.',
    'url.maxLength': "L'URL est trop longue (2048 caractères maximum).",
    'url.url': "L'URL doit être valide et commencer par http:// ou https://",
})