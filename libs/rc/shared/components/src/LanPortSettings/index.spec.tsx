import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen
} from '@acx-ui/test-utils'

import { LanPortSettings } from '.'

const selectedModelCaps = {
  canSupportPoeMode: true,
  canSupportPoeOut: false,
  model: 'R650'
}

const selectedPortCaps = {
  defaultType: 'TRUNK',
  id: '1',
  isPoeOutPort: false,
  isPoePort: false,
  supportDisable: true,
  trunkPortOnly: false,
  untagId: 1,
  vlanMembers: '1-4094'
}

const selectedModel = {
  lanPorts: [{
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }, {
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '2',
    enabled: true
  }],
  model: 'R650',
  poeMode: 'Auto',
  useVenueSettings: false
}

const params = {
  tenantId: 'tenant-id'
}

const lanData = [{
  type: 'TRUNK',
  untagId: 1,
  vlanMembers: '1-4094',
  portId: '2',
  enabled: true
}]

describe('LanPortSettings', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={false}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText('Enable port')
    expect(asFragment()).toMatchSnapshot()

    expect(screen.getByLabelText(/VLAN untag ID/)).toHaveValue('1')
    expect(screen.getByLabelText(/VLAN member/)).toHaveValue('1-4094')
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()

    fireEvent.mouseDown(screen.getByLabelText(/Port type/))
    await userEvent.click(screen.getAllByText('GENERAL')[1])
    fireEvent.change(screen.getByLabelText(/VLAN untag ID/), { target: { value: 2 } })
    fireEvent.change(screen.getByLabelText(/VLAN member/), { target: { value: '1-10' } })
  })

  it('should render read-only mode correctly', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={true}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText(/The following LAN Port settings can’t work because DHCP is enabled/)
    expect(screen.getByLabelText(/Port type/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()
  })

  it('should render correctly with trunk port untagged vlan toggle', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isTrunkPortUntagedVlanEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    expect(screen.getByLabelText(/Port type/)).toBeEnabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeEnabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/VLAN untag ID/), { target: { value: 2 } })
    expect(screen.getByLabelText(/VLAN member/).value).toBe('1-4094')
  })

  it('should render read-only mode correctly with trunk port untagged vlan toggle', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={true}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={true}
          isTrunkPortUntagedVlanEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText(/The following LAN Port settings can’t work because DHCP is enabled/)
    expect(screen.getByLabelText(/Port type/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()
  })
})
