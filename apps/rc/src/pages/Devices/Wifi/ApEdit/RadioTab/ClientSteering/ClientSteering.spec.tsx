import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { venueApi, apApi }                from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApRadioContext }               from '..'
import { ApEditContextType }            from '../..'
import { ApEditContext, ApDataContext } from '../..'

import {
  VenueLoadBalancingSettings_LoadBalanceOn,
  VenueLoadBalancingSettings_LoadBalanceOff,
  StickyClientSteeringSettings_VenueSettingOn,
  StickyClientSteeringSettings_VenueSettingOff,
  ApCapabilities_SupportOn,
  ApCapabilities_SupportOff,
  ApDeep,
  Venue
} from './__tests__/fixture'
import { ClientSteering } from './ClientSteering'

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  activeTab: 'edit',
  activeSubTab: 'radio'
}

const { result: formRef } = renderHook(() => {
  const [ form ] = Form.useForm()
  return form
})

describe('Ap Client Steering', () => {

  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
  })

  it('Custom Settings - All on', async () => {

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(VenueLoadBalancingSettings_LoadBalanceOn))),
      rest.get(
        WifiRbacUrlsInfo.getApStickyClientSteering.url,
        (_, res, ctx) => res(ctx.json(StickyClientSteeringSettings_VenueSettingOff)))
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: 'Radio',
            isDirty: false
          } as ApEditContextType,
          setEditContextData: jest.fn(),
          editRadioContextData: {} as ApRadioContext,
          setEditRadioContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApDeep,
            apCapabilities: ApCapabilities_SupportOn,
            venueData: Venue
          }}>
            <Form>
              <ClientSteering />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:serialNumber/activeTab/activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(/Custom settings/)
    const customizeToggle = await screen.findByText(/Use Venue Settings/)

    // eslint-disable-next-line max-len
    expect(await screen.findByTestId('sticky-client-steering-enabled')).toBeInTheDocument()
    expect(await screen.findByTestId('sticky-client-snr-threshold')).toBeInTheDocument()
    expect(await screen.findByTestId('sticky-client-nbr-percentage-threshold')).toBeInTheDocument()

    await userEvent.click(customizeToggle)

    // eslint-disable-next-line max-len
    expect(await screen.findByTestId('sticky-client-steering-enabled-read-only')).toBeInTheDocument()
    expect(await screen.findByTestId('sticky-client-snr-threshold')).toBeDisabled()
    expect(await screen.findByTestId('sticky-client-nbr-percentage-threshold')).toBeDisabled()
  })

  it('Custom Settings - LoadBalance Off', async () => {

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(VenueLoadBalancingSettings_LoadBalanceOff))),
      rest.get(
        WifiRbacUrlsInfo.getApStickyClientSteering.url,
        (_, res, ctx) => res(ctx.json(StickyClientSteeringSettings_VenueSettingOff)))
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: 'Radio',
            isDirty: false
          } as ApEditContextType,
          setEditContextData: jest.fn(),
          editRadioContextData: {} as ApRadioContext,
          setEditRadioContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApDeep,
            apCapabilities: ApCapabilities_SupportOn,
            venueData: Venue
          }}>
            <Form form={formRef.current}>
              <ClientSteering />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:serialNumber/activeTab/activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(/My-Venue/)
    await screen.findByText(/Customize/)

    await waitFor(async () => {
      expect(await screen.findByTestId('sticky-client-steering-enabled')).toBeDisabled()
    })

    expect(screen.queryByTestId('sticky-client-snr-threshold')).not.toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.queryByTestId('sticky-client-nbr-percentage-threshold')).not.toBeInTheDocument()
  })

  it('Custom Settings - Ap Capabilities supportApStickyClientSteering Off', async () => {

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(VenueLoadBalancingSettings_LoadBalanceOn))),
      rest.get(
        WifiRbacUrlsInfo.getApStickyClientSteering.url,
        (_, res, ctx) => res(ctx.json(StickyClientSteeringSettings_VenueSettingOff)))
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: 'Radio',
            isDirty: false
          } as ApEditContextType,
          setEditContextData: jest.fn(),
          editRadioContextData: {} as ApRadioContext,
          setEditRadioContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApDeep,
            apCapabilities: ApCapabilities_SupportOff,
            venueData: Venue
          }}>
            <Form form={formRef.current}>
              <ClientSteering />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:serialNumber/activeTab/activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(/My-Venue/)
    await screen.findByText(/Customize/)

    await waitFor(async () => {
      expect(await screen.findByTestId('sticky-client-steering-enabled')).toBeDisabled()
    })

    expect(screen.queryByTestId('sticky-client-snr-threshold')).not.toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.queryByTestId('sticky-client-nbr-percentage-threshold')).not.toBeInTheDocument()
  })

  it('Venue Setting', async () => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(VenueLoadBalancingSettings_LoadBalanceOn))),
      rest.get(
        WifiRbacUrlsInfo.getApStickyClientSteering.url,
        (_, res, ctx) => res(ctx.json(StickyClientSteeringSettings_VenueSettingOn)))
    )
    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: 'Radio',
            isDirty: false
          } as ApEditContextType,
          setEditContextData: jest.fn(),
          editRadioContextData: {} as ApRadioContext,
          setEditRadioContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApDeep,
            apCapabilities: ApCapabilities_SupportOn,
            venueData: Venue
          }}>
            <Form>
              <ClientSteering />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:serialNumber/activeTab/activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(/My-Venue/)
    const customizeToggle = await screen.findByText(/Customize/)
    // eslint-disable-next-line max-len
    expect(await screen.findByTestId('sticky-client-steering-enabled-read-only')).toBeInTheDocument()
    expect(await screen.findByTestId('sticky-client-snr-threshold')).toBeDisabled()
    expect(await screen.findByTestId('sticky-client-nbr-percentage-threshold')).toBeDisabled()

    await userEvent.click(customizeToggle)

    expect(await screen.findByTestId('sticky-client-steering-enabled')).toBeInTheDocument()
    expect(await screen.findByTestId('sticky-client-snr-threshold')).not.toBeDisabled()
    expect(await screen.findByTestId('sticky-client-nbr-percentage-threshold')).not.toBeDisabled()
  })

})