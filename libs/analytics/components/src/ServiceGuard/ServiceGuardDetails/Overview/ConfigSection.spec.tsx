import { render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest }                                      from '../../__tests__/fixtures'
import { AuthenticationMethod, ServiceGuardConfig, ServiceGuardTest } from '../../types'

import { ConfigSection } from './ConfigSection'

describe('Overview component', () => {
  it('should render correctly', () => {
    render(<ConfigSection
      details={fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest}/>)
    expect(screen.queryByText('Network')).toBeVisible()
    expect(screen.queryByText('Radio Band')).toBeVisible()
    expect(screen.queryByText('Authentication Method')).toBeVisible()
    expect(screen.queryByText('DNS Server')).toBeVisible()
    expect(screen.queryByText('Ping Destination Address')).toBeVisible()
    expect(screen.queryByText('Traceroute Destination Address')).toBeVisible()
    expect(screen.queryByText('Speed Test')).toBeVisible()

    expect(screen.queryByText('Wifi Name')).toBeVisible()
    expect(screen.queryByText('2.4 GHz')).toBeVisible()
    expect(screen.queryAllByText('Pre-Shared Key (PSK)')).toHaveLength(2)
    expect(screen.queryByText('********')).toBeVisible()
    expect(screen.queryByText('1.1.1.1')).toBeVisible()
    expect(screen.queryAllByText('google.com')).toHaveLength(2)
    expect(screen.queryByText('Enabled')).toBeVisible()
  })
  it('should render correctly when no value', () => {
    render(<ConfigSection
      details={{
        ...fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest,
        config: {} as ServiceGuardConfig
      }}/>)
    expect(screen.queryByText('Network')).toBeVisible()
    expect(screen.queryByText('Radio Band')).toBeVisible()
    expect(screen.queryByText('Authentication Method')).toBeVisible()
    expect(screen.queryByText('DNS Server')).toBeVisible()
    expect(screen.queryByText('Ping Destination Address')).toBeVisible()
    expect(screen.queryByText('Traceroute Destination Address')).toBeVisible()
    expect(screen.queryByText('Speed Test')).toBeVisible()

    expect(screen.queryAllByText('Unknown')).toHaveLength(3)
    expect(screen.queryByText('Default')).toBeVisible()
    expect(screen.queryAllByText('(not set)')).toHaveLength(2)
    expect(screen.queryByText('Disabled')).toBeVisible()
  })
  it('should show fields - WPA2_ENTERPRISE', () => {
    render(<ConfigSection
      details={{
        ...fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest,
        config: {
          ...fetchServiceGuardTest.serviceGuardTest.config,
          authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE
        } as ServiceGuardConfig
      }}/>)

    expect(screen.queryAllByText('Enterprise AAA (802.1X)')).toHaveLength(3)
    expect(screen.queryByText('my-user-name')).toBeVisible()
    expect(screen.queryByText('********')).toBeVisible()
  })
  it('should show fields - OPEN_AUTH', () => {
    render(<ConfigSection
      details={{
        ...fetchServiceGuardTest.serviceGuardTest as unknown as ServiceGuardTest,
        config: {
          ...fetchServiceGuardTest.serviceGuardTest.config,
          authenticationMethod: AuthenticationMethod.OPEN_AUTH
        } as ServiceGuardConfig
      }}/>)

    expect(screen.queryByText('Open Network')).toBeVisible()
    expect(screen.queryByText('********')).toBeNull()
  })
})
