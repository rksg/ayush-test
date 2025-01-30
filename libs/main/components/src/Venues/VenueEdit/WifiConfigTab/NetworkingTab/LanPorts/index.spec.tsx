import '@testing-library/jest-dom'
import { useEffect, useState } from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                                                                               from '@acx-ui/feature-toggle'
import { venueApi }                                                                                                                                             from '@acx-ui/rc/services'
import { AaaUrls, ClientIsolationUrls, CommonRbacUrlsInfo, CommonUrlsInfo, EthernetPortProfileUrls, LanPortsUrls, SoftGreUrls, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within, waitFor, waitForElementToBeRemoved, renderHook }                                                        from '@acx-ui/test-utils'

import { NetworkingSettingContext } from '..'
import { VenueUtilityContext }      from '../..'
import { VenueEditContext }         from '../../..'
import {
  venueData,
  venueCaps,
  venueLanPorts,
  mockEthProfiles,
  mockDefaultTunkEthertnetPortProfile,
  mockSoftGreTable,
  mockedClientIsolationQueryData,
  mockedVenueLanPortSettings1,
  mockedVenueLanPortSettings2,
  mockedVenueLanPortSettings3,
  radiusList,
  mockedClientIsolation2
} from '../../../../__tests__/fixtures'

import { LanPorts } from './index'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'networking'
}

const mockLanPorts = (
  <VenueUtilityContext.Provider value={{
    venueApCaps: venueCaps,
    isLoadingVenueApCaps: false
  }} >
    <Form>
      <LanPorts />
    </Form>
  </VenueUtilityContext.Provider>
)

const successResponse = {
  requestId: 'request-id'
}

describe('LanPortsForm', () => {
  const mockedCreateEthernetPortProfileFn = jest.fn()
  const mockedActivateEthernetPortProfileApiFn = jest.fn()
  const mockedUpdateEthernetPortSettingApiFn = jest.fn()
  const mockedUpdateVenueLanPortsFn = jest.fn()
  const mockedUpdateVenueLanPortSpecificSettingsApiFn = jest.fn()
  const mockedActivateClientIsolationProfileApiFn = jest.fn()
  const mockedDeactivateClientIsolationProfileApiFn = jest.fn()


  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockedActivateEthernetPortProfileApiFn.mockClear()
    mockedUpdateEthernetPortSettingApiFn.mockClear()
    mockedUpdateVenueLanPortSpecificSettingsApiFn.mockClear()

    mockedActivateClientIsolationProfileApiFn.mockClear()
    mockedDeactivateClientIsolationProfileApiFn.mockClear()

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))
      ),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))
      ),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))
      ),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (_, res, ctx) => res(ctx.json({ mockDefaultTunkEthertnetPortProfile }))
      ),
      rest.put(
        CommonUrlsInfo.updateVenueLanPorts.url,
        (_, res, ctx) => {
          mockedUpdateVenueLanPortsFn()
          return res(ctx.json({}))
        }
      ),

      rest.put(
        CommonRbacUrlsInfo.updateVenueLanPortSpecificSettings.url,
        (_, res, ctx) => {
          mockedUpdateVenueLanPortSpecificSettingsApiFn()
          return res(ctx.json({}))
        }
      ),

      rest.post(EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockEthProfiles))
      ),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(EthernetPortProfileUrls.createEthernetPortProfile.url,
        (_, res, ctx) => {
          mockedCreateEthernetPortProfileFn()
          return res(ctx.status(200), ctx.json(successResponse))
        }
      ),
      rest.put(EthernetPortProfileUrls.activateEthernetPortProfileOnVenueApModelPortId.url,
        (_, res, ctx) => {
          mockedActivateEthernetPortProfileApiFn()
          return res(ctx.status(202))
        }
      ),

      rest.put(EthernetPortProfileUrls.updateEthernetPortSettingsByVenueApModel.url,
        (_, res, ctx) => {
          mockedUpdateEthernetPortSettingApiFn()
          return res(ctx.status(202))
        }
      ),
      rest.get(
        LanPortsUrls.getVenueLanPortSettings.url,
        (_, res, ctx) => {
          if(_.params.portId === '1') {
            return res(ctx.json(mockedVenueLanPortSettings1))
          }

          if(_.params.portId === '2') {
            return res(ctx.json(mockedVenueLanPortSettings2))
          }

          if(_.params.portId === '3') {
            return res(ctx.json(mockedVenueLanPortSettings3))
          }

          return res(ctx.json({}))
        }
      ),

      rest.post(SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))
      ),

      rest.post(ClientIsolationUrls.queryClientIsolation.url,
        (_, res, ctx) => res(ctx.json(mockedClientIsolationQueryData))
      ),

      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(radiusList))
      ),
      rest.put(ClientIsolationUrls.activateClientIsolationOnVenue.url,
        (_, res, ctx) => {
          mockedActivateClientIsolationProfileApiFn()
          return res(ctx.status(202))
        }
      ),
      rest.delete(ClientIsolationUrls.deactivateClientIsolationOnVenue.url,
        (_, res, ctx) => {
          mockedDeactivateClientIsolationProfileApiFn()
          return res(ctx.status(202))
        }
      ),
      rest.get(
        ClientIsolationUrls.getClientIsolationRbac.url,
        (_, res, ctx) => res(ctx.json({ mockedClientIsolation2 }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        {mockLanPorts}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))
    expect(await screen.findByAltText(/default image/)).toBeVisible()
  })

  it('should handle tab and model changed', async () => {
    render(
      <Provider>
        {mockLanPorts}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('H320')
    await userEvent.click(option)

    const tabs = await screen.findAllByRole('tab')
    expect(tabs).toHaveLength(3)

    const tabPanel = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel).getByLabelText(/Enable port/)).not.toBeChecked()
    expect(within(tabPanel).getByLabelText(/Port type/)).toBeDisabled()
    expect(within(tabPanel).getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(within(tabPanel).getByLabelText(/VLAN member/)).toBeDisabled()

    await fireEvent.click(await screen.findByRole('tab', { name: 'LAN 2' }))
    const tabPanel2 = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel2).getByLabelText(/Enable port/)).toBeChecked()
    expect(within(tabPanel2).getByLabelText(/Port type/)).not.toBeDisabled()

    fireEvent.mouseDown(within(tabPanel2).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('TRUNK')[1])
    expect(within(tabPanel2).getByLabelText(/VLAN untag ID/)).toHaveValue('1')
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).toHaveValue('1-4094')
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).toBeDisabled()

    fireEvent.mouseDown(within(tabPanel2).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('GENERAL')[1])
    const vlanMemberInput = within(tabPanel2).getByLabelText(/VLAN member/)
    expect(vlanMemberInput).not.toBeDisabled()

    await userEvent.clear(vlanMemberInput)
    await userEvent.type(vlanMemberInput, '2')

    await fireEvent.click(await screen.findByRole('tab', { name: 'LAN 3' }))
    const tabPanel3 = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel3).getByLabelText(/Enable port/)).toBeDisabled()
  })

  it('should handle Port type, PoE Mode and PoE Out changed', async () => {
    render(
      <Provider>
        {mockLanPorts}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)
    expect(await screen.findByAltText(/AP LAN port image - T750/)).toBeVisible()

    fireEvent.mouseDown(screen.getByLabelText('PoE Operating Mode'))
    await userEvent.click(await screen.getAllByText('802.3at')[1])

    const tabPanel = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel).getByLabelText('Enable PoE Out')).not.toBeChecked()

    fireEvent.mouseDown(within(tabPanel).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('ACCESS')[1])

    const untagInput = within(tabPanel).getByLabelText(/VLAN untag ID/)
    expect(untagInput).not.toBeDisabled()
    await userEvent.clear(untagInput)
    await userEvent.type(untagInput, '2')
    expect(within(tabPanel).getByLabelText(/VLAN member/)).toHaveValue('2')
  })

  it('should display Reset to default link button after selected model', async () => {
    render(
      <Provider>
        {mockLanPorts}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)

    const resetBtn = await screen.findByRole('button', { name: 'Reset to default' })
    expect(resetBtn).toBeVisible()
    fireEvent.mouseOver(resetBtn)
    await waitFor(async () => {
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('Reset port settings to default')
    })
    await userEvent.click(resetBtn)
  })

  it ('Should pop up warning message if reset port to default by ap model', async () => {
    const { result: venueEditContextHook } = renderHook(() => {
      const [editNetworkingContextData, setEditNetworkingContextData] =
        useState({ updateLanPorts: ()=>{} } as NetworkingSettingContext)
      const [editContextData, setEditContextData] = useState({})

      useEffect(()=>{
        editNetworkingContextData.updateLanPorts?.()
      }, [editNetworkingContextData])


      return { editNetworkingContextData, setEditNetworkingContextData,
        editContextData, setEditContextData }
    })

    render(

      <Provider>
        <VenueEditContext.Provider value={{
          editNetworkingContextData: venueEditContextHook.current.editNetworkingContextData,
          setEditNetworkingContextData: venueEditContextHook.current.setEditNetworkingContextData,
          editContextData: venueEditContextHook.current.editContextData,
          setEditContextData: venueEditContextHook.current.setEditContextData
        }}>
          <VenueUtilityContext.Provider value={{
            venueApCaps: venueCaps,
            isLoadingVenueApCaps: false
          }} >
            <Form>
              <LanPorts />
            </Form>
          </VenueUtilityContext.Provider>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)

    const resetBtn = await screen.findByRole('button', { name: 'Reset to default' })
    expect(resetBtn).toBeVisible()
    fireEvent.mouseOver(resetBtn)
    await waitFor(async () => {
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('Reset port settings to default')
    })

    const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
    expect(enablePort).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(enablePort)
    expect(enablePort).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(resetBtn)
    const dialog = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Changing the port settings may result in loss of connectivity and communication issues to your APs. Do you want to continue with these changes?')

    const continueBtn = await screen.findByRole('button', { name: 'Continue' })
    expect(continueBtn).toBeVisible()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(mockedUpdateVenueLanPortsFn).toBeCalled())
  })

  it ('Should render ethernet profile correctly with AP model T750SE', async () => {
    // Given
    render(
      <Provider>
        {mockLanPorts}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_PROFILE_TOGGLE)
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)

    const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
    expect(enablePort).toHaveAttribute('aria-checked', 'true')

    const profileSelector = await screen.findByRole('combobox', { name: 'Ethernet Port Profile' })
    expect(profileSelector).toBeInTheDocument()
    await userEvent.click(profileSelector)

    const detailBtn = await screen.findByRole('button', { name: 'Profile Details' })
    expect(detailBtn).toBeInTheDocument()
    await userEvent.click(detailBtn)

    expect(await screen.findAllByText('Port Type')).toHaveLength(3)
    expect(await screen.findAllByText('VLAN Untag ID')).toHaveLength(4)
    expect(await screen.findAllByText('VLAN Members')).toHaveLength(3)
    expect(await screen.findAllByText('802.1X')).toHaveLength(4)

    const addBtn = await screen.findByRole('button', { name: 'Add Profile' })
    expect(addBtn).toBeInTheDocument()
    await userEvent.click(addBtn)

    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(screen.getByText('Add Ethernet Port Profile')).toBeInTheDocument()

    const profileNameInput = await screen.findByLabelText('Profile Name')
    expect(profileNameInput).toBeInTheDocument()
    fireEvent.change(profileNameInput, { target: { value: 'eth_profile_1' } })
    fireEvent.blur(profileNameInput)

    expect(screen.getByText('VLAN')).toBeInTheDocument()
    const untagVlanInput = await screen.findByLabelText('VLAN Untag ID')
    expect(untagVlanInput).toBeInTheDocument()
    fireEvent.change(untagVlanInput, { target: { value: 9 } })

    expect(await screen.findByLabelText('802.1X Authentication')).toBeInTheDocument()

    await userEvent.click(actions.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedCreateEthernetPortProfileFn).toBeCalled())
  })



  // eslint-disable-next-line max-len
  it ('Should render ethernet profile correctly with AP model T750 and save successfully', async () => {
    const { result: venueEditContextHook } = renderHook(() => {
      // eslint-disable-next-line max-len
      const [editNetworkingContextData, setEditNetworkingContextData] = useState({ updateLanPorts: ()=>{} } as NetworkingSettingContext)
      const [editContextData, setEditContextData] = useState({})

      useEffect(()=>{
        editNetworkingContextData.updateLanPorts?.()

      }, [editNetworkingContextData])


      return { editNetworkingContextData, setEditNetworkingContextData,
        editContextData, setEditContextData }
    })

    render(

      <Provider>
        <VenueEditContext.Provider value={{
          editNetworkingContextData: venueEditContextHook.current.editNetworkingContextData,
          setEditNetworkingContextData: venueEditContextHook.current.setEditNetworkingContextData,
          editContextData: venueEditContextHook.current.editContextData,
          setEditContextData: venueEditContextHook.current.setEditContextData
        }}>
          <VenueUtilityContext.Provider value={{
            venueApCaps: venueCaps,
            isLoadingVenueApCaps: false
          }} >
            <Form>
              <LanPorts />
            </Form>
          </VenueUtilityContext.Provider>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
      ff === Features.RBAC_SERVICE_POLICY_TOGGLE ||
      ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
      ff === Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)

    const profileSelector = await screen.findByRole('combobox', { name: 'Ethernet Port Profile' })
    expect(profileSelector).toBeInTheDocument()
    await userEvent.click(profileSelector)
    await userEvent.click(
      (await screen.findAllByText('Default Access'))[1]
    )

    const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
    expect(enablePort).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(enablePort)

    const poeModeSelector = await screen.findByRole('combobox', { name: 'PoE Operating Mode' })
    expect(poeModeSelector).toBeInTheDocument()
    await userEvent.click(poeModeSelector)
    await userEvent.click(
      (await screen.findAllByText('802.3at'))[1]
    )

    // The renderHook will call editNetworkingContextData.updateLanPorts?.() by useEffect()

    await waitFor(() => expect(mockedActivateEthernetPortProfileApiFn).toBeCalled())
    await waitFor(() => expect(mockedUpdateEthernetPortSettingApiFn).toBeCalled())
    await waitFor(() => expect(mockedUpdateVenueLanPortSpecificSettingsApiFn).toBeCalled())
  })
})
