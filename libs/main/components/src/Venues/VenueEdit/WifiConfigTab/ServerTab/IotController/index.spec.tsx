import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { venueApi }                                                                  from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo  }                                                         from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext } from '..'
import {
  venueIot
} from '../../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../../index'


import { IotController } from '.'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('IotController', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueIot.url,
        (_, res, ctx) => res(ctx.json(venueIot)))
    )
  })

  it('should render correctly', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_MQTT_BROKER_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotController />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable IoT Controller'))
    expect(await screen.findByText(/Enable IoT Controller/)).toBeVisible()
  })

  it('should handle enable changed', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_MQTT_BROKER_TOGGLE)

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <IotController />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Enable IoT Controller'))
    expect(await screen.findByText(/Enable IoT Controller/)).toBeVisible()

    fireEvent.click(await screen.findByTestId('iot-switch'))

  })
})
