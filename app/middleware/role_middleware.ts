import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

// Les rôles possibles, les mêmes que dans la colonne "role" de la table users
type Role = 'user' | 'admin'

/**
 * Vigile de rôle : laisse passer uniquement les utilisateurs
 * dont le rôle fait partie de la liste "roles".
 *
 * Utilisation : middleware.role({ roles: ['admin'] })
 * À placer APRÈS le middleware auth, qui garantit que l'utilisateur est connecté.
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: Role[] }) {
    // auth est déjà passé avant : on sait qu'un utilisateur est connecté
    const user = ctx.auth.getUserOrFail()

    // Son rôle n'est pas dans la liste autorisée : accès refusé
    if (!options.roles.includes(user.role)) {
      // On le renvoie à l'accueil avec un message d'explication
      ctx.session.flash('errors', { role: "Tu n'as pas accès à cette page." })
      return ctx.response.redirect().toRoute('urls.home')
    }

    // Rôle autorisé : on laisse passer vers la suite (le contrôleur)
    return next()
  }
}