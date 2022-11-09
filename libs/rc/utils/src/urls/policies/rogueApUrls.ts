import { ApiInfo } from '../../apiService'

export const RogueApUrls: { [key: string]: ApiInfo } = {
  deleteRogueApPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/rogueappolicies/:serviceId'
  }
}
