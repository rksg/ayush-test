import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import * as config      from '@acx-ui/config'
import {
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'
import { TenantType }                              from '@acx-ui/react-router-dom'
import { fireEvent, act, render, screen, waitFor } from '@acx-ui/test-utils'

import menuConfig   from './stories/menuConfig'
import { LayoutUI } from './styledComponents'

import { Layout } from '.'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

describe('Layout', () => {
  const route = {
    path: '/:tenantId/:tenantType/:page',
    params: { tenantType: 't', tenantId: 't-id', page: 'dashboard' },
    wrapRoutes: false
  }

  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })

  afterEach(() => {
    get.mockReturnValue('')
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })
    await screen.findByTestId('AIOutlined')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render with custom tenant type correctly', async () => {
    const mspConfig = [{
      label: 'My Customers',
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid,
      children: [
        {
          uri: '/dashboard/mspCustomers',
          tenantType: 'v' as TenantType,
          label: 'MSP Customers'
        }
      ]
    }]
    const { asFragment } = render(<Layout
      logo={<div />}
      menuConfig={mspConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: { ...route, params: { ...route.params, tenantType: 'v' } } })
    await screen.findByTestId('SpeedIndicatorOutlined')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should collapse', async () => {
    render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })
    await screen.findByTestId('AIOutlined')
    fireEvent.click(screen.getByText('Collapse'))
    await screen.findByTestId('ArrowChevronRight')
  })
  it('should render corresponding icons', async () => {
    render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })
    await userEvent.hover(screen.getByTestId('AccountCircleOutlined'))
    await userEvent.click(await screen.findByRole('link', { name: 'Wireless Clients List' }))
    await screen.findByTestId('AccountCircleSolid')
  })
  it('renders MLISA Stand Alone menu with highlighted item', async () => {
    get.mockReturnValue('true')
    const config = [
      null,
      {
        uri: '/dashboard',
        label: 'Dashboard',
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid
      }
    ]
    render(<Layout
      logo={<div />}
      menuConfig={config}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, {
      route: {
        path: '/analytics/next/dashboard',
        params: { page: 'dashboard' },
        wrapRoutes: false
      }
    })
    await screen.findByTestId('SpeedIndicatorSolid')
  })
  it('should render correctly when adminItem = true', () => {
    const config = [
      {
        uri: '/dashboard',
        label: 'Dashboard',
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid,
        adminItem: true
      }
    ]
    const { asFragment } = render(<Layout
      logo={<div />}
      menuConfig={config}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, {
      route: {
        path: '/analytics/next/dashboard',
        params: { page: 'dashboard' },
        wrapRoutes: false
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when isOpenTab = true', () => {
    get.mockReturnValue('true')
    const config = [
      {
        uri: '/dashboard',
        label: 'Dashboard',
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid,
        isOpenInTab: true
      }
    ]
    const { asFragment } = render(<Layout
      logo={<div />}
      menuConfig={config}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, {
      route: {
        path: '/analytics/next/dashboard',
        params: { page: 'dashboard' },
        wrapRoutes: false
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when innerWidth >= 1280', async () => {
    render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      global.window.innerWidth = 500
      fireEvent(global.window, new Event('resize'))
      global.window.innerWidth = 1280
      fireEvent(global.window, new Event('resize'))
    })
    await waitFor(() => screen.findByText('Left header'))
  })
  it('should render correctly when innerWidth < 1280', async () => {
    render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      global.window.innerWidth = 500
      fireEvent(global.window, new Event('resize'))
    })
    await waitFor(() => screen.findByText('Hey, you are missing the bigger picture'))
    const subOptimalButton = await screen.findByTestId('subOptimalButton')
    await userEvent.click(subOptimalButton)
    localStorage.setItem('acx-ui-view-suboptimal-display', 'true')
    await waitFor(() => screen.findByText('Left header'))
  })
  it('should render correctly when acx-ui-view-suboptimal-display is not exist', async () => {
    localStorage.removeItem('acx-ui-view-suboptimal-display')
    render(<Layout
      logo={<div />}
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      global.window.innerWidth = 500
      fireEvent(global.window, new Event('resize'))
    })
    await waitFor(() => screen.findByText('Hey, you are missing the bigger picture'))
  })
})
