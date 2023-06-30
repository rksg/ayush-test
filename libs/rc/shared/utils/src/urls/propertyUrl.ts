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
  'deletePropertyUnits' |
  'getResidentPortalList' |
  'getResidentPortalsQuery' |
  'addResidentPortal' |
  'getResidentPortal' |
  'patchResidentPortal' |
  'deleteResidentPortals' |
  'getResidentPortalLogo' |
  'getResidentPortalFavicon' |
  'deleteResidentPortalLogo' |
  'deleteResidentPortalFavicon'

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
    url: '/venues/:venueId/propertyConfigs'
  },
  patchPropertyConfigs: {
    method: 'PATCH',
    newApi: true,
    url: '/venues/:venueId/propertyConfigs'
  },
  addPropertyUnit: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units'
  },
  importPropertyUnits: {
    method: 'post',
    newApi: true,
    url: '/venues/:venueId/units'
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
    url: '/venues/:venueId/units/:unitId'
  },
  deletePropertyUnits: {
    method: 'delete',
    newApi: true,
    url: '/venues/:venueId/units'
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
  }
}
