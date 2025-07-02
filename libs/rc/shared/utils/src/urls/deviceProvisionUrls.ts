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
    method: 'post',
    url: '/deviceProvisions/statusReports/aps',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/statusReport/aps'
  },
  refreshSwitchStatus: {
    method: 'post',
    url: '/deviceProvisions/statusReports/switches',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/statusReport/switches'
  },
  getApProvisions: {
    method: 'GET',
    url: '/deviceProvisions/aps',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/aps'
  },
  getSwitchProvisions: {
    method: 'GET',
    url: '/deviceProvisions/switches',
    newApi: true,
    opsApi: 'GET:/deviceProvisions/switches'
  },
  importApProvisions: {
    method: 'POST',
    url: '/deviceProvisions/venue/:venueId/apGroups/:apGroupId/aps',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/venue/{venueId}/apGroups/{apGroupId}/aps'
  },
  importSwitchProvisions: {
    method: 'POST',
    url: '/deviceProvisions/venue/:venueId/switches',
    newApi: true,
    opsApi: 'POST:/deviceProvisions/venue/{venueId}/switches'
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
