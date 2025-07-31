import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'
import { UseQueryResult }            from '@acx-ui/types'

import { useClientExperienceTimeseriesQuery } from '../../services'
import { Mdu360TabProps, SLAKeys }            from '../../types'
import { slaConfig }                          from '../SLA/config'
import { SLAData }                            from '../SLA/types'

import { mockEmptyTimeseriesResponseData, mockTimeseriesResponseData } from './__tests__/fixtures'

import ClientExperience from '.'

const mockUseClientExperienceTimeseriesQuery = useClientExperienceTimeseriesQuery as jest.Mock

jest.mock('../../services', () => ({
  useClientExperienceTimeseriesQuery: jest.fn()
}))

const mockFilters: Mdu360TabProps = {
  startDate: '2024-03-23T07:23:00+05:30',
  endDate: '2025-05-24T07:23:00+05:30'
}

const mockSlaQueryResults = {
  data: {
    [SLAKeys.timeToConnectSLA]: {
      value: 5,
      isSynced: false
    },
    [SLAKeys.clientThroughputSLA]: {
      value: slaConfig[SLAKeys.clientThroughputSLA].defaultValue,
      isSynced: true
    },
    [SLAKeys.channelWidthSLA]: {
      value: 20,
      isSynced: true
    },
    [SLAKeys.channelChangeExperienceSLA]: {
      value: slaConfig[SLAKeys.channelChangeExperienceSLA].defaultValue,
      isSynced: true
    }
  }
} as UseQueryResult<SLAData>

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

describe('ClientExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render client experience SLA correctly', async () => {
    mockUseClientExperienceTimeseriesQuery.mockReturnValue({
      data: mockTimeseriesResponseData
    })

    render(
      <ClientExperience
        filters={mockFilters}
        slaQueryResults={mockSlaQueryResults}
      />,
      { wrapper: Provider }
    )

    expect(screen.getByText('Star Rated')).toBeVisible()
    expect(screen.getByText(/Connection Success/)).toBeVisible()
    expect(screen.getByText(/Wireless Client Throughput/)).toBeVisible()
    expect(screen.getByText(/Time to Connect/)).toBeVisible()
    expect(screen.getAllByText(/1/)).toHaveLength(2) // connection success and ttc
    expect(screen.getAllByText(/5/)).toHaveLength(1) // wireless client throughput
    const dataUsageSwitch = await screen.findByRole('radio', {
      name: 'Sparkline'
    })
    fireEvent.click(dataUsageSwitch)
    expect(screen.getByText('Sparkline')).toBeVisible()
    expect(screen.getByText(/Connection Success/)).toBeVisible()
    expect(screen.getByText(/Wireless Client Throughput/)).toBeVisible()
    expect(screen.getByText(/Time to Connect/)).toBeVisible()
    expect(screen.getAllByText('16%')).toHaveLength(1) // connection success
    expect(screen.getAllByText('15%')).toHaveLength(1) // ttc
    expect(screen.getAllByText('87%')).toHaveLength(1) // wireless client throughput
  })

  it('should return no data when query response is null', async () => {
    mockUseClientExperienceTimeseriesQuery.mockReturnValue({
      data: null
    })

    render(
      <ClientExperience
        filters={mockFilters}
        slaQueryResults={mockSlaQueryResults}
      />,
      {
        wrapper: Provider
      }
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should return no data when query response is empty array', async () => {
    mockUseClientExperienceTimeseriesQuery.mockReturnValue({
      data: mockEmptyTimeseriesResponseData
    })

    render(
      <ClientExperience
        filters={mockFilters}
        slaQueryResults={mockSlaQueryResults}
      />,
      {
        wrapper: Provider
      }
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render threshold values in sparkline view correctly', async () => {
    mockUseClientExperienceTimeseriesQuery.mockReturnValue({
      data: mockTimeseriesResponseData
    })

    render(
      <ClientExperience
        filters={mockFilters}
        slaQueryResults={mockSlaQueryResults}
      />,
      { wrapper: Provider }
    )

    const dataUsageSwitch = await screen.findByRole('radio', {
      name: 'Sparkline'
    })
    fireEvent.click(dataUsageSwitch)
    expect(screen.getByText(/Above 10 Mbps/)).toBeVisible() // wireless client throughput
    expect(screen.getByText('Multiple values')).toBeVisible() // time to connect
  })
})
