import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import {
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'
import { TenantType }                from '@acx-ui/react-router-dom'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import menuConfig   from './stories/menuConfig'
import { LayoutUI } from './styledComponents'

import { Layout } from '.'

describe('Layout', () => {
  const route = {
    path: '/:tenantId/:tenantType/:page',
    params: { tenantType: 't', tenantId: 't-id', page: 'dashboard' },
    wrapRoutes: false
  }
  it('should render correctly', async () => {
    const { asFragment } = render(<Layout
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
      menuConfig={mspConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: { ...route, params: { ...route.params, tenantType: 'v' } } })
    await screen.findByTestId('SpeedIndicatorOutlined')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should collapsed', async () => {
    render(<Layout
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
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route })
    await userEvent.hover(screen.getByTestId('AccountCircleOutlined'))
    await userEvent.click(await screen.findByRole('link', { name: 'Wireless Clients List' }))
    await screen.findByTestId('AccountCircleSolid')
  })
})
