import { ApiInfo } from '@acx-ui/utils'

export const IotUrlsInfo: { [key: string]: ApiInfo } = {
  addIotController: {
    method: 'post',
    url: '/iotController',
    newApi: true,
    opsApi: 'POST:/iotController'
  },
  getIotController: {
    method: 'get',
    url: '/iotController/:serialNumber',
    newApi: true,
    opsApi: 'GET:/iotController/{serialNumber}'
  },
  getIotControllerList: {
    method: 'post',
    url: '/iots/query',
    newApi: true,
    opsApi: 'POST:/iots/query'
  },
  deleteIotController: {
    method: 'delete',
    url: '/iots/:iotId',
    newApi: true,
    opsApi: 'DELETE:/iotController/{iotId}'
  }
}
