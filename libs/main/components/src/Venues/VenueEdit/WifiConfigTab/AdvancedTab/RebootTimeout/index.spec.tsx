import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { venueApi }               from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo  }      from '@acx-ui/rc/utils'
import { Provider, store }        from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EditContext, VenueEditContext } from '../../..'
import { mockedRebootTimeout }           from '../../../../__tests__/fixtures'
import { defaultValue }                  from '../../../../contentsMap'

import { RebootTimeout } from '.'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'networking'
}

describe('Venue Reboot Timeout', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueRebootTimeout.url,
        (_, res, ctx) => res(ctx.json(mockedRebootTimeout)))
    )
  })

  it('should render correctly', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_AP_REBOOT_TIMEOUT_WLAN_TOGGLE)

    render(
      <Provider>
        <Form>
          <RebootTimeout />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await waitFor(() => screen.findByText('Gateway Connection Monitor'))
    expect(await screen.findByTestId('gateway-switch')).toBeVisible()
    expect(await screen.findByTestId('server-switch')).toBeVisible()
  })

  it('should handle turn On/Off switch buttons changed', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_AP_REBOOT_TIMEOUT_WLAN_TOGGLE)

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData: {} as EditContext,
          setEditContextData: jest.fn(),
          setEditAdvancedContextData: jest.fn()
        }}>
          <Form>
            <RebootTimeout />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await waitFor(() => screen.findByText('Gateway Connection Monitor'))

    expect(await screen.findByTestId('gateway-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('gateway-switch'))
    expect(await screen.findByTestId('gateway-switch')).not.toBeChecked()

    expect(await screen.findByTestId('server-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('server-switch'))
    expect(await screen.findByTestId('server-switch')).not.toBeChecked()
  })
})
