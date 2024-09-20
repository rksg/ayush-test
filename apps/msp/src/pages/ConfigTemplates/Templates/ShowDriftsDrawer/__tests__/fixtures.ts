import { TemplateInstanceDriftResponse } from '@acx-ui/rc/utils'

export const mockedDriftResponse: TemplateInstanceDriftResponse = {
  WifiNetwork: {
    '/wlan/advancedCustomization/qosMirroringEnabled': {
      template: true,
      instance: false
    },
    '/wlan/ssid': {
      template: 'raymond-test-int',
      instance: 'nms-raymond-test-int.'
    },
    '/name': {
      template: 'raymond-test-int',
      instance: 'nms-raymond-test-int.'
    }
  },
  RadiusOnWifiNetwork: {
    '/id': {
      template: 'ef3644beccdf48ccb4e8cf3ed296070f',
      instance: 'dc2146381a874d04a824bdd8c7bb991d'
    },
    '/idName': {
      template: 'radius-template-name',
      instance: 'radius-server-name'
    }
  }
}

const maxInstances = 18
const customerNames = [
  'Edu Hotels',
  'Campus Resorts',
  'Premier Lodges',
  'Health Group',
  'Wellness Retreats',
  'Care Hospitals',
  'Scholar Inn',
  'Graduate Services',
  'Learning Lodges',
  'Care Facilities',
  'Wellness Hotels',
  'Stay Centers',
  'Campus Suites',
  'Future Lodging',
  'Healing Hotels',
  'Study & Care',
  'Health Lodges',
  'Life Retreats'
]

export let mockedData: Array<{ id: string, name: string }> = []

for (let i = 0; i < maxInstances; i++) {
  mockedData.push({
    id: `id_${Math.floor(Math.random() * 100000)}`,
    name: customerNames[i]
  })
}
