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

// TODO: mock icons for now, should use other way to mock svg
jest.mock('@acx-ui/icons', ()=>({
  Logo: () => <div data-testid='logo'/>,
  ArrowChevronLeft: () => <div data-testid='arrow-left'/>,
  ArrowChevronRight: () => <div data-testid='arrow-right'/>,
  AI: () => <div data-testid='ai'/>,
  AccountCircleOutlined: () => <div data-testid='acccount-circle-outlined'/>,
  AccountCircleSolid: () => <div data-testid='acccount-circle-solid'/>,
  CalendarDateOutlined: () => <div data-testid='calendar-date-outlined'/>,
  CalendarDateSolid: () => <div data-testid='calendar-date-solid'/>,
  ConfigurationOutlined: () => <div data-testid='configuration-outlined'/>,
  ConfigurationSolid: () => <div data-testid='configuration-solid'/>,
  DevicesOutlined: () => <div data-testid='devices-outlined'/>,
  DevicesSolid: () => <div data-testid='devices-solid'/>,
  LocationOutlined: () => <div data-testid='location-outlined'/>,
  LocationSolid: () => <div data-testid='location-solid'/>,
  NetworksOutlined: () => <div data-testid='networks-outlined'/>,
  NetworksSolid: () => <div data-testid='networks-solid'/>,
  ReportsOutlined: () => <div data-testid='reports-outlined'/>,
  ReportsSolid: () => <div data-testid='reports-solid'/>,
  ServicesOutlined: () => <div data-testid='services-outlined'/>,
  ServicesSolid: () => <div data-testid='services-solid'/>,
  SpeedIndicatorOutlined: () => <div data-testid='speed-indicator-outlined'/>,
  SpeedIndicatorSolid: () => <div data-testid='speed-indicator-solid'/>
}), { virtual: true })

describe('Layout', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<LayoutUI.DropdownText>Left header</LayoutUI.DropdownText>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
    await screen.findByTestId('ai')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render with custom tenant type correctly', async () => {
    const mspConfig = [
      {
        path: '/dashboard',
        name: 'Dashboard',
        tenantType: 'v' as TenantType,
        disableIcon: SpeedIndicatorOutlined,
        enableIcon: SpeedIndicatorSolid
      }
    ]
    const { asFragment } = render(<Layout
      menuConfig={mspConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
    await screen.findByTestId('speed-indicator-outlined')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should collapsed', async () => {
    render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, { route: true })
    await screen.findByTestId('ai')
    fireEvent.click(screen.getByText('Collapse'))
    await screen.findByTestId('arrow-right')
  })
  it('should render corresponding icons', async () => {
    render(<Layout
      menuConfig={menuConfig}
      leftHeaderContent={<div>Left header</div>}
      rightHeaderContent={<div>Right header</div>}
      content={<div>content</div>}
    />, {
      route: {
        path: '/t/:tenantId/:page',
        params: { tenantId: 't-id', page: 'dashboard' }
      }
    })
    await screen.findByTestId('ai')
    fireEvent.click(screen.getByTestId('acccount-circle-outlined'))
    await screen.findByTestId('acccount-circle-solid')
  })
})
