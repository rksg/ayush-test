import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { EdgeEditContext }                        from '..'
import { mockEdgePortConfig, mockEdgePortStatus } from '../../../__tests__/fixtures'

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

jest.mock('./SubInterface', () => ({
  ...jest.requireActual('./SubInterface'),
  default: () => <div data-testid='rc-edge-subInterface'></div>
}))

const defaultContextData = {
  activeSubTab: {
    key: 'ports-general',
    title: 'Ports General'
  },
  formControl: {
    isDirty: false,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

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
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      )
    )
  })

  it('should active ports general successfully', async () => {
    params.activeSubTab = 'ports-general'
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('tab', {
      name: 'Sub-Interface', selected: true
    })
  })

  it ('IP status on each port tab should be displayed correctly', async () => {
    const user = userEvent.setup()
    params.activeSubTab = 'ports-general'
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    for (let i = 0; i < mockEdgePortConfig.ports.length; ++i) {
      await user.click(await screen.findByRole('radio', { name: 'Port ' + (i + 1) }))
      const expectedIp = mockEdgePortStatus[i]?.ip || 'N/A'
      await screen.findByText(
        'IP Address: ' + expectedIp + ' | ' +
          'MAC Address: ' + mockEdgePortConfig.ports[i].mac)

    }
  })

  it('switch tab', async () => {
    params.activeSubTab = 'ports-general'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('tab', { name: 'Sub-Interface' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/ports/sub-interface`,
      hash: '',
      search: ''
    })
  })

})