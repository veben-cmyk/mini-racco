import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'short_urls' // On vise la table short_urls existante

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
    
        table
        .integer('user_id')       // 1. Crée une colonne nommée 'user_id' de type Entier
        .unsigned()               // 2. Interdit les nombres négatifs (un ID est toujours >= 1)
        .references('id')         // 3. Spécifie que cette colonne pointe vers la colonne 'id'...
        .inTable('users')         // 4. ...de la table 'users' (C'est la Clé Étrangère / Foreign Key)
        .onDelete('CASCADE')      // 5. Si l'utilisateur est supprimé, supprime aussi tous ses liens
        .nullable()               // 6. Autorise la valeur NULL (permet d'avoir des liens sans compte)
    })
  }

  // La fonction down() : L'annulation (Rollback)
  // La méthode down() est appelée si on annule la migration (node ace migration:rollback).
  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_id') // Supprime uniquement la colonne 'user_id'
    })
  }
}