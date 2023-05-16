import '@testing-library/react'
import '@testing-library/jest-dom'


import { rest } from 'msw'

import { edgeApi }                                                         from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor,  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeUpTimeWidget, EdgePortsByTrafficWidget, EdgeResourceUtilizationWidget, EdgeTrafficByVolumeWidget } from '../'

import * as EdgeTestCase from './fixture'

const params = {
  serialNumber: '962604D7DCEEE011ED9715000C2949F53E'
}

describe('Test all Edge Statistic Widget', () => {
  describe('Test all Under No Data', () => {
    beforeEach(() => {
      store.dispatch(edgeApi.util.resetApiState())
      mockServer.use(
        rest.post(EdgeUrlsInfo.getEdgeUpDownTime.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeUpTimeWidgetEmptyMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgeTopTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTopTrafficWidgetEmptyMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgeResourceUtilization.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeResourceUtilizationWidgetEmptyMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgePortTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTrafficByVolumeWidgetEmptyMockData))
        })
      )
    })

    it('Test case for EdgeUpTimeWidget No Data', async () => {
      render(
        <Provider>
          <EdgeUpTimeWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/uptime' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await waitFor(() => screen.findByText('No data to display'))
      expect(await screen.findByText(/No data to display/)).toBeVisible()
    })
    it('Test case for EdgePortsByTrafficWidget No Data', async () => {
      render(
        <Provider>
          <EdgePortsByTrafficWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/topTraffic' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await waitFor(() => screen.findByText('No data to display'))
      expect(await screen.findByText(/No data to display/)).toBeVisible() })
    it('Test case for EdgeTrafficByVolumeWidget No Data', async () => {
      render(
        <Provider>
          <EdgeTrafficByVolumeWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/traffic' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await waitFor(() => screen.findByText('No data to display'))
      expect(await screen.findByText(/No data to display/)).toBeVisible() })
    it('Test case for EdgeResourceUtilizationWidget No Data', async () => {
      render(
        <Provider>
          <EdgeResourceUtilizationWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/resources' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await waitFor(() => screen.findByText('No data to display'))
      expect(await screen.findByText(/No data to display/)).toBeVisible()
    })
  })

  describe('Test all Under Data', () => {
    beforeEach(() => {
      store.dispatch(edgeApi.util.resetApiState())
      mockServer.use(
        rest.post(EdgeUrlsInfo.getEdgeUpDownTime.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeUpTimeWidgetMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgeTopTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTopTrafficWidgetMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgeResourceUtilization.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeResourceUtilizationWidgetMockData))
        }),
        rest.post(EdgeUrlsInfo.getEdgePortTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTrafficByVolumeWidgetMockData))
        })
      )
    })

    it('Test case for EdgeUpTimeWidget Data', async () => {
      render(
        <Provider>
          <EdgeUpTimeWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/uptime' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(screen.queryByText(/No data to display/)).toBeNull()
    })
    it('Test case for EdgePortsByTrafficWidget Data', async () => {
      render(
        <Provider>
          <EdgePortsByTrafficWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/topTraffic' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(screen.queryByText(/No data to display/)).toBeNull()
    })
    it('Test case for EdgeTrafficByVolumeWidget Data', async () => {
      render(
        <Provider>
          <EdgeTrafficByVolumeWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/traffic' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(screen.queryByText(/No data to display/)).toBeNull()
    })
    it('Test case for EdgeResourceUtilizationWidget Data', async () => {
      render(
        <Provider>
          <EdgeResourceUtilizationWidget />
        </Provider>, {
          route: { params, path: '/edges/:serialNumber/resources' }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(screen.queryByText(/No data to display/)).toBeNull()
    })
  })
})