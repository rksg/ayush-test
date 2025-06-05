import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { venueApi }                                                         from '@acx-ui/rc/services'
import { IotUrlsInfo, IotControllerStatus }                                 from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { IotControllerV2 } from '.'

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
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('IotControllerV2', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IotUrlsInfo.getIotControllerList.url,
        (req, res, ctx) => res(ctx.json(iotControllerList.response))
      )
    )
  })

  it('should render IoT V2 UI when isIotV2Enabled is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotControllerV2 />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByText(/Associate IoT Controller/)).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should open the IoT Controller Drawer when "Associate IoT Controller" button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotControllerV2 />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const associateButton = await screen.findByText(/Associate IoT Controller/)
    fireEvent.click(associateButton)
    expect(await screen.findByText('Add IoT Controller')).toBeVisible()
  })
})
