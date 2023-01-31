import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, SyslogUrls }                                                from '@acx-ui/rc/utils'
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
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json(venueSyslog))),
      rest.post(
        CommonUrlsInfo.updateVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        SyslogUrls.getSyslogPolicyList.url,
        (_, res, ctx) => res(ctx.json(syslogServerProfiles)))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ServerTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable Server'))
    expect(asFragment()).toMatchSnapshot()
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
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitFor(() => screen.findByText('Enable Server'))

    await fireEvent.click(await screen.findByTestId('syslog-switch'))
  })
  it('should navigate to venue details page when clicking cancel button', async () => {
    render(<Provider><ServerTab /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Enable Server'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })
})
