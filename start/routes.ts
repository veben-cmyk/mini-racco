/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import ShortUrlsController from '#controllers/short_urls_controller'

router.get('/', [ShortUrlsController, 'index'])

router.post('/shorten', [ShortUrlsController, 'shorten'])

router.get('/:code', [ShortUrlsController, 'redirect'])
