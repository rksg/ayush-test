import '@testing-library/react'
import '@testing-library/jest-dom'


import { rest } from 'msw'

import { edgeApi }                                                         from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor,  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import * as EdgeTestCase from './__test__/fixture'

import { EdgePortsByTrafficWidget } from './'


const params = {
  serialNumber: '962604D7DCEEE011ED9715000C2949F53E'
}

describe('Test all Edge Statistic Widget', () => {
  describe('Test all Under No Data', () => {
    beforeEach(() => {
      store.dispatch(edgeApi.util.resetApiState())
      mockServer.use(
        rest.post(EdgeUrlsInfo.getEdgeTopTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTopTrafficWidgetEmptyMockData))
        })
      )
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
  })

  describe('Test all Under Data', () => {
    beforeEach(() => {
      store.dispatch(edgeApi.util.resetApiState())
      mockServer.use(
        rest.post(EdgeUrlsInfo.getEdgeTopTraffic.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeTopTrafficWidgetMockData))
        })
      )
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
  })
})