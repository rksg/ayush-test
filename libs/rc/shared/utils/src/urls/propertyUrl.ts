import { ApiInfo } from '@acx-ui/utils'

type PropertyUrlType =
  'getPropertyConfigs' |
  'getPropertyConfigsQuery' |
  'updatePropertyConfigs' |
  'patchPropertyConfigs' |
  'addPropertyUnit' |
  'importPropertyUnits' |
  'exportPropertyUnits' |

  'getUnitById' |
  'getPropertyUnitList' |
  'updatePropertyUnit' |
  'deletePropertyUnit' |
  'notifyPropertyUnits' |
  'getResidentPortalList' |
  'getResidentPortalsQuery' |
  'addResidentPortal' |
  'getResidentPortal' |
  'patchResidentPortal' |
  'deleteResidentPortals' |
  'getResidentPortalLogo' |
  'getResidentPortalFavicon' |
  'deleteResidentPortalLogo' |
  'deleteResidentPortalFavicon' |
  'bulkUpdateUnitProfile'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const PropertyUrlsInfo: { [key in PropertyUrlType]: ApiInfo } = {
  getPropertyConfigs: {
    method: 'get',
    newApi: true,
    url: '/venues/:venueId/propertyConfigs'
  },
  getPropertyConfigsQuery: {
    method: 'post',
    newApi: true,
    url: '/venues/propertyConfigs/query'
  },
  updatePropertyConfigs: {
    method: 'put',
    newApi: true,
    url: '/venues/:venueId/propertyConfigs',
    opsApi: 'PUT:/venues/{id}/propertyConfigs'
  },
  patchPropertyConfigs: {
    method: 'PATCH',
    newApi: true,
    url: '/venues/:venueId/propertyConfigs',
    opsApi: 'PATCH:/venues/{id}/propertyConfigs'
  },
  addPropertyUnit: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units',
    opsApi: 'POST:/venues/{id}/units'
  },
  importPropertyUnits: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units',
    opsApi: 'POST:/venues/{id}/units'
  },
  exportPropertyUnits: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units/query'
  },
  getUnitById: {
    method: 'get',
    newApi: true,
    url: '/venues/:venueId/units/:unitId'
  },
  getPropertyUnitList: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units/query'
  },
  updatePropertyUnit: {
    method: 'PATCH',
    newApi: true,
    url: '/venues/:venueId/units/:unitId',
    opsApi: 'PATCH:/venues/{id}/units/{id}'
  },
  deletePropertyUnit: {
    method: 'delete',
    newApi: true,
    url: '/venues/:venueId/units/:unitId',
    opsApi: 'DELETE:/venues/{id}/units/{id}',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  notifyPropertyUnits: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units/notifications',
    opsApi: 'POST:/venues/{id}/units/notifications'
  },
  getResidentPortalList: {
    method: 'get',
    newApi: true,
    url: `/residentPortals${paginationParams}`
  },
  getResidentPortalsQuery: {
    method: 'post',
    newApi: true,
    url: '/residentPortals/query'
  },
  addResidentPortal: {
    method: 'post',
    newApi: true,
    url: '/residentPortals'
  },
  getResidentPortal: {
    method: 'get',
    newApi: true,
    url: '/residentPortals/:serviceId'
  },
  patchResidentPortal: {
    method: 'PATCH',
    newApi: true,
    url: '/residentPortals/:serviceId'
  },
  deleteResidentPortals: {
    method: 'DELETE',
    newApi: true,
    url: '/residentPortals'
  },
  getResidentPortalLogo: {
    method: 'get',
    newApi: true,
    url: '/residentPortals/:serviceId/files/logo'
  },
  getResidentPortalFavicon: {
    method: 'get',
    newApi: true,
    url: '/residentPortals/:serviceId/files/favIcon'
  },
  deleteResidentPortalLogo: {
    method: 'delete',
    newApi: true,
    url: '/residentPortals/:serviceId/files/logo'
  },
  deleteResidentPortalFavicon: {
    method: 'delete',
    newApi: true,
    url: '/residentPortals/:serviceId/files/favIcon'
  },
  bulkUpdateUnitProfile: {
    method: 'put',
    newApi: true,
    url: '/venues/:venueId/units/qosProfileAssignments/:profileId',
    opsApi: 'PUT:/venues/{id}/units/qosProfileAssignments/{id}'
  }
}
