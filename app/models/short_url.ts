import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ShortUrl extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Fait le lien direct avec la colonne 'original_url' de PostgreSQL
  @column({ columnName: 'original_url' })
  declare originalUrl: string

  // Fait le lien direct avec la colonne 'short_code' de PostgreSQL
  @column({ columnName: 'short_code' })
  declare shortCode: string

  @column()
  declare userId: number | null // 👈 Clé étrangère vers User

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // 🔗 Relation : Un short_url appartient à un utilisateur
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}