import { createHash } from 'node:crypto'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import string from '@adonisjs/core/helpers/string'
import User from '#models/user'

/**
 * Un jeton de réinitialisation de mot de passe.
 * En base, on ne garde que son EMPREINTE (tokenHash), jamais le jeton lui-même.
 */
export default class PasswordResetToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Le propriétaire du jeton
  @column()
  declare userId: number

  // L'empreinte du jeton
  @column()
  declare tokenHash: string

  // Date limite d'utilisation
  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relation : un jeton appartient à un utilisateur
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Fabrique un nouveau jeton : 64 caractères aléatoires.
   * string.random utilise un générateur cryptographique : impossible à deviner.
   * C'est CE texte qui part dans l'email ; il n'est jamais enregistré tel quel.
   */
  static genererJeton() {
    return string.random(64)
  }

  /**
   * Calcule l'empreinte d'un jeton (algorithme SHA-256).
   * Le même jeton donne toujours la même empreinte, mais on ne peut pas
   * retrouver le jeton à partir de l'empreinte.
   */
  static empreinte(jeton: string) {
    return createHash('sha256').update(jeton).digest('hex')
  }

  /**
   * Le jeton est-il encore valable ? (date limite pas encore dépassée)
   */
  estValide() {
    return this.expiresAt > DateTime.now()
  }
}