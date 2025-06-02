import userEvent        from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { fakeIncident1 }                                               from '@acx-ui/analytics/utils'
import { get }                                                         from '@acx-ui/config'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockImpactedSwitches, mockImpactedSwitchesWithUnknown } from './__tests__/fixtures'
import { api }                                                   from './services'

import { SwitchDetail, ImpactedSwitchPortFlapTable } from '.'

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

  it('should render correctly with port count', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1, apCount: 10 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('ICX8200-24P Router')).toBeVisible()
    expect(await screen.findByText('Ports with flap')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible() // portCount
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
    expect(await screen.findByText('Number of ports')).toBeVisible()
    expect(await screen.findByText('Ports with flap')).toBeVisible()
    expect(screen.getAllByText('--')).toHaveLength(6)
  })
})

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils')
}))
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('ImpactedSwitchPortFlap', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.clearAllMocks()
    jest.mocked(get).mockReset()
  })

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <Provider>
          {ui}
        </Provider>
      </MemoryRouter>
    )
  }

  it('should render correctly with basic data', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Impacted Ports')).toBeVisible()
    expect(await screen.findByText(/Port flap detected in/)).toBeVisible()
    expect(await screen.findByText('ICX8200-24P Router')).toBeVisible()
  })

  it('should handle single port correctly', async () => {
    const mockData = {
      ...mockImpactedSwitches,
      data: {
        incident: {
          impactedSwitches: [{
            ...mockImpactedSwitches.data.incident.impactedSwitches[0],
            ports: [mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0]]
          }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Impacted Port')).toBeVisible()
  })

  it('should format LAG port numbers correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('LAG1')).toBeVisible()
  })

  it('should handle unknown connected device', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitchesWithUnknown)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Verify both connected device cells show "--"
    const dashCells = await screen.findAllByText('--')
    expect(dashCells).toHaveLength(2)
  })

  describe('VLAN formatting', () => {
    it('should display empty VLAN as --', async () => {
      const mockData = {
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                flapVlans: ''
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('--')).toBeVisible()
    })

    it('should display up to 5 VLANs without truncation', async () => {
      const mockData = {
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                flapVlans: '1,2,3,4,5'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('1,2,3,4,5')).toBeVisible()
    })

    it('should truncate more than 5 VLANs with tooltip', async () => {
      const mockData = {
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                flapVlans: '1, 2, 3, 4, 5, 6, 7, 8'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const truncatedText = await screen.findByText('1, 2, 3, 4, 5 and more')
      expect(truncatedText).toBeVisible()
      await userEvent.hover(truncatedText)
      expect(await screen.findByRole('tooltip', { hidden: true }))
        .toHaveTextContent('1, 2, 3, 4, 5, 6, 7, 8')
    })
  })

  describe('PoE state handling', () => {
    it('should display PoE state correctly', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Enabled')).toBeVisible()
    })

    it('should display -- for Unknown PoE state', async () => {
      const mockData = {
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                poeOperState: 'Unknown'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('--')).toBeVisible()
    })
  })

  it('should handle table sorting', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const portIdHeader = await screen.findByText('Port Id')
    await userEvent.click(portIdHeader)
    const cells = await screen.findAllByRole('cell')
    const portNumbers = cells.filter(cell =>
      cell.textContent === 'LAG1' || cell.textContent === '2/1/20'
    )
    expect(portNumbers[0]).toHaveTextContent('2/1/20')
    expect(portNumbers[1]).toHaveTextContent('LAG1')
  })

  it('should handle table search', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByPlaceholderText(/Search Port Id/)
    await userEvent.type(searchInput, 'LAG1')
    expect(await screen.findByText('LAG1')).toBeVisible()
    expect(screen.queryByText('2/1/20')).not.toBeInTheDocument()
  })

  it('should handle table pagination', async () => {
    const mockData = {
      ...mockImpactedSwitches,
      data: {
        incident: {
          impactedSwitches: [{
            ...mockImpactedSwitches.data.incident.impactedSwitches[0],
            ports: Array(10).fill(mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0])
          }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(6) // Header + 5 rows per page
  })

  describe('MLISA paths', () => {
    it('should handle non-MLISA path correctly', async () => {
      jest.mocked(get).mockImplementation((key: string) => {
        if (key === 'IS_MLISA_SA') {
          return 'false'
        }
        return ''
      })
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const nonMlisaLink = await screen.findByRole('link', { name: 'ICX8200-24P Router' })
      expect(nonMlisaLink).toHaveAttribute('href', expect.stringContaining('/overview'))
    })

    it('should handle MLISA path correctly', async () => {
      jest.mocked(get).mockImplementation((key: string) => {
        if (key === 'IS_MLISA_SA') {
          return 'true'
        }
        return ''
      })
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const mlisaLink = await screen.findByRole('link', { name: 'ICX8200-24P Router' })
      expect(mlisaLink).toHaveAttribute('href', expect.stringContaining('/reports'))
    })
  })
})
