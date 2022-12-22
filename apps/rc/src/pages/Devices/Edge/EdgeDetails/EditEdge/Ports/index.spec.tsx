import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgePortConfig } from '../../../__tests__/fixtures'

import Ports from '.'

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

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EditEdge ports', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      )
    )
  })

  it('should active ports general successfully', async () => {
    params.activeSubTab = 'ports-general'
    render(
      <Provider>
        <Ports />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('tab', {
      name: 'Ports General', selected: true
    })
  })

  it('should active sub-interface successfully', async () => {
    params.activeSubTab = 'sub-interface'
    render(
      <Provider>
        <Ports />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('tab', {
      name: 'Sub-interface', selected: true
    })
  })

  it('switch tab', async () => {
    params.activeSubTab = 'ports-general'
    const user = userEvent.setup()
    render(
      <Provider>
        <Ports />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('tab', { name: 'Sub-interface' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edit/ports/sub-interface`,
      hash: '',
      search: ''
    })
  })

})