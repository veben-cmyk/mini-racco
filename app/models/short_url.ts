import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ShortUrl extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Fait le lien direct avec la colonne 'original_url' de PostgreSQL
  @column({ columnName: 'original_url' })
  declare originalUrl: string

  // Fait le lien direct avec la colonne 'short_code' de PostgreSQL
  @column({ columnName: 'short_code' })
  declare shortCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}