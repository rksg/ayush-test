import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, SyslogUrls }                                                from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext } from '..'
import {
  venueSyslog,
  syslogServerProfiles
} from '../../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../../index'


import { Syslog } from './index'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('SyslogForm', () => {
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
    render(
      <Provider>
        <Form>
          <Syslog />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable Server'))
    expect(await screen.findByText(/Enable Server/)).toBeVisible()

    expect(await screen.findByText(/SyslogProfile1/)).toBeVisible()
  })

  it('should handle syslog profile changed', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <Syslog />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Enable Server'))
    expect(await screen.findByText(/Enable Server/)).toBeVisible()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('SyslogProfile2')
    await userEvent.click(option)
  })

  it('should handle enable changed', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <Syslog />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Enable Server'))
    expect(await screen.findByText(/Enable Server/)).toBeVisible()

    fireEvent.click(await screen.findByTestId('syslog-switch'))

  })
})
