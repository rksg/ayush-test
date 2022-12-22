import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { PortsContext }       from '..'
import { mockEdgePortConfig } from '../../../../__tests__/fixtures'

import PortsGeneral from '.'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

const mockContextValue = {
  ports: mockEdgePortConfig.ports,
  setPorts: jest.fn()
}

describe('EditEdge ports - ports general', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      )
    )
  })
  it('should active ports general successfully', async () => {
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
  })

})