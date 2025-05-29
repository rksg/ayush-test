import userEvent        from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { fakeIncident1 }                                               from '@acx-ui/analytics/utils'
import { get }                                                         from '@acx-ui/config'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockImpactedSwitches } from './__tests__/fixtures'
import { api }                  from './services'

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
    expect(await screen.findByText(/Port flap detected at/)).toBeVisible()
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

  it('should format VLANs correctly when 5 or fewer', async () => {
    const mockData = {
      ...mockImpactedSwitches,
      data: {
        incident: {
          impactedSwitches: [{
            ...mockImpactedSwitches.data.incident.impactedSwitches[0],
            ports: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
              flapVlans: '1, 2, 3, 4, 5'
            }]
          }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
    renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('1, 2, 3, 4, 5')).toBeVisible()
  })

  it('should format VLANs correctly when more than 5', async () => {
    const mockData = {
      ...mockImpactedSwitches,
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

    const vlanText = await screen.findByText('1, 2, 3, 4, 5 and more')
    expect(vlanText).toBeVisible()
    await userEvent.hover(vlanText)
    const tooltip = await screen.findByRole('tooltip', { hidden: true })
    expect(tooltip).toHaveTextContent('1, 2, 3, 4, 5, 6, 7, 8')
  })

  it('should handle empty VLAN data', async () => {
    const mockData = {
      ...mockImpactedSwitches,
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

  describe('ImpactedSwitchTable', () => {
    it('should format LAG port numbers correctly', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                portNumber: 'LAG1'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('LAG1 (LAG)')).toBeVisible()
    })

    it('should handle unknown connected device', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                connectedDevice: {
                  name: 'Unknown',
                  type: 'Unknown'
                },
                flapVlans: '1,2,3' // Add some VLANs to avoid the third "--"
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      // Verify both connected device cells show "--"
      const dashCells = await screen.findAllByText('--')
      expect(dashCells).toHaveLength(2)
    })

    it('should format last flap time correctly', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                lastFlapTime: '2024-03-20T10:00:00Z'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const tableCells = await screen.findAllByRole('cell')
      const dateCell = tableCells.find(cell => cell.textContent?.includes('2024'))
      expect(dateCell).toBeTruthy()
      expect(dateCell).toHaveTextContent(/2024/)
    })

    it('should display POE details correctly', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                poeOperState: 'Enabled'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Enabled')).toBeVisible()
    })

    it('should display port status correctly', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [{
                ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                status: 'Up'
              }]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Up')).toBeVisible()
    })

    it('should handle table sorting', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [
                {
                  ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                  portNumber: '1/1/1'
                },
                {
                  ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                  portNumber: '1/1/2'
                }
              ]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      // Find and click the Port Id column header to sort
      const portIdHeader = await screen.findByText('Port Id')
      await userEvent.click(portIdHeader)

      // Verify the table is still visible after sorting
      expect(screen.getByRole('table')).toBeVisible()
    })

    it('should handle table search', async () => {
      const mockData = {
        ...mockImpactedSwitches,
        data: {
          incident: {
            impactedSwitches: [{
              ...mockImpactedSwitches.data.incident.impactedSwitches[0],
              ports: [
                {
                  ...mockImpactedSwitches.data.incident.impactedSwitches[0].ports[0],
                  portNumber: '1/1/1'
                }
              ]
            }]
          }
        }
      }
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockData)
      renderWithRouter(<ImpactedSwitchPortFlapTable incident={fakeIncident1} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      // Find and type in the search input
      const searchInput = await screen.findByPlaceholderText(/Search/)
      await userEvent.type(searchInput, '1/1/1')

      // Verify the table is still visible after search
      expect(screen.getByRole('table')).toBeVisible()
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

      // Verify pagination controls are present
      expect(screen.getByRole('table')).toBeVisible()
      expect(screen.getByText('1')).toBeVisible() // First page
      expect(screen.getByText('2')).toBeVisible() // Second page
    })
  })
})
