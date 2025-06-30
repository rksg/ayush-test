import '@testing-library/jest-dom'

import { fakeIncidentPoePd }                                                      from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, store }                                            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { handleBlobDownloadFile }                                                 from '@acx-ui/utils'

import { impactedApi, Response } from './services'

import { PoePdTable } from '.'

export const response = {
  incident: {
    impactedEntities: [
      {
        name: 'ICX7550-48ZP Router',
        mac: '28:B3:71:29:8C:B6',
        serial: 'one',
        ports: [
          {
            portNumber: '1/1/1',
            metadata: '{"timestamp":1665817971541}'
          },
          {
            portNumber: '1/1/2',
            metadata: '{"timestamp":1665817987689}'
          },
          {
            portNumber: '1/1/1',
            metadata: '{"timestamp":1665818267535}'
          },
          {
            portNumber: '1/1/4',
            metadata: '{"timestamp":1665818333534}'
          },
          {
            portNumber: '1/1/5',
            metadata: '{"timestamp":1665818403526}'
          },
          {
            portNumber: '1/1/13',
            metadata: '{"timestamp":1665818821671}'
          }
        ]
      }
    ]
  }
} as Response

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))

const mockHandleBlobDownloadFile = handleBlobDownloadFile as jest.Mock

describe('PoeLowTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
    jest.clearAllMocks()
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const row1 = (await screen.findAllByRole('row'))[1]
    expect(row1.textContent).toMatch(/ICX7550-48ZP Router/)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/undefined/t/devices/switch/28:b3:71:29:8c:b6/one/details/overview'
    )
  })

  it('should handle CSV export correctly when multiple switches are present', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switches')
    )
  })

  it('should handle CSV export correctly when a single switch is present', async () => {
    const singleSwitchResponse = {
      incident: {
        impactedEntities: [
          {
            name: 'ICX7550-48ZP Router',
            mac: '28:B3:71:29:8C:B6',
            serial: 'one',
            ports: [
              {
                portNumber: '1/1/1',
                metadata: '{"timestamp":1665817971541}'
              }
            ]
          }
        ]
      }
    } as Response

    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: singleSwitchResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switch')
    )
  })

  it('should not export CSV when data is empty', async () => {
    const emptyResponse = {
      incident: { impactedEntities: [] }
    }
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: emptyResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
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

  it('should export CSV with -- for falsy values (branch coverage)', async () => {
    const falsyDataResponse = {
      incident: {
        impactedEntities: [
          {
            name: null,
            mac: 'AA:BB:CC:DD:EE:FF',
            serial: '',
            ports: [
              {
                portNumber: null,
                metadata: '{"timestamp":1665817971541}'
              }
            ]
          }
        ]
      }
    } as unknown as Response

    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: falsyDataResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switch')
    )

    // Verify CSV content contains -- for falsy values
    const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
    const csvContent = await new globalThis.Response(blob).text()
    const rows = csvContent.split('\n')
    expect(rows[1]).toContain('--') // Should contain -- for falsy values
  })

  it('should export CSV with actual values for truthy values (branch coverage)', async () => {
    const truthyDataResponse = {
      incident: {
        impactedEntities: [
          {
            name: 'Test Switch',
            mac: 'AA:BB:CC:DD:EE:FF',
            serial: 'TEST123',
            ports: [
              {
                portNumber: '1/1/1',
                metadata: '{"timestamp":1665817971541}'
              }
            ]
          }
        ]
      }
    } as Response

    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: truthyDataResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switch')
    )

    // Verify CSV content contains actual values
    const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
    const csvContent = await new globalThis.Response(blob).text()
    const rows = csvContent.split('\n')
    expect(rows[1]).toContain('Test Switch') // Should contain actual name
    expect(rows[1]).toContain('AA:BB:CC:DD:EE:FF') // Should contain actual MAC
    expect(rows[1]).toContain('1/1/1') // Should contain actual port number
    expect(rows[1]).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Should contain formatted event time
  })

  it('should export CSV with mixed truthy and falsy values (branch coverage)', async () => {
    const mixedDataResponse = {
      incident: {
        impactedEntities: [
          {
            name: 'Test Switch',
            mac: 'AA:BB:CC:DD:EE:FF',
            serial: 'TEST123',
            ports: [
              {
                portNumber: undefined,
                metadata: '{"timestamp":1665817971541}'
              }
            ]
          }
        ]
      }
    } as unknown as Response

    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: mixedDataResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switch')
    )

    // Verify CSV content contains both actual values and -- for falsy values
    const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
    const csvContent = await new globalThis.Response(blob).text()
    const rows = csvContent.split('\n')
    expect(rows[1]).toContain('Test Switch') // Should contain actual name
    expect(rows[1]).toContain('--') // Should contain -- for null/undefined values
    expect(rows[1]).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Should contain formatted event time
  })

  it('should handle eventTime formatting correctly in CSV export (branch coverage)', async () => {
    const eventTimeDataResponse = {
      incident: {
        impactedEntities: [
          {
            name: 'Test Switch',
            mac: 'AA:BB:CC:DD:EE:FF',
            serial: 'TEST123',
            ports: [
              {
                portNumber: '1/1/1',
                metadata: '{"timestamp":1665817971541}'
              }
            ]
          }
        ]
      }
    } as Response

    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: eventTimeDataResponse })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('PoE-Impacted-Switch')
    )

    // Verify CSV content contains formatted event time
    const blob = mockHandleBlobDownloadFile.mock.calls[0][0]
    const csvContent = await new globalThis.Response(blob).text()
    const rows = csvContent.split('\n')
    // The eventTime should be formatted and not be '--' since it's a valid timestamp
    expect(rows[1]).not.toContain('--') // Should not contain -- for eventTime
    expect(rows[1]).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Should contain formatted date
  })
})
