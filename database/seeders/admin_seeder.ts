import User from '#models/user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Lecture des identifiants dans le .env (jamais écrits dans le code)
    const username = env.get('ADMIN_USERNAME')
    const email = env.get('ADMIN_EMAIL')
    const password = env.get('ADMIN_PASSWORD')

    // S'il manque une variable, on s'arrête avec un message clair
    if (!username || !email || !password) {
      console.log('⚠️  ADMIN_USERNAME, ADMIN_EMAIL et ADMIN_PASSWORD doivent être remplis dans .env')
      return
    }

    // updateOrCreate : cherche un compte avec cet email.
    //  - S'il existe : il le met à jour (et lui donne le rôle admin).
    //  - Sinon : il le crée.
    // On peut donc relancer le seeder sans créer de doublon.
    // Le mot de passe est haché automatiquement par le modèle User, comme à l'inscription.
    await User.updateOrCreate(
      { email: email.toLowerCase() },
      { username, password, role: 'admin' }
    )

    console.log(`✅ Compte admin prêt : ${email.toLowerCase()}`)
  }
  
}
