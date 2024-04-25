import { ApiInfo } from '@acx-ui/utils'

import { NetworkSegmentationUrls } from './networkSegmentationUrls'

export const NetworkSegmentationRbacUrls: { [key: string]: ApiInfo } = {
  ...NetworkSegmentationUrls,
  getWebAuthTemplateSwitches: {
    method: 'post',
    newApi: true,
    url: '/webAuthPageTemplates/:templateId/switches/query'
  }
}
