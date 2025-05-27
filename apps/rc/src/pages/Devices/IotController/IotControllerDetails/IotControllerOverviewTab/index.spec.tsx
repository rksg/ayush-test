import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { iotApi }                              from '@acx-ui/rc/services'
import { IotUrlsInfo }                         from '@acx-ui/rc/utils'
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
      rest.get(
        IotUrlsInfo.getIotController.url,
        (req, res, ctx) => res(ctx.json(iotController))
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
