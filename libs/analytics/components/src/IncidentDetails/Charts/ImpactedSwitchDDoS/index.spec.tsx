import { fakeIncidentDDoS, overlapsRollup }              from '@acx-ui/analytics/utils'
import { get }                                           from '@acx-ui/config'
import { dataApi, dataApiURL, Provider, store }          from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render,
  within, screen, fireEvent, waitForElementToBeRemoved }       from '@acx-ui/test-utils'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { ImpactedSwitch } from '../ImpactedSwitchesTable/services'

import { ImpactedSwitchDDoSTable } from '.'

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

describe('ImpactedSwitchDDoS', () => {
  const sample1: ImpactedSwitch[] = [{
    name: 'ICX7150-C12 Router',
    mac: '58:FB:96:0B:12:CA',
    serial: 'FEK3215S0H7',
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
    ports: [
      {
        portNumber: '1/1/1'
      },
      {
        portNumber: '1/1/23'
      }
    ]
  }]

  const response = (data: ImpactedSwitch[] = [...sample1]) => ({
    incident: {
      impactedSwitches: data,
      switchCount: 5
    }
  })

  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    jest.clearAllMocks()
  })

  it('should render table with switch data', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('58:FB:96:0B:12:CA')
    expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('1/1/1, 1/1/23')
  })

  it('should handle CSV export', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('impacted-switch-ddos')
    )
  })

  it('should copy port numbers to clipboard', async () => {
    const writeText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    fireEvent.click(within(rows[0]).getByTestId('CopyOutlined'))
    expect(writeText).toHaveBeenCalledWith('1/1/1')
    fireEvent.click(within(rows[1]).getByTestId('CopyOutlined'))
    expect(writeText).toHaveBeenCalledWith('1/1/1, 1/1/23')
  })

  it('should handle table sorting', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const macHeader = await screen.findByRole('columnheader', { name: /switch mac/i })
    fireEvent.click(macHeader)

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    const firstRow = rows[0]
    expect(firstRow).toHaveTextContent('58:FB:96:0B:12:CA')
  })

  it('should handle search functionality', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByPlaceholderText(/search switch name/i)
    fireEvent.change(searchInput, { target: { value: 'ICX7150' } })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(1)
    const switchNames = body.getAllByText((content, element) => {
      return element?.textContent?.includes('ICX7150-C12 Router') ?? false
    })
    expect(switchNames[0]).toBeVisible()
  })

  it('should handle empty data state', async () => {
    const emptyResponse = {
      incident: {
        impactedSwitches: [],
        switchCount: 0
      }
    }

    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: emptyResponse })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveClass('ant-table-placeholder')
  })

  it('should handle system cluster incidents', async () => {
    jest.mocked(get).mockReturnValue('true')
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('58:FB:96:0B:12:CA')
    expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('1/1/1, 1/1/23')
  })

  it('should hide table when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
    render(
      <Provider>
        <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
