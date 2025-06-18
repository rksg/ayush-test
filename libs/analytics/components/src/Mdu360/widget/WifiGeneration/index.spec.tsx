import { dataApiURL, Provider, store }                 from '@acx-ui/store'
import { fireEvent, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedWifiGeneration } from './__tests__/fixtures'
import { api }                  from './services'

import { WifiGeneration, tooltipValuesFunc } from '.'

const start = '2024-01-01T00:00:00Z'
const end = '2024-01-02T00:00:00Z'

describe('WifiGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render data correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            apWifiCapabilityDistribution: mockedWifiGeneration
          }
        }
      }
    })

    render(<WifiGeneration startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Generation')).toBeVisible()
    expect(await screen.findByText('Distribution')).toBeVisible()
    expect(await screen.findByText('Upgrade Opportunity')).toBeVisible()
    expect(await screen.findByText('Non Wi-Fi 6/6E AP:')).toBeVisible()
    const opportunity = await screen.findByRole('radio', { name: 'Upgrade Opportunity' })
    fireEvent.click(opportunity)
    expect(await screen.findByText(/older-generation access points/)).toBeVisible()
  })

  it('should render no older ap correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            apWifiCapabilityDistribution: [mockedWifiGeneration[0], mockedWifiGeneration[1]]
          }
        }
      }
    })

    render(<WifiGeneration startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Generation')).toBeVisible()
    expect(await screen.findByText('Distribution')).toBeVisible()
    expect(await screen.findByText('Upgrade Opportunity')).toBeVisible()
    expect(await screen.findByText('Non Wi-Fi 6/6E AP:')).toBeVisible()
    const opportunity = await screen.findByRole('radio', { name: 'Upgrade Opportunity' })
    fireEvent.click(opportunity)
    expect(await screen.findByText(/the latest and greatest APs in your network/)).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: { }
        }
      }
    })
    render(<WifiGeneration startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render tooltipValuesFunc correct', async () => {
    const distributionData = {
      aaa: {
        apCount: 20,
        clientDistribution: {
          aaa: 13,
          bbb: 7
        }
      }
    }
    const result = tooltipValuesFunc(distributionData)('aaa')
    expect(result).toHaveProperty('values')
    expect(result.values).toHaveLength(2)
  })
})