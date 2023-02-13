import { ApiInfo } from '../apiService'

type PropertyUrlType =
  'getPropertyConfigs' |
  'updatePropertyConfigs' |
  'patchPropertyConfigs' |
  'addPropertyUnit' |

  'getUnitById' |
  'getPropertyUnitList' |
  'updatePropertyUnit' |
  'deletePropertyUnits' |
  'getResidentPortalList'

export const PropertyUrlsInfo: { [key in PropertyUrlType]: ApiInfo } = {
  getPropertyConfigs: {
    method: 'get',
    url: '/venues/:venueId/propertyConfigs'
  },
  updatePropertyConfigs: {
    method: 'put',
    url: '/venues/:venueId/propertyConfigs'
  },
  patchPropertyConfigs: {
    method: 'PATCH',
    url: '/venues/:venueId/propertyConfigs'
  },
  addPropertyUnit: {
    method: 'post',
    url: '/venues/:venueId/units'
  },

  // TODO: Not integration test
  getUnitById: {
    method: 'get',
    url: '/venues/:venueId/units/:unitId'
  },
  getPropertyUnitList: {
    method: 'post',
    url: '/venues/:venueId/units/query'
  },
  updatePropertyUnit: {
    method: 'PATCH',
    url: '/venues/:venueId/units/:unitId'
  },
  deletePropertyUnits: {
    method: 'delete',
    url: '/venues/:venueId/units'
  },
  getResidentPortalList: {
    method: 'get',
    url: '/residentPortals'
  }
}
