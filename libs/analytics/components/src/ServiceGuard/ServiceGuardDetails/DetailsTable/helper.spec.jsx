import { get } from '@acx-ui/config'

import { ClientType } from '../../types'

import { getToolTipText, getTableColumns } from './helper'

const mockGet = get
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('getToolTipText', () => {
  it('should return valid tooltip text for SPEED_TEST_INVALID error', () => {
    expect(
      getToolTipText({
        error: 'SPEED_TEST_INVALID',
        toolTipText: 'test text',
        wlanAuthSettings: {
          wpaVersion: 'WPA2'
        },
        clientType: ClientType.VirtualClient
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
        clientType: ClientType.VirtualClient
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
        clientType: ClientType.VirtualClient
      })
    ).toContain(
      'An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption'
    )
  })

  it('should return fallback message for unmapped errors', () => {
    expect(
      getToolTipText({
        error: 'UNMAPPED_ERROR',
        toolTipText: null
      })
    ).toContain('UNMAPPED_ERROR')
  })
})

describe('getTableColumns', () => {
  const row = {
    apMac: '00:11:22:33:44:55',
    stationAp: {
      mac: '00:11:22:33:44:66'
    }
  }

  it.each([
    {
      isWirelessClient: true,
      expectedTitle: 'Target AP Details',
      isMlisaSa: true,
      expectedPath: 'ai'
    },
    {
      isWirelessClient: false,
      expectedTitle: 'AP Details',
      isMlisaSa: true,
      expectedPath: 'ai'
    },
    {
      isWirelessClient: true,
      expectedTitle: 'Target AP Details',
      isMlisaSa: false,
      expectedPath: 'overview'
    },
    {
      isWirelessClient: false,
      expectedTitle: 'AP Details',
      isMlisaSa: false,
      expectedPath: 'overview'
    }
  ])(
    'should render with title "$expectedTitle" and correct target AP link ' +
    'when IS_MLISA_SA is "$isMlisaSa"',
    ({ isWirelessClient, expectedTitle, isMlisaSa, expectedPath }) => {
      mockGet.mockReturnValueOnce(isMlisaSa)
      const columns = getTableColumns({
        isWirelessClient: isWirelessClient,
        stagesKeys: ['speedTest'],
        wlanAuthSettings: {
          wpaVersion: 'WPA2'
        }
      })
      const targetApColumn = columns[0]
      const { props: { title, to: link } } = targetApColumn.render(null, row)

      expect(title).toBe(expectedTitle)
      expect(link).toBe(`devices/wifi/${row.apMac}/details/${expectedPath}`)
    }
  )

  it('should not render Station AP Details column when isWirelessClient is false', () => {
    const columns = getTableColumns({
      isWirelessClient: false,
      stagesKeys: ['speedTest'],
      wlanAuthSettings: {
        wpaVersion: 'WPA2'
      }
    })
    const stationApColumn = columns.find((column) => column.title === 'Station AP Details')
    expect(stationApColumn).toBeUndefined()
  })

  it.each([
    { isMlisaSa: true, expectedPath: 'ai' },
    { isMlisaSa: false, expectedPath: 'overview' }
  ])(
    'should render correct station AP link when IS_MLISA_SA is "$isMlisaSa"',
    ({ isMlisaSa, expectedPath }) => {
      mockGet.mockReturnValueOnce(isMlisaSa)
      const columns = getTableColumns({
        isWirelessClient: true,
        stagesKeys: ['speedTest'],
        wlanAuthSettings: {
          wpaVersion: 'WPA2'
        }
      })
      const sourceApColumn = columns[2]
      const { props: { title, to: link } } = sourceApColumn.render(null, row)

      expect(title).toBe('Station AP Details')
      expect(link).toBe(
        `devices/wifi/${row.stationAp.mac}/details/${expectedPath}`
      )
    }
  )
})
