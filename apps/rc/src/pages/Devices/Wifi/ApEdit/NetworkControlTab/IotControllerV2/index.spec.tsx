import '@testing-library/jest-dom'

import { rest } from 'msw'

import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { venueApi }                                              from '@acx-ui/rc/services'
import { IotUrlsInfo, IotControllerStatus, WifiRbacUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApDataContext } from '../..'
import {
  resultOfGetApIotSettings,
  venueData } from '../../../../__tests__/fixtures'
import { apDetails } from '../../../ApDetails/__tests__/fixtures'

import { IotControllerV2 } from './index'

const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      iotSerialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueId: 'db2b80ba868c419fb5c1732575160808'
    }, {
      id: 'e0dfcc8c-e328-4969-b5de-10aa91b98b82',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      iotSerialNumber: 'jfsdjoiasdfjo',
      publicAddress: '35.229.207.4',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueId: 'db2b80ba868c419fb5c1732575160808'
    }] as IotControllerStatus[]
  }
}

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

describe('Iot Controller', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IotUrlsInfo.getIotControllerList.url,
        (req, res, ctx) => res(ctx.json(iotControllerList.response))
      ),
      rest.get(WifiRbacUrlsInfo.getApIotV2.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApIotSettings))
      })
    )
  })
  it('Should Retrive Initial Data From Server and Render', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)

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
