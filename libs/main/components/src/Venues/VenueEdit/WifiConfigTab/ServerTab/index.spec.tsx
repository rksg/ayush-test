import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { venueApi }                                                                                       from '@acx-ui/rc/services'
import { ApSnmpUrls, CommonUrlsInfo, SyslogUrls, LbsServerProfileUrls, ApSnmpRbacUrls, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved }                      from '@acx-ui/test-utils'


import {
  venueSyslog,
  syslogServerProfiles,
  resultOfGetVenueApSnmpAgentSettings,
  resultOfGetApSnmpAgentProfiles
} from '../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../index'

import { ServerSettingContext } from '.'
import { ServerTab }            from '.'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext
const setEditServerContextData = jest.fn()

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApSnmp', () => ({
  ApSnmp: () => <div>ApSnmp Component</div>
}))

jest.mock('./IotController', () => ({
  IotController: () => <div>IotController Component</div>
}))

describe('ServerTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.RBAC_SERVICE_POLICY_TOGGLE)
    mockServer.use(
      rest.get(
        SyslogUrls.getVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json(venueSyslog))),
      rest.post(
        SyslogUrls.updateVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        SyslogUrls.syslogPolicyList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: syslogServerProfiles.length,
          data: syslogServerProfiles
        }))
      ),
      rest.get(CommonUrlsInfo.getVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(CommonUrlsInfo.updateVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(
        ApSnmpUrls.getApSnmpPolicyList.url,
        (_, res, ctx) => res(ctx.json(resultOfGetApSnmpAgentProfiles))),
      rest.get(
        ApSnmpUrls.getVenueApSnmpSettings.url,
        (_, res, ctx) => res(ctx.json(resultOfGetVenueApSnmpAgentSettings))),
      rest.get(
        ApSnmpRbacUrls.getApSnmpFromViewModel.url,
        (_, res, ctx) => res(ctx.json(resultOfGetVenueApSnmpAgentSettings))),
      // rbac
      rest.get(WifiRbacUrlsInfo.getVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it('should render correctly', async () => {
    render(<Provider><ServerTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable Server'))
  })

  it('should handle update setting', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <ServerTab />
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitFor(() => screen.findByText('Enable Server'))

    await fireEvent.click(await screen.findByTestId('syslog-switch'))
  })
  it('should navigate to venue list page when clicking cancel button', async () => {
    render(<Provider><ServerTab /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Enable Server'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues`,
      hash: '',
      search: ''
    })
  })
})
