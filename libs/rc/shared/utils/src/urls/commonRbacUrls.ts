import { ApiInfo } from '@acx-ui/utils'

import { CommonUrlsInfo } from './commonUrls'

export const CommonRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...CommonUrlsInfo,
  UpdateSwitchPosition: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/position',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:serialNumber/position',
    newApi: true
  }
}
