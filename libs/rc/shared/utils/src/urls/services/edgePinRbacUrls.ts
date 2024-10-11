import { ApiInfo } from '@acx-ui/utils'

import { EdgePinUrls } from './edgePinUrls'

export const EdgePinRbacUrls: { [key: string]: ApiInfo } = {
  ...EdgePinUrls,
  getWebAuthTemplateSwitches: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId/switches'
  }
}
