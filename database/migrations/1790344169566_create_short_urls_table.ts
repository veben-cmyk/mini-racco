import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'short_urls'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Nos 2 colonnes principales
      table.string('original_url').notNullable()
      table.string('short_code').notNullable().unique()

      
      // Dates de création et de mise à jour gérées automatiquement
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}