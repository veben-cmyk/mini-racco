import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Règle 3 : la liste des mots déjà utilisés par les pages du site.
// Un lien "/login" ne marcherait jamais, car la page de connexion passe avant.
const MOTS_RESERVES = ['login', 'register', 'logout', 'shorten', 'go-to-url', 'urls']

// L'inspecteur : il vérifie les deux cases du formulaire
export const shortenUrlValidator = vine.compile(
  vine.object({
    // ---- Case 1 : l'URL (déjà faite ce matin) ----
    url: vine
      .string()
      .trim() // enlève les espaces avant et après
      .maxLength(2048) // pas plus de 2048 caractères
      .url({
        require_protocol: true, // doit commencer par http:// ou https://
        protocols: ['http', 'https'], // refuse les autres (javascript:, ftp:...)
      }),

    // ---- Case 2 : le code choisi (NOUVEAU) ----
    shortCode: vine
      .string()
      .trim()
      .minLength(3) // règle 2 : au moins 3 caractères
      .maxLength(30) // règle 2 : au plus 30 caractères
      .regex(/^[A-Za-z0-9_-]+$/) // règle 1 : lettres, chiffres, - et _ seulement
      .notIn(MOTS_RESERVES) // règle 3 : pas un mot réservé
      // Règle 4 : on regarde dans la base si le code existe déjà.
      // On renvoie true si le code est libre (donc accepté).
      .unique(async (db, value) => {
        const existant = await db.from('short_urls').where('short_code', value).first()
        return !existant
      })
      .optional(), // règle 5 : la case peut rester vide
  })
)

// Les petits mots que l'inspecteur renvoie quand une règle n'est pas respectée
shortenUrlValidator.messagesProvider = new SimpleMessagesProvider({
  // Messages pour l'URL
  'url.required': 'Merci de saisir une URL.',
  'url.maxLength': "L'URL est trop longue (2048 caractères maximum).",
  'url.url': "L'URL doit être valide et commencer par http:// ou https://",

  // Messages pour le code
  'shortCode.minLength': 'Le code doit contenir au moins 3 caractères.',
  'shortCode.maxLength': 'Le code ne peut pas dépasser 30 caractères.',
  'shortCode.regex': 'Le code ne peut contenir que des lettres, chiffres, - et _.',
  'shortCode.notIn': 'Ce code est réservé, choisis-en un autre.',
  'shortCode.database.unique': 'Ce code est déjà utilisé, choisis-en un autre.',
})