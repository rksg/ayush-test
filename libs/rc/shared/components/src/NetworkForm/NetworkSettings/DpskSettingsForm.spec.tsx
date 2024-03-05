import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, DpskUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, screen }                      from '@acx-ui/test-utils'

import {
  cloudpathResponse,
  networkDeepResponse,
  venueListResponse,
  dpskListResponse,
  partialDpskNetworkEntity,
  mockAAAPolicyListResponse
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { DpskSettingsForm } from './DpskSettingsForm'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  })
}))

describe('DpskSettingsForm', () => {
  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(dpskListResponse))),
      rest.get('/v2/dpskServices',
        (_, res, ctx) => res(ctx.json(dpskListResponse))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse)))
    )
  })

  it('should render DPSK form successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <Form><DpskSettingsForm /></Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render Cloudpath Server form successfully', async () => {
    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <DpskSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    await userEvent.click(screen.getByText('Use RADIUS Server'))
  })

  it('should render edit form with DPSK service profile', async () => {
    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <DpskSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(await screen.findByText('Keyboard Friendly')).toBeVisible()
    expect(await screen.findByText('22 Characters')).toBeVisible()
  })

  it('should display DPSK service detail when select the dropdown list', async () => {
    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <DpskSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    await userEvent.click(await screen.findByRole('combobox', { name: /DPSK Service/i }))
    await userEvent.click(await screen.findByText('DPSK Service 3'))

    expect(await screen.findByText('Keyboard Friendly')).toBeVisible()
    expect(await screen.findByText('24 Characters')).toBeVisible()
    expect(await screen.findByText('2 hours')).toBeVisible()
  })

  it('should open the Add DPSK Service modal', async () => {
    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <DpskSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Add DPSK Service/ }))

    const dialog = await screen.findByRole('dialog', { name: /Add DPSK service/ })
    expect(dialog).toBeVisible()

    const buttons = await screen.findAllByRole('button', { name: /Cancel/, hidden: true })
    await userEvent.click(buttons[1])

    expect(dialog).not.toBeInTheDocument()
  })

  it('should render proxy service', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: false,
          data: { ...partialDpskNetworkEntity, enableAuthProxy: true },
          setData: jest.fn()
        }}>
          <MLOContext.Provider value={{
            isDisableMLO: true,
            disableMLO: jest.fn
          }}>
            <Form>
              <DpskSettingsForm />
            </Form>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      }
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Use RADIUS Server' }))
    expect(screen.getByRole('radio', { name: 'Use RADIUS Server' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Proxy Service' })).toBeChecked()
  })

})
