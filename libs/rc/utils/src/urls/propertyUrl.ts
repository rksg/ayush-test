import { ApiInfo } from '../apiService'

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
  'deleteResidentPortals'

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
  }
}
