import { ApiInfo } from '@acx-ui/utils'

import { NetworkSegmentationUrls } from './networkSegmentationUrls'

export const NetworkSegmentationRbacUrls: { [key: string]: ApiInfo } = {
  ...NetworkSegmentationUrls,
  getWebAuthTemplateSwitches: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId/switches/query'
  }
}
