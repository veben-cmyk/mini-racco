import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'short_urls' //le nom de la table 


  // « Quand j’exécute cette migration, crée la table short_urls. »
  async up() {
    this.schema.createTable(this.tableName, (table) => {

      // creation de l ID par adonis 
      // Cela signifie que chaque ligne de notre table aura un identifiant.
      table.increments('id') 


      // mes deux colones pour stocker l'url_long et le code court 
      // Utilisation de text() pour accepter les très longues URL et .notNullable()
      table.text('original_url').notNullable()
      table.string('short_code').notNullable().unique()

      // Ils servent à savoir :
      // created_at → quand l’enregistrement a été créé
      // updated_at → quand il a été modifié
      table.timestamp('created_at')
      table.timestamp('updated_at')

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}