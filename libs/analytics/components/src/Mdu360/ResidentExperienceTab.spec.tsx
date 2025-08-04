import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ResidentExperienceTab from './ResidentExperienceTab'

jest.mock('./Widgets/ApplicationCategories/services', () => ({
  useTopNApplicationCategoriesQuery: jest.fn().mockReturnValue({ isLoading: false })
}))
jest.mock('./Widgets/WifiClient/services', () => ({
  useTopNWifiClientQuery: jest.fn().mockReturnValue({ isLoading: false })
}))

jest.mock('./Widgets/WifiClient', () => ({
  WifiClient: jest.fn(() => <div>Wi-Fi Client</div>)
}))

jest.mock('./Widgets/WifiGeneration', () => ({
  WifiGeneration: jest.fn(() => <div>Wi-Fi Generation</div>)
}))

jest.mock('./Widgets/TopApplications', () => ({
  TopApplications: jest.fn(() => <div>Top 10 Applications</div>)
}))
jest.mock('./Widgets/TrafficByRadio/services', () => ({
  useTrafficByRadioQuery: jest.fn().mockReturnValue({ isLoading: false })
}))

jest.mock('./services', () => ({
  useClientExperienceTimeseriesQuery: jest.fn().mockReturnValue({ isLoading: false }),
  useSlaThresholdsQuery: jest.fn().mockReturnValue({ isLoading: false }),
  useUpdateSlaThresholdsMutation: jest.fn().mockReturnValue([
    jest.fn(),
    { isLoading: false, isFetching: false }
  ])
}))

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

describe('ResidentExperienceTab', () => {
  afterEach(() => jest.restoreAllMocks())

  it('renders ResidentExperienceTab widgets correctly', async () => {
    render(
      <ResidentExperienceTab
        startDate='2023-02-01T00:00:00.000Z'
        endDate='2023-02-01T00:00:00.000Z'
      />,
      { wrapper: Provider }
    )

    expect(await screen.findByText('Wi-Fi Client')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Generation')).toBeVisible()
    expect(await screen.findByText('Top 10 Applications')).toBeVisible()
    expect(await screen.findByText('Top 10 Application Categories')).toBeVisible()
    expect(await screen.findByText('Traffic By Radio')).toBeVisible()
    expect(await screen.findByText('Client Experience')).toBeVisible()
    expect(await screen.findByText('Service Level Agreement')).toBeVisible()
  })
})