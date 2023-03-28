import '@testing-library/jest-dom'

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
  it('should render correctly', async () => {
    const { asFragment } = render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
    await screen.findByTestId('AIOutlined')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render with custom tenant type correctly', async () => {
    const mspConfig = [
      {
        path: '/dashboard',
        name: 'Dashboard',
        tenantType: 'v' as TenantType,
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid
      }
    ]
    const { asFragment } = render(<Layout
      menuConfig={mspConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
    await screen.findByTestId('SpeedIndicatorOutlined')
    await screen.findByRole('menuitem', {
      name: (name, element) => name === 'Dashboard' &&
        (element as HTMLElement).hasAttribute('data-menu-id')
    })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should collapsed', async () => {
    render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
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
    />, {
      route: {
        path: '/:tenantId/t/:page',
        params: { tenantId: 't-id', page: 'dashboard' }
      }
    })
    await screen.findByTestId('AIOutlined')
    fireEvent.click(screen.getByTestId('AccountCircleOutlined'))
    await screen.findByTestId('AccountCircleSolid')
  })
  it('should show tooltip when disabled', async () => {
    const { asFragment } = render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, {
      route: {
        path: '/:tenantId/t/:page',
        params: { tenantId: 't-id', page: 'dashboard' }
      }
    })
    await screen.findByTestId('AIOutlined')
    fireEvent.mouseOver(screen.getByTestId('AccountCircleOutlined'))
    await screen.findByRole('tooltip', { hidden: true })
    expect(asFragment()).toMatchSnapshot()
  })
})
