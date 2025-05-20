import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { iotApi }                     from '@acx-ui/rc/services'
import { IotUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import { IotControllerDetails } from '.'

const iotController = {
  requestId: 'request-id',
  response: {
    data: {
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      iotSerialNumber: 'rewqfdsafasd'
    }
  }
}


jest.mock('./IotControllerOverviewTab', () => ({
  IotControllerOverviewTab: () => <div
    data-testid={'rc-IotControllerOverviewTab'}
    title='IotControllerOverviewTab' />
}))

describe('IotControllerDetails', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(iotApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      iotId: '1',
      activeTab: 'overview'
    }
    mockServer.use(
      rest.get(
        IotUrlsInfo.getIotController.url,
        (req, res, ctx) => res(ctx.json(iotController))
      )
    )
    render(<Provider><IotControllerDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/devices/iotController/:iotId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab')).toHaveLength(1)

  })
})
