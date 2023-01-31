import { ApiInfo } from '../apiService'

type PropertyUrlType =
  'getPropertyConfigs' |
  'updatePropertyConfigs' |
  'patchPropertyConfigs' |
  'addPropertyUnit' |

  'getPropertyUnitList' |
  'updatePropertyUnit' |
  // 'deletePropertyUnit' |
  'deletePropertyUnits'

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
  getPropertyUnitList: {
    method: 'post',
    url: '/venues/:venueId/units/query'
  },
  updatePropertyUnit: {
    method: 'PATCH',
    url: '/venues/:venueId/units/:unitId'
  },
  // deletePropertyUnit: {
  //   method: 'delete',
  //   url: ''
  // },
  deletePropertyUnits: {
    method: 'delete',
    url: '/venues/:venueId/units'
  }
}
