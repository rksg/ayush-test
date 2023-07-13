import '@testing-library/react'
import '@testing-library/jest-dom'


import { rest } from 'msw'

import { edgeApi }                                                         from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor,  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import * as EdgeTestCase from './__test__/fixture'

import { EdgeResourceUtilizationWidget } from './'


const params = {
  serialNumber: '962604D7DCEEE011ED9715000C2949F53E'
}

describe('Test all Edge Statistic Widget', () => {
  describe('Test all Under No Data', () => {
    beforeEach(() => {
      store.dispatch(edgeApi.util.resetApiState())
      mockServer.use(
        rest.post(EdgeUrlsInfo.getEdgeResourceUtilization.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeResourceUtilizationWidgetEmptyMockData))
        })
      )
    })
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
        rest.post(EdgeUrlsInfo.getEdgeResourceUtilization.url, (req, res, ctx) => {
          return res(ctx.json(EdgeTestCase.EdgeResourceUtilizationWidgetMockData))
        })
      )
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