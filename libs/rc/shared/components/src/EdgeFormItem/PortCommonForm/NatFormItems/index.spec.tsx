import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Button }                          from '@acx-ui/components'
import { ClusterHighAvailabilityModeEnum } from '@acx-ui/rc/utils'
import { render, screen, waitFor }         from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../../useEdgeActions'

import { EdgeNatFormItems, NatFormItemsProps } from './index'

jest.mock('../../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))

const defaultProps = {
  parentNamePath: [],
  getFieldFullPath: (name: string) => [name],
  formFieldsProps: {},
  clusterInfo: { highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY },
  portsData: [],
  lagData: []
} as NatFormItemsProps

const MockComponent = (props: Partial<NatFormItemsProps>) => {
  return <Form initialValues={{ id: 'mock-port1-id', interfaceName: 'port1' }}>
    <EdgeNatFormItems {...defaultProps} {...props}/>
    <Button htmlType='submit'>Submit</Button>
  </Form>
}

describe('EdgeNatFormItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders NAT switch when multi NAT IP is disabled', () => {
    render(
      <Form>
        <EdgeNatFormItems {...defaultProps} />
      </Form>
    )
    expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
    // Should not render NAT IP Addresses Range
    expect(screen.queryByText('NAT IP Addresses Range')).not.toBeInTheDocument()
  })

  describe('NAT IP Addresses Range', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    })

    // eslint-disable-next-line max-len
    it('renders NAT switch and NAT IP Addresses Range when multi NAT IP is enabled and HA mode is ACTIVE_STANDBY', async () => {
      render(
        <Form>
          <EdgeNatFormItems {...defaultProps} />
        </Form>
      )

      await natPoolTestPreparation()
      expect(screen.getByText('NAT IP Addresses Range')).toBeInTheDocument()
    })

    it('does not render NAT IP Addresses Range if HA mode is not ACTIVE_STANDBY', async () => {
      render(
        <Form>
          <EdgeNatFormItems
            {...defaultProps}
            clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE }}
          />
        </Form>
      )
      expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
      // Simulate enabling NAT
      const natSwitch = screen.getByRole('switch')
      await userEvent.click(natSwitch)
      await waitFor(() => {
        expect(natSwitch).toBeChecked()
      })
      expect(screen.queryByText('NAT IP Addresses Range')).toBeNull()
    })

    it('correctly block when pool range is invalid', async () => {
      render(<MockComponent
        clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY }}
      />)

      await natPoolTestPreparation()
      const startIp = screen.getByRole('textbox', { name: 'Start' })
      const endIp = screen.getByRole('textbox', { name: 'End' })

      await userEvent.type(startIp, '1.1.1.100')
      await userEvent.type(endIp, '1.1.1.1')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      const alertMsg = await screen.findByRole('alert')
      expect(alertMsg).toBeInTheDocument()
      expect(alertMsg.textContent).toEqual('Invalid NAT pool start IP and end IP')
    })

    it('correctly block when pool range size > over maximum', async () => {
      render(<MockComponent
        clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY }}
      />)

      await natPoolTestPreparation()
      const startIp = screen.getByRole('textbox', { name: 'Start' })
      const endIp = screen.getByRole('textbox', { name: 'End' })

      await userEvent.type(startIp, '1.1.1.5')
      await userEvent.type(endIp, '1.1.1.200')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      const alertMsg = await screen.findByRole('alert')
      expect(alertMsg).toBeInTheDocument()
      expect(alertMsg.textContent).toEqual('NAT IP address range exceeds maximum size 128')
    })

    it('correctly block when pool ranges are overlapped', async () => {
      render(<MockComponent
        portsData={[{
          id: 'mock-port0-id',
          interfaceName: 'port0',
          natPools: [
            { startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }
          ] }]}
        clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY }}
      />)

      await natPoolTestPreparation()
      const startIp = screen.getByRole('textbox', { name: 'Start' })
      const endIp = screen.getByRole('textbox', { name: 'End' })

      await userEvent.type(startIp, '1.1.1.10')
      await userEvent.type(endIp, '1.1.1.20')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      const alertMsg = await screen.findByRole('alert')
      expect(alertMsg).toBeInTheDocument()
      expect(alertMsg.textContent).toEqual('The selected NAT pool overlaps with other NAT pools')
    })

    it('correctly handles undefined lagData', async () => {
      render(<Form>
        <EdgeNatFormItems
          parentNamePath={[]}
          getFieldFullPath={(name: string) => [name]}
          formFieldsProps={{}}
          portsData={[]}
          lagData={undefined}
          clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY }}
        />
        <Button htmlType='submit'>Submit</Button>
      </Form>)

      await natPoolTestPreparation()
      const startIp = screen.getByRole('textbox', { name: 'Start' })
      const endIp = screen.getByRole('textbox', { name: 'End' })

      await userEvent.type(startIp, '1.1.1.5')
      await userEvent.type(endIp, '1.1.1.200')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      const alertMsg = await screen.findByRole('alert')
      expect(alertMsg).toBeInTheDocument()
      expect(alertMsg.textContent).toEqual('NAT IP address range exceeds maximum size 128')
    })
  })
})

const natPoolTestPreparation = async () => {
  expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
  // Simulate enabling NAT
  const natSwitch = screen.getByRole('switch')
  await userEvent.click(natSwitch)

  await screen.findByText('NAT IP Addresses Range')
}