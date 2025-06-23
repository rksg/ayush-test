import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ResidentExperienceTab from './ResidentExperienceTab'

jest.mock('./Widgets/TrafficByRadio/services', () => ({
  useTrafficByRadioQuery: jest.fn().mockReturnValue({ isLoading: false })
}))
jest.mock('./Widgets/WifiClient/services', () => ({
  useTopNWifiClientQuery: jest.fn().mockReturnValue({ isLoading: false })
}))

describe('ResidentExperienceTab', () => {

  it('renders ResidentExperienceTab widgets correctly', async () => {
    render(
      <ResidentExperienceTab
        startDate='2023-02-01T00:00:00.000Z'
        endDate='2023-02-02T00:00:00.000Z'
      />,
      { wrapper: Provider }
    )

    expect(await screen.findByText('Wi-Fi Client')).toBeVisible()
    expect(await screen.findByText('Traffic By Radio')).toBeVisible()
  })

})