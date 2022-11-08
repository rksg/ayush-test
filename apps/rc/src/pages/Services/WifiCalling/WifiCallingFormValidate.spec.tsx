import { WifiCallingFormContextType } from '@acx-ui/rc/utils'

import WifiCallingFormValidate from './WifiCallingFormValidate'


describe('WifiCallingFormValidate', () => {
  it('should validate WifiCallingForm content',() => {
    let defaultState = {
      ePDG: [{
        domain: 'aaa.bbb.com',
        ip: '10.10.10.10'
      }],
      qosPriority: 'WIFICALLING_PRI_VOICE',
      description: '',
      serviceName: 'wifiCSP'
    }

    let validateState = WifiCallingFormValidate(defaultState as WifiCallingFormContextType)

    expect(validateState).toEqual({
      serviceName: 'wifiCSP',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      ePDG: [{
        domain: 'aaa.bbb.com',
        ip: '10.10.10.10'
      }],
      epdgs: [
        {
          domain: 'aaa.bbb.com',
          ip: '10.10.10.10'
        }
      ]
    })
  })

  it('should validate WifiCallingForm content with description',() => {
    let defaultState = {
      ePDG: [{
        domain: 'aaa.bbb.com',
        ip: '10.10.10.10'
      }],
      qosPriority: 'WIFICALLING_PRI_VOICE',
      description: 'd',
      serviceName: 'wifiCSP'
    }

    let validateState = WifiCallingFormValidate(defaultState as WifiCallingFormContextType)

    expect(validateState).toEqual({
      serviceName: 'wifiCSP',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      ePDG: [{
        domain: 'aaa.bbb.com',
        ip: '10.10.10.10'
      }],
      epdgs: [
        {
          domain: 'aaa.bbb.com',
          ip: '10.10.10.10'
        }
      ]
    })
  })
})
