import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, DpskUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, screen }                      from '@acx-ui/test-utils'

import {
  networkDeepResponse,
  venueListResponse,
  dpskListResponse,
  partialDpskNetworkEntity,
  mockAAAPolicyListResponse,
  partialDpskNetworkEntity2
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
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
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
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form><DpskSettingsForm /></Form>
        </MLOContext.Provider>
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
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          isRuckusAiMode: false,
          data: partialDpskNetworkEntity,
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
    await userEvent.click(await screen.findByRole('combobox', { name: /DPSK Service/i }))
    await userEvent.click(await screen.findByText('DPSK Service 3'))

    expect(await screen.findByText('Keyboard Friendly')).toBeVisible()
    expect(await screen.findByText('24 Characters')).toBeVisible()
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
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API && ff !== Features.RBAC_SERVICE_POLICY_TOGGLE)
    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: false,
          isRuckusAiMode: false,
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
    expect(screen.getByTestId('enable-auth-proxy')).toBeChecked()
  })

  it('should set dpskProfileId when clone mode', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff !== Features.WIFI_DPSK3_NON_PROXY_MODE_TOGGLE
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: true,
          isRuckusAiMode: true,
          data: { ...partialDpskNetworkEntity2 },
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

    expect(await screen.findByText('DPSK Service 3')).toBeVisible()

    const securityCombo = screen.getByRole('combobox', { name: 'Security Protocol' })
    await userEvent.click(securityCombo)
    await userEvent.click((await screen.findByText('WPA2/WPA3 mixed mode')))

    expect(await screen.findByLabelText('Use the DPSK Service')).toBeChecked()
  })

})
