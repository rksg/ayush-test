import { ApiInfo } from '@acx-ui/utils'

export const IotUrlsInfo: { [key: string]: ApiInfo } = {
  addIotController: {
    method: 'post',
    url: '/iotControllers',
    newApi: true,
    opsApi: 'POST:/iotControllers'
  },
  getIotController: {
    method: 'get',
    url: '/iotControllers/:iotId',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}'
  },
  updateIotController: {
    method: 'PATCH',
    url: '/iotControllers/:iotId',
    newApi: true,
    opsApi: 'PATCH:/iotControllers/{id}'
  },
  deleteIotController: {
    method: 'delete',
    url: '/iotControllers/:iotId',
    newApi: true,
    opsApi: 'DELETE:/iotControllers/{id}'
  },
  getIotControllerList: {
    method: 'post',
    url: '/iotControllers/query',
    newApi: true,
    opsApi: 'POST:/iotControllers/query'
  },
  testConnectionIotController: {
    method: 'PATCH',
    url: '/iotControllers/diagnosisCommands',
    newApi: true,
    opsApi: 'PATCH:/iotControllers/diagnosisCommands'
  },
  getIotControllerSerialNumber: {
    method: 'get',
    url: '/iotControllers/serialNumber/:serialNumber',
    newApi: true,
    opsApi: 'GET:/iotControllers/serialNumber/{id}'
  },
  getIotControllerVenues: {
    method: 'get',
    url: '/iotControllers/:iotId/venueIds',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}/venueIds'
  },
  getIotControllerLicenseStatus: {
    method: 'get',
    url: '/iotControllers/:iotId/licenseStatus',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}'
  },
  getIotControllerDashboard: {
    method: 'get',
    url: '/iotControllers/:iotId/dashboard',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}'
  },
  getIotControllerPlugins: {
    method: 'get',
    url: '/iotControllers/:iotId/plugins',
    newApi: true,
    opsApi: 'GET:/iotControllers/{id}'
  }
}
