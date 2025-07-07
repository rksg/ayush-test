import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { venueApi }                                                                  from '@acx-ui/rc/services'
import { ConfigTemplateContext, PoliciesConfigTemplateUrlsInfo, SyslogUrls }         from '@acx-ui/rc/utils'
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

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SyslogForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.get(
        SyslogUrls.getVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json(venueSyslog))),
      rest.post(
        SyslogUrls.updateVenueSyslogAp.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(SyslogUrls.syslogPolicyList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: syslogServerProfiles.length,
          data: syslogServerProfiles
        }))
      )
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

  it('should handle click the Add Server Profile button', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Add Server Profile' }))

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalled())
  })

  it('should render correctly with rbac api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    mockServer.use(
      rest.post(SyslogUrls.querySyslog.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: syslogServerProfiles.length,
          data: syslogServerProfiles
        }))
      )
    )
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

  it('should render correctly with rbac api for config template', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    mockServer.use(
      rest.post(PoliciesConfigTemplateUrlsInfo.querySyslog.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: syslogServerProfiles.length,
          data: syslogServerProfiles
        }))
      ),
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getVenueSyslogSettings.url,
        (_, res, ctx) => res(ctx.json(venueSyslog)))
    )
    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider>
          <Form>
            <Syslog />
          </Form>
        </Provider>
      </ConfigTemplateContext.Provider>, {
        route: { params, path: '/:tenantId/v/configTemplates/venues/:venueId/edit/wifi/servers' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable Server'))
    expect(await screen.findByText(/Enable Server/)).toBeVisible()

    expect(await screen.findByText(/SyslogProfile1/)).toBeVisible()
  })
})
