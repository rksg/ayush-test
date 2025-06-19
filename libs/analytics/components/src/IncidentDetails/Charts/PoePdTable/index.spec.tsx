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
      </Provider>
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
      </Provider>
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
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = screen.queryByTestId('DownloadOutlined')
    expect(exportButton).not.toBeInTheDocument()
    expect(mockHandleBlobDownloadFile).not.toHaveBeenCalled()
  })
})
