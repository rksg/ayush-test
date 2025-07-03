import { fakeIncidentLLDPStatus, overlapsRollup }        from '@acx-ui/analytics/utils'
import { get }                                           from '@acx-ui/config'
import { dataApi, dataApiURL, Provider, store }          from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render,
  within, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { ImpactedSwitch } from '../ImpactedSwitchesTable/services'

import { ImpactedSwitchLLDPTable } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))

const mockOverlapsRollup = overlapsRollup as jest.Mock
const mockHandleBlobDownloadFile = handleBlobDownloadFile as jest.Mock

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('ImpactedSwitchLLDP',()=>{
  const sample1:ImpactedSwitch[] = [{
    name: 'ICX7150-C12 Router',
    mac: '58:FB:96:0B:12:CA',
    serial: 'FEK3215S0H7',
    reasonCodes: 'LLDP Disabled',
    ports: [
      {
        portNumber: '1/1/1'
      }
    ]
  },
  {
    name: 'ICX7650-48ZP Router',
    mac: 'D4:C1:9E:14:C3:99',
    serial: 'EZC3307P01H',
    reasonCodes: 'LLDP Disabled',
    ports: [
      {
        portNumber: '1/1/1'
      },
      {
        portNumber: '1/1/23'
      },
      {
        portNumber: '1/1/1'
      }
    ]
  }
  ]

  const sample2:ImpactedSwitch[] = [{
    name: 'ICX7150-C12 Router',
    mac: '58:FB:96:0B:12:CA',
    serial: 'FEK3215S0H7',
    reasonCodes: 'LLDP Disabled',
    ports: [
      {
        portNumber: ''
      }
    ]
  }
  ]

  const response = (data: ImpactedSwitch[] = [
    ...sample1
  ]) => ({
    incident: {
      impactedSwitches: data,
      switchCount: 5
    }
  })

  const response2 = (data: ImpactedSwitch[] = [
    ...sample2
  ]) => ({
    incident: {
      impactedSwitches: data,
      switchCount: 5
    }
  })

  describe('ImpactedSwitchDDoSTable', () => {
    beforeEach(() => {
      store.dispatch(dataApi.util.resetApiState())
      jest.clearAllMocks()
    })
    it('should render for R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('FEK3215S0H7')
      expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('LLDP Disabled')
    })
    it('should copy the port numbers to clipboard', async () => {
      const writeText = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText
        }
      })
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(<Provider><ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      fireEvent.click(within(rows[0]).getByTestId('CopyOutlined'))
      expect(writeText).toHaveBeenCalledWith('1/1/1')
      fireEvent.click(within(rows[1]).getByTestId('CopyOutlined'))
      expect(writeText).toHaveBeenCalledWith('1/1/1, 1/1/23')
    })
    it('should render for RA', async () => {
      jest.mocked(get).mockReturnValue('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('FEK3215S0H7')
      expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('LLDP Disabled')

    })
    it('should hide table when under druidRollup', async () => {
      jest.mocked(mockOverlapsRollup).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(<Provider><ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })
      await screen.findByText('Data granularity at this level is not available')
      jest.mocked(mockOverlapsRollup).mockReturnValue(false)
    })

    it('should return an empty string if portNumbers is not a string', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response2() })

      render(<Provider><ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')

      // Check that the portNumbers column renders an empty string
      const portNumbersCell = within(rows[0]).getAllByRole('cell')[4]
      expect(portNumbersCell.textContent).toBe('  ')
    })

    it('should handle CSV export correctly when data is present (multiple switches)', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = await screen.findByTestId('DownloadOutlined')
      fireEvent.click(exportButton)

      expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('LLDP-Status-Impacted-Switches')
      )
    })

    it('should handle CSV export correctly when data is empty (only headers)', async () => {
      const emptyResponse = {
        incident: {
          impactedSwitches: [],
          switchCount: 0
        }
      }

      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: emptyResponse })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = screen.queryByTestId('DownloadOutlined')
      expect(exportButton).not.toBeInTheDocument()
      expect(mockHandleBlobDownloadFile).not.toHaveBeenCalled()
    })

    it('should handle CSV export correctly when data has single switch', async () => {
      const singleSwitchResponse = {
        incident: {
          impactedSwitches: [sample1[0]]
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: singleSwitchResponse })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = await screen.findByTestId('DownloadOutlined')
      fireEvent.click(exportButton)

      expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('LLDP-Status-Impacted-Switch')
      )
    })

    it('should export CSV with -- for falsy values (branch coverage)', async () => {
      const falsyDataResponse = {
        incident: {
          impactedSwitches: [{
            name: null,
            mac: undefined,
            serial: '',
            reasonCodes: null,
            ports: [
              {
                portNumber: '1/1/1'
              }
            ]
          }]
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: falsyDataResponse })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = await screen.findByTestId('DownloadOutlined')
      fireEvent.click(exportButton)

      expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('LLDP-Status-Impacted-Switch')
      )

      // Verify CSV content contains -- for falsy values
      const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
      const csvContent = await new Response(blob).text()
      const rows = csvContent.split('\n')
      expect(rows[1]).toContain('--') // Should contain -- for falsy values
    })

    it('should export CSV with actual values for truthy values (branch coverage)', async () => {
      const truthyDataResponse = {
        incident: {
          impactedSwitches: [{
            name: 'Test Switch',
            mac: 'AA:BB:CC:DD:EE:FF',
            serial: 'TEST123',
            reasonCodes: 'LLDP Enabled',
            ports: [
              {
                portNumber: '1/1/1'
              }
            ]
          }]
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: truthyDataResponse })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = await screen.findByTestId('DownloadOutlined')
      fireEvent.click(exportButton)

      expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('LLDP-Status-Impacted-Switch')
      )

      // Verify CSV content contains actual values
      const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
      const csvContent = await new Response(blob).text()
      const rows = csvContent.split('\n')
      expect(rows[1]).toContain('Test Switch') // Should contain actual name
      expect(rows[1]).toContain('AA:BB:CC:DD:EE:FF') // Should contain actual MAC
      expect(rows[1]).toContain('TEST123') // Should contain actual serial
      expect(rows[1]).toContain('LLDP Enabled') // Should contain actual reason codes
    })

    it('should export CSV with mixed truthy and falsy values (branch coverage)', async () => {
      const mixedDataResponse = {
        incident: {
          impactedSwitches: [{
            name: 'Test Switch',
            mac: null,
            serial: 'TEST123',
            reasonCodes: undefined,
            ports: [
              {
                portNumber: '1/1/1'
              }
            ]
          }]
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: mixedDataResponse })
      render(
        <Provider>
          <ImpactedSwitchLLDPTable incident={fakeIncidentLLDPStatus} />
        </Provider>
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const exportButton = await screen.findByTestId('DownloadOutlined')
      fireEvent.click(exportButton)

      expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('LLDP-Status-Impacted-Switch')
      )

      // Verify CSV content contains both actual values and -- for falsy values
      const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
      const csvContent = await new Response(blob).text()
      const rows = csvContent.split('\n')
      expect(rows[1]).toContain('Test Switch') // Should contain actual name
      expect(rows[1]).toContain('--') // Should contain -- for null/undefined values
      expect(rows[1]).toContain('TEST123') // Should contain actual serial
    })
  })
})
