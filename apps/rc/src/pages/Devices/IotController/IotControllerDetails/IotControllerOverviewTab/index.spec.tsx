import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { iotApi }                              from '@acx-ui/rc/services'
import { IotUrlsInfo, IotControllerStatus }    from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { IotControllerOverviewTab } from '.'

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

const dashboardData = {
  summary: {
    aps: {
      summary: {
        online: 1,
        offline: 1
      },
      totalCount: 2
    },
    rcapLicenseUtilization: {
      summary: {
        used: 1,
        available: 1
      },
      totalCount: 2
    },
    associatedVenues: {
      summary: {
        venues: 2
      },
      totalCount: 2
    },
    activePluginsByRadio: [
      {
        name: 'Radio 1',
        count: 1
      },
      {
        name: 'Radio 2',
        count: 1
      }
    ]
  }
}

const pluginsData = {
  requestId: '336c8ceb-5a0d-4774-9ab7-9ecc751bdc0f',
  pluginStatus: [
    {
      name: 'assaabloy',
      running: false,
      enabled: false
    },
    {
      name: 'ibeacon',
      running: false,
      enabled: false
    },
    {
      name: 'eddystone',
      running: false,
      enabled: false
    },
    {
      name: 'ctrlDataStream',
      running: false,
      enabled: false
    },
    {
      name: 'baas',
      running: false,
      enabled: false
    },
    {
      name: 'telkonet',
      running: false,
      enabled: false
    }
  ]
}

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

const licenseData = {
  requestId: '3b7304ad-4610-4ca7-b1d9-d6d05b7125f2',
  rcapCountRequired: 0,
  rcapCountAvailable: 1000000
}

const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  venueId: '3f10af1401b44902a88723cb68c4bc77',
  iotId: '1',
  activeTab: 'overview'
}


describe('Iot Controller Details Overview', () => {
  beforeEach(() => {
    store.dispatch(iotApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        IotUrlsInfo.getIotControllerList.url,
        (req, res, ctx) => res(ctx.json(iotControllerList.response))
      ),
      rest.get(
        IotUrlsInfo.getIotController.url,
        (req, res, ctx) => res(ctx.json(iotController.response))
      ),
      rest.get(
        IotUrlsInfo.getIotControllerLicenseStatus.url,
        (req, res, ctx) => res(ctx.json(licenseData))
      ),
      rest.get(
        IotUrlsInfo.getIotControllerPlugins.url,
        (req, res, ctx) => res(ctx.json(pluginsData))
      ),
      rest.get(
        IotUrlsInfo.getIotControllerDashboard.url,
        (req, res, ctx) => res(ctx.json(dashboardData))
      )
    )
  })

  it('should render overview tab correctly', async () => {

    const { asFragment } = render(<Provider><IotControllerOverviewTab /></Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()

  })

})
