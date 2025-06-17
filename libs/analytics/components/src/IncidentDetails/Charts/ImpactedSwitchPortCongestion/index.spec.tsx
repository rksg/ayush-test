import { fakeIncident1 }                        from '@acx-ui/analytics/utils'
import { fakeIncidentUplinkPortCongestion }     from '@acx-ui/analytics/utils'
import { get }                                  from '@acx-ui/config'
import { dataApiURL, Provider, store, dataApi } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved,
  findTBody, within, fireEvent }            from '@acx-ui/test-utils'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { mockImpactedSwitches, mockImpactedSwitchesWithUnknown } from './__tests__/fixtures'
import { api }                                                   from './services'

import { SwitchDetail, ImpactedSwitchPortConjestionTable } from '.'

describe('SwitchDetails', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1, apCount: 10 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('ICX8200-24P Router')).toBeVisible()

    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('ICX8200')).toBeVisible()

    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('38:45:3B:3C:F1:20')).toBeVisible()

    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findByText('RDR10020_b237')).toBeVisible()
  })
  it('should render empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', {
      data: { incident: { impactedSwitches: [] } } })
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findAllByText('--')).toHaveLength(4)
    expect(screen.queryByText('InformationOutlined')).toBeNull()
  })
})

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils')
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('ImpactedSwitchPortCongestion',()=>{

  describe('ImpactedSwitchPortConjestionTable', () => {
    beforeEach(() => {
      store.dispatch(api.util.resetApiState())
    })

    it('should render for R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(await screen.findByText('Impacted Ports')).toBeVisible()
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('Device 1')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')
    })
    it('should render for R1 with unknown peer device', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitchesWithUnknown)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(1)
      expect(await screen.findByText('Impacted Port')).toBeVisible()
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('-')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')
    })
    it('should render for RA', async () => {
      jest.mocked(get).mockReturnValue('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('Device 1')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')

    })
  })
})

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))

const mockHandleBlobDownloadFile = handleBlobDownloadFile as jest.Mock

const response = {
  incident: {
    impactedSwitches: [{
      name: 'ICX8200-24P Router',
      mac: '38:45:3B:3C:F1:20',
      model: 'ICX8200-24P',
      firmware: 'RDR10020_b237',
      ports: [
        {
          portNumber: '1/1/13',
          connectedDevice: {
            name: 'BRD-DUT1-VK1087',
            mac: '00:11:22:33:44:55'
          }
        },
        {
          portNumber: '1/1/24',
          connectedDevice: {
            name: 'BRD-DUT1-VK1087',
            mac: '00:11:22:33:44:56'
          }
        },
        {
          portNumber: 'LAG1',
          connectedDevice: {
            name: 'Unknown',
            mac: '00:00:00:00:00:00'
          }
        }
      ]
    }]
  }
}

describe('ImpactedSwitchPortConjestionTable', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    jest.clearAllMocks()
  })

  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(body.getByText('1/1/13')).toBeVisible()
    const deviceNames = body.getAllByText('BRD-DUT1-VK1087')
    expect(deviceNames).toHaveLength(2)
    expect(deviceNames[0]).toBeVisible()
  })

  it('should handle CSV export correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton.closest('button')!)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('Impacted-Port-Congestion')
    )
  })

  it('should display LAG ports correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    expect(body.getByText('LAG1 (LAG)')).toBeVisible()
    expect(body.getByText('--')).toBeVisible() // Unknown device name should be displayed as '--'
  })

  it('should handle table sorting', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const portNumberHeader = await screen.findByRole('columnheader', { name: /port number/i })
    fireEvent.click(portNumberHeader)

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    const firstRow = rows[0]
    expect(firstRow).toHaveTextContent('1/1/13')
  })

  it('should handle empty data state', async () => {
    const emptyResponse = {
      incident: {
        impactedSwitches: [{
          name: '',
          mac: '',
          model: '',
          firmware: '',
          ports: []
        }]
      }
    }

    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: emptyResponse })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
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

  it('should handle search functionality', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response })

    render(
      <Provider>
        <ImpactedSwitchPortConjestionTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByPlaceholderText(/search port number/i)
    fireEvent.change(searchInput, { target: { value: '1/1/13' } })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(1)
    expect(body.getByText('1/1/13')).toBeVisible()
  })
})
