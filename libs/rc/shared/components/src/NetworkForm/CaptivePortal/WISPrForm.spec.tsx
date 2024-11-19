/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                               from '@acx-ui/msp/utils'
import { AaaUrls, CommonUrlsInfo, CommonRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor }            from '@acx-ui/test-utils'
import { UserUrlsInfo }                                              from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  externalProviders,
  wisprDataWPA2,
  wisprDataForAllAccept,
  wisprDataForOnlyAuth,
  mockAAAPolicyListResponse,
  externalWifiProviders
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { WISPrForm } from './WISPrForm'

const mspEcProfileData = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: false
}

jest.mock('../NetworkMoreSettings/NetworkMoreSettingsForm', () => ({
  ...jest.requireActual('../NetworkMoreSettings/NetworkMoreSettingsForm'),
  __esModule: true,
  NetworkMoreSettingsForm: () => <div data-testid='NetworkMoreSettingsFormTest'></div>
}))

describe('CaptiveNetworkForm-WISPr', () => {
  describe('WISPr network', () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }
    beforeEach(() => {
      networkDeepResponse.name = 'WISPr network test'
      const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
        guestPortal: wisprDataWPA2.guestPortal,
        wlan: { ...networkDeepResponse.wlan, ...wisprDataWPA2.wlan } }
      mockServer.use(
        rest.get(UserUrlsInfo.getAllUserSettings.url,
          (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuesResponse))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venueListResponse))),
        rest.post(CommonUrlsInfo.getVMNetworksList.url,
          (_, res, ctx) => res(ctx.json(networksResponse))),
        rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
          (_, res, ctx) => res(ctx.json(successResponse))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venueListResponse))),
        rest.get(CommonUrlsInfo.getExternalProviders.url,
          (_, res, ctx) => res(ctx.json( externalProviders ))),
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.json(wisprRes))),
        rest.get(MspUrlsInfo.getMspEcProfile.url, (_req, res, ctx) =>
          res(ctx.json(mspEcProfileData))
        ),
        rest.post(AaaUrls.getAAAPolicyViewModelList.url,
          (_, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
        // RBAC API
        rest.get(CommonRbacUrlsInfo.getExternalProviders.url,
          (_, res, ctx) => res(ctx.json( externalProviders ))),
        rest.post(AaaUrls.queryAAAPolicyList.url,
          (_, res, ctx) => res(ctx.json(mockAAAPolicyListResponse)))
      )
    })

    it('should test WISPr network successfully', async () => {
      jest.mocked(useIsSplitOn).mockImplementation((splitName) =>
        splitName !== Features.WIFI_WLAN_DEPRECATE_WEP &&
        splitName !== Features.WIFI_RBAC_API)
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: true, cloneMode: true, data: wisprDataWPA2, isRuckusAiMode: false
            }}
          >
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <WISPrForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>, { route: { params } })
      await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
      await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
      await userEvent.click((await screen.findAllByTitle('Select Region'))[0])
      await userEvent.click((await screen.findAllByTitle('Asia'))[0])
      await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
      await userEvent.click((await screen.findAllByTitle('SkyWifiRadSec'))[0])
      await userEvent.click((await screen.findAllByTitle('SkyWifiRadSec'))[0])
      await userEvent.click((await screen.findAllByTitle('Custom Provider'))[0])
      const providerNameInput = await screen.findByLabelText(/Provider Name/)
      fireEvent.change(providerNameInput, { target: { value: 'namep1' } })
      fireEvent.blur(providerNameInput)
      await userEvent.click(await screen.findByText('Add'))
      await userEvent.click(await screen.findByRole('switch'))

      const insertInput = await screen.findByLabelText(/Captive Portal URL/)
      fireEvent.change(insertInput, { target: { value: 'http://ruckus.abc.com' } })
      fireEvent.blur(insertInput)
      await userEvent.click(await screen.findByText('Copy Key'))
      await userEvent.click((await screen.findAllByTitle('WPA2 (Recommended)'))[0])
      await userEvent.click((await screen.findAllByTitle('WEP'))[0])
      const hexKey = await screen.findByLabelText(/Hex Key/)
      fireEvent.change(hexKey, { target: { value: 'be434651bc9e23f2af29fa75f7' } })
      fireEvent.blur(hexKey)
      await userEvent.click(await screen.findByText('Generate'))
      await userEvent.click((await screen.findAllByTitle('WEP'))[0])
      await userEvent.click((await screen.findAllByTitle('WPA2/WPA3 mixed mode'))[0])
      const wpa2Pass = await screen.findByLabelText(/WPA2 Passphrase/)
      fireEvent.change(wpa2Pass, { target: { value: 'wpa233333333' } })
      fireEvent.blur(wpa2Pass)

      const wpa3Pass = await screen.findByLabelText(/WPA3 SAE Passphrase/)
      fireEvent.change(wpa3Pass, { target: { value: 'wpa3xxxxxxxx' } })
      fireEvent.blur(wpa3Pass)

      const walledGarden = screen.getByTestId('walled-garden-showed-textarea')
      fireEvent.change(walledGarden, { target: { value: 'test123.com' } })
      fireEvent.blur(walledGarden)
      await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
      const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
      fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
      await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
      await userEvent.click(await screen.findByRole('checkbox',
        { name: /Enable RUCKUS DHCP service/ }))
      await userEvent.click(await screen.findByRole('checkbox',
        { name: /Enable MAC auth bypass/ }))
      await userEvent.click(await screen.findByRole('checkbox',
        { name: /Enable the encryption for users’ MAC and IP addresses/ }))
      // await userEvent.click(await screen.findByText('More details'))
    })

    it('WISPr always accept test case', async ()=>{
      jest.mocked(useIsSplitOn).mockImplementation((splitName) =>
        splitName !== Features.WIFI_RBAC_API)
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{ editMode: false, cloneMode: false, data: wisprDataWPA2, isRuckusAiMode: false }}>
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <WISPrForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>,
        { route: { params } }
      )

      await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
      await userEvent.click((await screen.findAllByTitle('Custom Provider'))[0])
      await screen.findByText('Authentication Server')
      await userEvent.click((await screen.findByTestId('bypasscna_checkbox')))
      expect(await screen.findByTestId('bypasscna_checkbox')).not.toBeDisabled()
      expect((await screen.findByTestId('always_accept'))).not.toBeDisabled()
      await userEvent.click((await screen.findByTestId('always_accept')))
      expect(await screen.findByTestId('bypasscna_checkbox')).toBeDisabled()
      expect(await screen.findByTestId('radius_server_selection')).toHaveClass('ant-select-disabled')
      expect(await screen.findByTestId('radius')).not.toBeDisabled()
    })

    it('WISPr always accept test case when always accept is selected', async ()=>{
      jest.mocked(useIsSplitOn).mockImplementation((splitName) =>
        splitName !== Features.WIFI_RBAC_API)
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{ editMode: true, cloneMode: true, data: wisprDataForAllAccept, isRuckusAiMode: false }}>
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <WISPrForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>,
        { route: { params } }
      )
      await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
      await userEvent.click((await screen.findAllByTitle('Custom Provider'))[0])
      await screen.findByText('Authentication Service')
      expect((await screen.findByTestId('always_accept'))).toBeChecked()
      expect(await screen.findByTestId('bypasscna_checkbox')).toBeDisabled()
      expect((await screen.findByTestId('always_accept'))).not.toBeDisabled()
      expect(await screen.findByTestId('radius_server_selection')).toHaveClass('ant-select-disabled')
    })

    it('WISPr always accept test case when only Auth is selected', async ()=>{
      jest.mocked(useIsSplitOn).mockImplementation((splitName) =>
        splitName !== Features.WIFI_RBAC_API)
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{ editMode: true, cloneMode: true, data: wisprDataForOnlyAuth, isRuckusAiMode: false }}>
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <WISPrForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>,
        { route: { params } }
      )
      await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
      await userEvent.click((await screen.findAllByTitle('Custom Provider'))[0])
      await screen.findByText('Authentication Service')
      expect((await screen.findByTestId('always_accept'))).not.toBeChecked()
      expect((await screen.findByTestId('radius'))).toBeChecked()
      expect((await screen.findByTestId('bypasscna_checkbox'))).not.toBeChecked()
      expect(await screen.findByTestId('bypasscna_checkbox')).not.toBeDisabled()
      expect((await screen.findByTestId('always_accept'))).not.toBeDisabled()
      // eslint-disable-next-line max-len
      expect(await screen.findByTestId('radius_server_selection')).not.toHaveClass('ant-select-disabled')
    })
  })

  describe('WISPr network with RBAC API', () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }
    const mockGetFun = jest.fn()
    beforeEach(() => {
      networkDeepResponse.name = 'WISPr network test'
      mockGetFun.mockClear()
      const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
        guestPortal: wisprDataWPA2.guestPortal,
        wlan: { ...networkDeepResponse.wlan, ...wisprDataWPA2.wlan } }
      mockServer.use(
        rest.get(UserUrlsInfo.getAllUserSettings.url,
          (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuesResponse))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venueListResponse))),
        rest.post(CommonUrlsInfo.getVMNetworksList.url,
          (_, res, ctx) => res(ctx.json(networksResponse))),
        rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
          (_, res, ctx) => res(ctx.json(successResponse))),
        rest.post(CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venueListResponse))),
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.json(wisprRes))),
        rest.get(MspUrlsInfo.getMspEcProfile.url, (_req, res, ctx) =>
          res(ctx.json(mspEcProfileData))
        ),
        rest.post(AaaUrls.getAAAPolicyViewModelList.url,
          (_, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
        // RBAC API
        rest.get(CommonRbacUrlsInfo.getExternalProviders.url,
          (_, res, ctx) => {
            mockGetFun()
            return res(ctx.json( externalWifiProviders ))
          }),
        rest.post(AaaUrls.queryAAAPolicyList.url,
          (_, res, ctx) => res(ctx.json(mockAAAPolicyListResponse)))
      )
    })
    it('should test WISPr wispr provider', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false, cloneMode: false, data: wisprDataWPA2, isRuckusAiMode: false
            }}
          >
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <WISPrForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>, { route: { params } })

      await waitFor(() => expect(mockGetFun).toBeCalledTimes(1))

      expect(await screen.findByTitle('Select provider')).toBeVisible()
      await userEvent.click((await screen.findByTitle('Select provider')))
      expect(await screen.findByTitle('SkyWifiRadSecTest')).toBeInTheDocument()
      expect(await screen.findByTitle('Skyfii')).toBeInTheDocument()
      expect(await screen.findByTitle('Test-Provider-0502')).toBeInTheDocument()

    })
  })
})
