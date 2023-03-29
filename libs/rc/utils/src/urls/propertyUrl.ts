import { ApiInfo } from '../apiService'

type PropertyUrlType =
  'getPropertyConfigs' |
  'updatePropertyConfigs' |
  'patchPropertyConfigs' |
  'addPropertyUnit' |
  'importPropertyUnits' |
  'exportPropertyUnits' |

  'getUnitById' |
  'getPropertyUnitList' |
  'updatePropertyUnit' |
  'deletePropertyUnits' |
  'getResidentPortalList'

export const PropertyUrlsInfo: { [key in PropertyUrlType]: ApiInfo } = {
  getPropertyConfigs: {
    method: 'get',
    newApi: true,
    url: '/venues/:venueId/propertyConfigs'
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
    url: '/residentPortals'
  }
}
