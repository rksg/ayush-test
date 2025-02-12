/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { networkApi, policyApi, venueApi } from '@acx-ui/rc/services'
import {
  ApGroupConfigTemplateUrlsInfo,
  CommonUrlsInfo,
  RadioTypeEnum,
  VlanPoolRbacUrls,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  network,
  networkVenue_apgroup,
  networkVenue_allAps,
  params,
  vlanPoolList, vlanPoolListViewMode
} from './__tests__/NetworkVenueTestData'

import { NetworkApGroupDialog } from './index'


const venueName = 'My-Venue'
const mockApGroupsList = jest.fn()

describe('NetworkApGroupDialog', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_AP_DEFAULT_6G_ENABLEMENT_TOGGLE)

    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_apgroup] }))
      ),
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => {
          mockApGroupsList()
          return res(ctx.json({ data: [{ id: 'fake_apg_id', name: 'fake_apg_name' }] }))
        }
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json({ data: [{ id: 'fake_apg_id', name: 'fake_apg_name' }] }))
      ),
      rest.post(
        ApGroupConfigTemplateUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json({ data: [{ id: 'fake_apg_id', name: 'fake_apg_name' }] }))
      ),
      rest.get(
        WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json(vlanPoolList))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (req, res, ctx) => res(ctx.json(vlanPoolList))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (req, res, ctx) => res(ctx.json(vlanPoolListViewMode))
      )
    )
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_apgroup] }))
      )
    )

    const props = {
      formName: 'networkApGroupForm',
      venueName: venueName,
      tenantId: params.tenantId,
      networkVenue: networkVenue_allAps,
      network: network
    }
    const onOk = jest.fn()

    const { rerender } = render(
      <Provider><NetworkApGroupDialog
        {...props}
        visible={true}
        onOk={onOk}
      /></Provider>, { route: { params } })

    await waitFor(() => expect(mockApGroupsList).toBeCalled())

    const dialog = await screen.findByRole('dialog')

    // Show venue's name in the sub-title
    expect(within(dialog).getByText(venueName, { exact: false })).toBeVisible()

    // Select 'All APs' by default
    expect(within(dialog).getByLabelText('All APs', { exact: false, selector: 'input' })).toBeChecked()
    expect(dialog).toHaveTextContent('VLAN-1 (Default)')

    // TODO: Waiting for TAG feature support
    // Switch to 'Select APs by tag' radio
    // fireEvent.click(within(dialog).getByLabelText('Select APs by tag', { exact: false }))
    // expect(within(dialog).getByLabelText('Tags')).toBeVisible()

    const applyBtn = within(dialog).getByRole('button', { name: 'Apply' })
    await waitFor(() => expect(applyBtn).not.toBeDisabled())
    await userEvent.click(applyBtn)

    await waitFor(() => expect(onOk).toBeCalled())

    // update the props "visible"
    rerender(<Provider><NetworkApGroupDialog {...props} visible={false}/></Provider>)
    expect(dialog).not.toBeVisible()
  })

  it('should select specific AP groups', async () => {
    render(<Provider><NetworkApGroupDialog
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      tenantId={params.tenantId}
      networkVenue={networkVenue_apgroup}
      network={network}
    /></Provider>, { route: { params } })

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByLabelText('Select specific AP groups', { exact: false, selector: 'input' })).toBeChecked()

    await waitFor(() => expect(dialog).toHaveTextContent(`VLAN Pool: ${vlanPoolList[0].name} (Custom)`))
  })

  it('should has 6 GHz and could click apply', async () => {

    let wlanWPA3 = { ...network.wlan, wlanSecurity: WlanSecurityEnum.WPA3 }
    const wpa3Network = {
      ...network,
      wlan: wlanWPA3
    }

    render(<Provider><NetworkApGroupDialog
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      tenantId={params.tenantId}
      networkVenue={{ ...networkVenue_allAps,
        allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz] }}
      network={wpa3Network}
    /></Provider>, { route: { params } })

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveTextContent('6 GHz')

    // Switch to 'AP groups' radio
    await userEvent.click(within(dialog).getByLabelText('Select specific AP groups', { exact: false }))

    const checkbox = await within(dialog).findByLabelText('APs not assigned to any group', { exact: false, selector: 'input' })
    expect(checkbox).toBeVisible()
  })
})

