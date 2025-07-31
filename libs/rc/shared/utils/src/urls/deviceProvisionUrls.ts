import { ApiInfo } from '@acx-ui/utils'

export const DeviceProvisionUrlsInfo: { [key: string]: ApiInfo } = {
  getApStatus: {
    method: 'get',
    url: '/deviceProvisions/statusReports/aps',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/statusReports/aps'
  },
  getSwitchStatus: {
    method: 'get',
    url: '/deviceProvisions/statusReports/switches',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/statusReports/switches'
  },
  refreshApStatus: {
    method: 'PATCH',
    url: '/deviceProvisions/statusReports/aps',
    newApi: true,
    opsApi: 'PATCH:/deviceProvisions/statusReports/aps'
  },
  refreshSwitchStatus: {
    method: 'PATCH',
    url: '/deviceProvisions/statusReports/switches',
    newApi: true,
    opsApi: 'PATCH:/deviceProvisions/statusReports/switches'
  },
  getApModels: {
    method: 'GET',
    url: '/deviceProvisions/aps/models',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/aps/models'
  },
  getSwitchModels: {
    method: 'GET',
    url: '/deviceProvisions/switches/models',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/switches/models'
  },
  getApProvisions: {
    method: 'POST',
    url: '/deviceProvisions/aps/query',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/aps/query'
  },
  getSwitchProvisions: {
    method: 'POST',
    url: '/deviceProvisions/switches/query',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/switches/query'
  },
  importApProvisions: {
    method: 'POST',
    url: '/deviceProvisions/venues/:venueId/apGroups/:apGroupId/aps',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/venues/{venueId}/apGroups/{apGroupId}/aps'
  },
  importSwitchProvisions: {
    method: 'POST',
    url: '/deviceProvisions/venues/:venueId/switches',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/venues/{venueId}/switches'
  },
  hideApProvisions: {
    method: 'PATCH',
    url: '/deviceProvisions/hiddenDevices/aps',
    newApi: true,
    opsApi: 'PATCH:/deviceProvisions/hiddenDevices/aps'
  },
  hideSwitchProvisions: {
    method: 'PATCH',
    url: '/deviceProvisions/hiddenDevices/switches',
    newApi: true,
    opsApi: 'PATCH:/deviceProvisions/hiddenDevices/switches'
  }
}
