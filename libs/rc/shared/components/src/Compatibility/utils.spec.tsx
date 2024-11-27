import { Compatibility, CompatibilityDeviceEnum, EdgeCompatibilityFeatureEnum, IncompatibleFeatureTypeEnum } from '@acx-ui/rc/utils'

import { compatibilityDataGroupByFeatureDeviceType } from './utils'

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