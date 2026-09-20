import type { HttpContext } from '@adonisjs/core/http'

export default class QrCodesController {
  public async generate({ params }: HttpContext) {
    // À implémenter
    console.log(params)
  }
}
