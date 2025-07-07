import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useIdentityHealthQuery } from './services'

import { IdentityHealth } from '.'

jest.mock('./services', () => ({
  useIdentityHealthQuery: jest.fn()
}))

const mockIdentityHealthData = [
  {
    timeToConnectSLA: [ 5, 10 ] as [number, number] | [null, null],
    clientThroughputSLA: [ 5, 10 ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ 470, 479 ] as [number, number] | [null, null],
    clientThroughputSLA: [ 239, 274 ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ 607, 621 ] as [number, number] | [null, null],
    clientThroughputSLA: [ 135, 157 ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ 1, 10 ] as [number, number] | [null, null],
    clientThroughputSLA: [ 1, 10 ] as [number, number] | [null, null]
  }
]

const mockIdentityHealthNoData = [
  {
    timeToConnectSLA: [ null, null ] as [number, number] | [null, null],
    clientThroughputSLA: [ null, null ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ null, null ] as [number, number] | [null, null],
    clientThroughputSLA: [ null, null ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ null, null ] as [number, number] | [null, null],
    clientThroughputSLA: [ null, null ] as [number, number] | [null, null]
  },
  {
    timeToConnectSLA: [ null, null ] as [number, number] | [null, null],
    clientThroughputSLA: [ null, null ] as [number, number] | [null, null]
  }
]

describe('Identity Health widget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    (useIdentityHealthQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockIdentityHealthData
    })

    render(<IdentityHealth />, { wrapper: Provider })
    expect(await screen.findByText('Identity Health')).toBeVisible()
    expect(await screen.findByText('Time to Connect')).toBeVisible()
    expect(await screen.findByText('63.97%')).toBeVisible()
    expect(await screen.findByText('Client Throughput')).toBeVisible()
    expect(await screen.findByText('58.3%')).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    (useIdentityHealthQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: null
    })

    render(<IdentityHealth />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render no data when data returns null', async () => {
    (useIdentityHealthQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockIdentityHealthNoData
    })

    render(<IdentityHealth />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})