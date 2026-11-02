import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Table des jetons de réinitialisation de mot de passe.
 * Un jeton = un lien envoyé par email, valable une heure, utilisable une seule fois.
 */
export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // À quel utilisateur appartient ce jeton.
      // onDelete CASCADE : si le compte est supprimé, ses jetons disparaissent aussi.
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // L'EMPREINTE du jeton (jamais le jeton en clair, comme pour les mots de passe)
      table.string('token_hash').notNullable().unique()

      // Date limite d'utilisation (création + 1 heure)
      table.timestamp('expires_at').notNullable()

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}