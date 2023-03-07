import { ApiInfo } from '../apiService'

export const PropertyManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getProperty: {
    method: 'get',
    url: '/venues/:venueId/propertyConfigs'
  }
}
