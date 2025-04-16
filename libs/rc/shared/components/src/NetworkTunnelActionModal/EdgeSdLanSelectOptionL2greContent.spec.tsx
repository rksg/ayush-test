import { render, screen } from '@testing-library/react'
import { Form }           from 'antd'
import { MemoryRouter }   from 'react-router-dom'

import { EdgeMvSdLanViewData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { EdgeSdLanSelectOptionL2greContent } from './EdgeSdLanSelectOptionL2greContent'

// Mock all required dependencies
jest.mock('@acx-ui/edge/components', () => ({
  useGetAvailableTunnelProfile: jest.fn(() => ({
    isDataLoading: false,
    availableTunnelProfiles: [
      { id: 'tunnel1', name: 'Tunnel 1', tunnelType: 'VXLAN_GPE' },
      { id: 'tunnel2', name: 'Tunnel 2', tunnelType: 'VXLAN_GPE' }
    ]
  })),
  transToOptions: jest.fn((profiles) =>
    profiles.map((p: { name: string; id: string }) => ({ label: p.name, value: p.id }))
  )
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  getServiceDetailsLink: jest.fn(() => '/service-details'),
  getPolicyDetailsLink: jest.fn(() => '/policy-details'),
  getServiceRoutePath: jest.fn(() => '/service-path'),
  useHelpPageLink: jest.fn(() => '/help-page')
}))

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})

describe('EdgeSdLanSelectOptionL2greContent', () => {
  const defaultProps = {
    venueSdLan: {
      id: 'sdlan1',
      name: 'Test Sdlan',
      tunnelProfileId: 'profile1',
      tunnelProfileName: 'Test Profile',
      tunneledWlans: []
    } as EdgeMvSdLanViewData | undefined,
    networkType: NetworkTypeEnum.CAPTIVEPORTAL,
    hasVlanPool: false
  }

  const renderComponent = (props = defaultProps) => {
    return render(
      <MemoryRouter>
        <Form>
          <EdgeSdLanSelectOptionL2greContent {...props} />
        </Form>
      </MemoryRouter>
    )
  }

  it('should render with existing venue SD-LAN', () => {
    renderComponent()

    expect(screen.getByText('Test Sdlan')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Test Profile')).toBeInTheDocument()
    expect(screen.getByText('Tunnel the traffic to a central location')).toBeInTheDocument()
  })

  it('should render help link when venue SD-LAN does not exist', () => {
    renderComponent({
      ...defaultProps,
      venueSdLan: undefined
    })

    expect(screen.getByText('See more information')).toBeInTheDocument()
  })

  it('should filter out VXLAN-GPE options for non-CAPTIVEPORTAL networks', () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.DPSK
    })

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    // Should only see GRE option and Core Port
    expect(screen.queryByText('Tunnel 2')).not.toBeInTheDocument()
  })
})