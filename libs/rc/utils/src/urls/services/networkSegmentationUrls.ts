import { ApiInfo } from '../../apiService'


export const NetworkSegmentationUrls: { [key in string]: ApiInfo } = {
  getNetworkSegmentationGroupById: {
    method: 'get',
    url: '/networkSegmentationGroups/:serviceId'
  }
}
