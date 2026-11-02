import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// L'inspecteur du formulaire d'inscription
export const registerValidator = vine.compile(
  vine.object({
    // ---- Nom d'utilisateur ----
    username: vine
      .string()
      .trim() // enlève les espaces avant et après
      .minLength(3) // règle 1 : au moins 3 caractères
      .maxLength(30) // règle 1 : au plus 30 caractères
      .regex(/^[A-Za-z0-9_-]+$/) // règle 2 : lettres, chiffres, - et _ seulement
      // Règle 3 : on vérifie dans la table users que ce nom est libre
      .unique(async (db, value) => {
        const existant = await db.from('users').where('username', value).first()
        return !existant // true = libre, donc accepté
      }),

    // ---- Email ----
    email: vine
      .string()
      .trim()
      .email() // règle 1 : format nom@domaine.com
       // Règle 2 : tout en minuscules, sans rien modifier d'autre.
      // (normalizeEmail retirait aussi les points des adresses Gmail :
      //  jaden.veben@gmail.com devenait jadenveben@gmail.com)
        .toLowerCase()
      // Règle 3 : on vérifie que l'email n'a pas déjà un compte
        .unique(async (db, value) => {
        const existant = await db.from('users').where('email', value).first()
        return !existant
    }),

    // ---- Mot de passe ----
    // Pas de trim() ici : un espace peut faire partie d'un mot de passe volontairement
    password: vine
      .string()
      .minLength(8) // règle 1 : au moins 8 caractères
      .maxLength(64), // règle 2 : au plus 64
  })
)

// Les messages renvoyés quand une règle n'est pas respectée
registerValidator.messagesProvider = new SimpleMessagesProvider({
  // Nom d'utilisateur
  'username.required': "Merci de choisir un nom d'utilisateur.",
  'username.minLength': "Le nom d'utilisateur doit contenir au moins 3 caractères.",
  'username.maxLength': "Le nom d'utilisateur ne peut pas dépasser 30 caractères.",
  'username.regex': "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, - et _.",
  'username.database.unique': "Ce nom d'utilisateur est déjà pris.",

  // Email
  'email.required': 'Merci de saisir ton adresse email.',
  'email.email': "Cette adresse email n'est pas valide.",
  'email.database.unique': 'Un compte existe déjà avec cet email.',

  // Mot de passe
  'password.required': 'Merci de choisir un mot de passe.',
  'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères.',
  'password.maxLength': 'Le mot de passe ne peut pas dépasser 64 caractères.',
})
/**
 * Inspecteur du formulaire "Mot de passe oublié" : une seule case, l'email.
 * On ne vérifie PAS que l'email existe en base : ce serait révéler
 * à n'importe qui si une adresse a un compte chez nous.
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .toLowerCase(), // même règle qu'à l'inscription et à la connexion
  })
)

forgotPasswordValidator.messagesProvider = new SimpleMessagesProvider({
  'email.required': 'Merci de saisir ton adresse email.',
  'email.email': "Cette adresse email n'est pas valide.",
})

/**
 * Inspecteur du formulaire "Nouveau mot de passe".
 * confirmed() exige un second champ "password_confirmation" identique :
 * c'est ce qui détecte une faute de frappe dans le mot de passe.
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(8) // mêmes règles qu'à l'inscription
      .maxLength(64)
      .confirmed(), // doit être identique à password_confirmation
  })
)

resetPasswordValidator.messagesProvider = new SimpleMessagesProvider({
  'password.required': 'Merci de choisir un nouveau mot de passe.',
  'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères.',
  'password.maxLength': 'Le mot de passe ne peut pas dépasser 64 caractères.',
  'password.confirmed': 'Les deux mots de passe ne sont pas identiques.',
})