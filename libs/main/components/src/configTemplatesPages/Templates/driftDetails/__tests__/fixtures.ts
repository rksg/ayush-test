import { ConfigTemplateDriftsResponse } from '@acx-ui/rc/utils'

export const mockedDriftResponse: ConfigTemplateDriftsResponse = [
  {
    diffName: 'WifiNetwork',
    diffData: [
      {
        path: '/wlan/advancedCustomization/qosMirroringEnabled',
        data: {
          template: true,
          instance: false
        }
      },
      {
        path: '/wlan/ssid',
        data: {
          template: 'test-int',
          instance: 'nms-test-int'
        }
      },
      {
        path: '/name',
        data: {
          template: 'raymond-test-int',
          instance: 'nms-raymond-test-int'
        }
      }
    ]
  },
  {
    diffName: 'RadiusOnWifiNetwork',
    diffData: [
      {
        path: '/id',
        data: {
          template: 'ef3644beccdf48ccb4e8cf3ed296070f',
          instance: 'dc2146381a874d04a824bdd8c7bb991d'
        }
      },
      {
        path: '/idName',
        data: {
          template: 'radius-template-name',
          instance: 'radius-server-name'
        }
      }
    ]
  }
]
