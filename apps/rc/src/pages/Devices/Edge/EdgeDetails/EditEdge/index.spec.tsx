import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeData } from '../../__tests__/fixtures'

import EditEdge from './index'

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

jest.mock('./GeneralSettings', () => () => {
  return <div data-testid='general-settings' />
})

jest.mock('./Settings', () => () => {
  return <div data-testid='settings' />
})

describe('EditEdge', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030'
    }
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      )
    )
  })

  it('should create EditEdge successfully', async () => {
    params.activeTab = 'general-settings'
    const { asFragment } = render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab' }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('switch tab', async () => {
    params.activeTab = 'general-settings'
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab' }
      })
    await user.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edit/settings/ports`,
      hash: '',
      search: ''
    })
  })
})