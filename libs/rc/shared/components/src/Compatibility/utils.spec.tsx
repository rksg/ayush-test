import { ApCompatibility, ApCompatibilityResponse, Compatibility, CompatibilityDeviceEnum, EdgeCompatibilityFeatureEnum, IncompatibilityFeatures, IncompatibleFeatureTypeEnum } from '@acx-ui/rc/utils'

import {
  compatibilityDataGroupByFeatureDeviceType,
  mergeFilterApCompatibilitiesResultByRequiredFeatures
} from './utils'

describe('compatibilityDataGroupByFeatureDeviceType', () => {
  it('should group incompatible features by device type', () => {
    const data: Compatibility = {
      id: 'mock_data',
      incompatible: 1,
      incompatibleFeatures: [
        { featureName: 'Feature A', featureType: IncompatibleFeatureTypeEnum.WIFI },
        { featureName: 'Feature B', featureType: IncompatibleFeatureTypeEnum.WIFI },
        // eslint-disable-next-line max-len
        { featureName: EdgeCompatibilityFeatureEnum.SD_LAN, featureType: IncompatibleFeatureTypeEnum.EDGE }
      ],
      total: 3
    }

    const result = compatibilityDataGroupByFeatureDeviceType(data)

    expect(result).toEqual({
      [CompatibilityDeviceEnum.AP]: [
        { featureName: 'Feature A', featureType: IncompatibleFeatureTypeEnum.WIFI },
        { featureName: 'Feature B', featureType: IncompatibleFeatureTypeEnum.WIFI }
      ],
      [CompatibilityDeviceEnum.EDGE]: [
        // eslint-disable-next-line max-len
        { featureName: EdgeCompatibilityFeatureEnum.SD_LAN, featureType: IncompatibleFeatureTypeEnum.EDGE }
      ]
    })
  })

  it('should handle empty incompatibleFeatures', () => {
    const data: Compatibility = {
      id: 'mock_data',
      incompatible: 0,
      incompatibleFeatures: [],
      total: 0
    }

    const result = compatibilityDataGroupByFeatureDeviceType(data)

    expect(result).toEqual({})
  })

  it('should handle undefined incompatibleFeatures', () => {
    const data: Compatibility = {
      id: 'mock_data',
      incompatible: 0,
      incompatibleFeatures: undefined,
      total: 0
    }
    const result = compatibilityDataGroupByFeatureDeviceType(data)

    expect(result).toEqual({})
  })
})


describe('mergeFilterApCompatibilitiesResultByRequiredFeatures', () => {
  it('should return an object with incompatibleFeatures filtered by requiredFeatures', () => {
    const results: ApCompatibilityResponse[] = [{
      apCompatibilities: [
        {
          id: 'id1',
          incompatibleFeatures: [
            { featureName: 'feature1', requiredFw: '1.0.0' },
            { featureName: 'feature2', requiredFw: '1.0.0' }
          ],
          incompatible: 2,
          total: 3
        }
      ]
    }, {
      apCompatibilities: [
        {
          id: 'id1',
          incompatibleFeatures: [
            { featureName: 'feature3', requiredFw: '1.0.0' },
            { featureName: 'feature5', requiredFw: '1.0.0' }
          ],
          incompatible: 3,
          total: 3
        }
      ]
    }]
    const requiredFeatures = ['feature1', 'feature3'] as IncompatibilityFeatures[]
    const expected: ApCompatibility = {
      id: 'id1',
      incompatible: 3,
      total: 3,
      incompatibleFeatures: [
        { featureName: 'feature1', requiredFw: '1.0.0' },
        { featureName: 'feature3', requiredFw: '1.0.0' }
      ]
    }

    const result = mergeFilterApCompatibilitiesResultByRequiredFeatures(results, requiredFeatures)

    expect(result).toEqual(expected)
  })
})