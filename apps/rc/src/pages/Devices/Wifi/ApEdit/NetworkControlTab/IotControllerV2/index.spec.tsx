import '@testing-library/jest-dom'

import { rest } from 'msw'

import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { venueApi }                                              from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo  }                                     from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApDataContext } from '../..'
import {
  resultOfGetApIotSettings,
  resultOfGetVenueApIotSettings,
  venueData } from '../../../../__tests__/fixtures'
import { apDetails } from '../../../ApDetails/__tests__/fixtures'

import { IotControllerV2 } from './index'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

describe('Iot Controller', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getApIot.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApIotSettings))
      }),
      rest.get(WifiRbacUrlsInfo.getVenueIot.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetVenueApIotSettings))
      })
    )
  })
  it('Should Retrive Initial Data From Server and Render', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_MQTT_BROKER_TOGGLE)

    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
          <IotControllerV2 />
        </ApDataContext.Provider>
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByText(/Customize/)).toBeVisible()
  })

})
