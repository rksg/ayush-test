import {
  getToolTipText
} from './helper'
describe('getToolTipText', () => {
  it('should return valid tooltip text for SPEED_TEST_INVALID error', () => {
    expect(
      getToolTipText({
        error: 'SPEED_TEST_INVALID',
        toolTipText: 'test text',
        wlanAuthSettings: {
          wpaVersion: 'WPA2'
        },
        clientType: 'virtual-client'
      })
    ).toEqual('Speed test timeout')
  })
  it('should return valid tooltip text for NO_STATION_AP error', () => {
    expect(
      getToolTipText({
        error: 'NO_STATION_AP',
        toolTipText: 'test text',
        wlanAuthSettings: {
          wpaVersion: 'WPA2'
        },
        clientType: 'virtual-client'
      })
    ).toEqual('Unable to find station AP')
  })

  it('should return valid tooltip text for NO_STATION_AP error with WPA3 version', () => {
    expect(
      getToolTipText({
        error: 'NO_STATION_AP',
        toolTipText: 'test text',
        wlanAuthSettings: {
          wpaVersion: 'WPA3'
        },
        clientType: 'virtual-client'
      })
    ).toContain(
      'An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption'
    )
  })
})