import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { networklist, networksApCompatibilities } from './__tests__/fixtures'

import useNetworksTable from '.'

jest.mock('socket.io-client')


describe('Networks Table', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(networklist))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetwork.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(networksApCompatibilities))
      )
    )
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render page correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const Component = () => {
      const { component } = useNetworksTable()
      return component
    }

    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('network-01 (SSID: 01)')).toBeVisible()
    expect(await screen.findByRole('row', { name: /network-10/i })).toBeVisible()

  })

  it('should render title with count correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const Title = () => {
      const { title } = useNetworksTable()
      return <span>{title}</span>
    }
    render(<Title/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Network List (10)')).toBeVisible()
  })

  it('should render page ap compatibility correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const Component = () => {
      const { component } = useNetworksTable()
      return component
    }

    render(<Component/>, { wrapper: Provider, route: {} })

    const row = await screen.findByRole('row', { name: /network-01/i })
    const icon = await within(row).findByTestId('InformationSolid')
    expect(icon).toBeVisible()
  })

  it.skip('should render extra header correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const Component = () => {
      const { headerExtra } = useNetworksTable()
      return headerExtra[0]
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Add Wi-Fi Network')).toBeVisible()
  })
})
