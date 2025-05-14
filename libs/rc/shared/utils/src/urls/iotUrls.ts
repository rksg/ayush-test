import { ApiInfo } from '@acx-ui/utils'

export const IotUrlsInfo: { [key: string]: ApiInfo } = {
  addIotController: {
    method: 'post',
    url: '/iots',
    newApi: true,
    opsApi: 'POST:/iots'
  },
  getIotController: {
    method: 'get',
    url: '/iots/:iotId',
    newApi: true,
    opsApi: 'GET:/iots/{id}'
  },
  updateIotController: {
    method: 'PATCH',
    url: '/iots/:iotId',
    newApi: true,
    opsApi: 'PATCH:/iots/{id}'
  },
  deleteIotController: {
    method: 'delete',
    url: '/iots/:iotId',
    newApi: true,
    opsApi: 'DELETE:/iotController/{id}'
  },
  getIotControllerList: {
    method: 'post',
    url: '/iots/query',
    newApi: true,
    opsApi: 'POST:/iots/query'
  },
  testConnectionIotController: {
    method: 'PATCH',
    url: '/iots/diagnosisCommands',
    newApi: true,
    opsApi: 'PATCH:/iots/diagnosisCommands'
  },
  getIotControllerDashboard: {
    method: 'get',
    url: '/iotControllers/:iotId/dashboard',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}'
  }
}
