import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useTrafficQuery } from './services'

import { Traffic } from '.'

jest.mock('./services', () => ({
  useTrafficQuery: jest.fn()
}))

const mockTrafficData = {
  userRxTraffic: 7624302118,
  userTxTraffic: 28432170951
}

describe('Traffic widget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    (useTrafficQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockTrafficData
    })

    render(<Traffic />, { wrapper: Provider })
    expect(await screen.findByText('Traffic')).toBeVisible()
    expect(await screen.findByText('User Traffic')).toBeVisible()
    expect(await screen.findByText('Rx Traffic')).toBeVisible()
    expect(await screen.findByText('7.1 GB')).toBeVisible()
    expect(await screen.findByText('Tx Traffic')).toBeVisible()
    expect(await screen.findByText('26.5 GB')).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    (useTrafficQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: null
    })

    render(<Traffic />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render no data when data returns null or 0', async () => {
    (useTrafficQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        userRxTraffic: null,
        userTxTraffic: 0
      }
    })

    render(<Traffic />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})