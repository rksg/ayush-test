import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { venueApi }                                                                  from '@acx-ui/rc/services'
import { ApSnmpUrls, CommonUrlsInfo, getUrlForTest, SyslogUrls }                     from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import {
  venueSyslog,
  syslogServerProfiles
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


describe('ServerTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        SyslogUrls.getVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json(venueSyslog))),
      rest.post(
        SyslogUrls.updateVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        SyslogUrls.getSyslogPolicyList.url,
        (_, res, ctx) => res(ctx.json(syslogServerProfiles))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenueMdnsFencingPolicy),
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        getUrlForTest(CommonUrlsInfo.updateVenueMdnsFencingPolicy),
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(ApSnmpUrls.getApSnmpPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(ApSnmpUrls.getVenueApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json({
          apSnmpAgentProfileId: 'c1082e7d05d74eb897bb3600a15c1dc7',
          enableApSnmp: true
        }))
      })
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
