

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import Settings from './index'

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

describe('EditEdge settings', () => {

  let params: { tenantId: string, serialNumber: string, activeTab: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030',
      activeTab: 'settings'
    }
  })

  it('Render ports tab successfully', async () => {
    params.activeSubTab = 'ports'
    const { asFragment } = render(
      <Settings />, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('Render dns tab successfully', async () => {
    params.activeSubTab = 'dns'
    const { asFragment } = render(
      <Settings />, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('Render routes tab successfully', async () => {
    params.activeSubTab = 'routes'
    const { asFragment } = render(
      <Settings />, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('Tab Change', async () => {
    const user = userEvent.setup()
    params.activeSubTab = 'routes'
    render(
      <Settings />, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('tab', { name: 'DNS Server' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edit/settings/dns`,
      hash: '',
      search: ''
    })
  })
})