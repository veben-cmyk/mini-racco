import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// je crée une classe appelée ShortUrl.
// Elle représente ma table : short_urls

// Modèle TypeScript  Table SQLite
// ShortUrl ───────→  short_urls
// Le modèle va permettre à mon application de lire et modifier les données de cette table.

export default class ShortUrl extends BaseModel { 
  // BaseModel est fourni par Lucid, l’ORM d’AdonisJS.
  // ju donnes à ShortUrl les fonctionnalités nécessaires pour communiquer avec la base de données.
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare originalUrl: string

  @column()
  declare shortCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}