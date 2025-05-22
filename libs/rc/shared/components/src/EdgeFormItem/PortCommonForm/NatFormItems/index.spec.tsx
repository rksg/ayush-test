import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Button }                                                                                     from '@acx-ui/components'
import { ClusterHighAvailabilityModeEnum, EdgePort, EdgePortConfigFixtures, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider }                                                                                   from '@acx-ui/store'
import { render, screen, waitFor }                                                                    from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../../useEdgeActions'

import { EdgeNatFormItems, NatFormItemsProps } from './index'
const { mockEdgePortConfig } = EdgePortConfigFixtures

jest.mock('../../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))
jest.mock('../../../ApCompatibility/ApCompatibilityToolTip', () => ({
  ApCompatibilityToolTip: (props: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip'>
      <button onClick={props.onClick}>See compatibility</button>
    </div>
}))

jest.mock('../../../Compatibility/Edge/EdgeCompatibilityDrawer', () => ({
  ...jest.requireActual('../../../Compatibility/Edge/EdgeCompatibilityDrawer'),
  EdgeCompatibilityDrawer: (props: { featureName: string, onClose: () => void }) =>
    <div data-testid='EdgeCompatibilityDrawer'>
      <span>Feature:{props.featureName}</span>
      <button onClick={props.onClose}>Close</button>
    </div>
}))

const defaultProps = {
  parentNamePath: [],
  getFieldFullPath: (name: string) => [name],
  formFieldsProps: {},
  clusterInfo: { highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY },
  portsData: [],
  lagData: []
} as NatFormItemsProps

const mockOnFinish = jest.fn()
const currentPort = mockEdgePortConfig.ports[0] as EdgePort
// eslint-disable-next-line max-len
const MockComponent = (props: Partial<NatFormItemsProps> & { initialValues?: Partial<EdgePort> }) => {
  const { initialValues, ...otherProps } = props

  return <Provider>
    <Form initialValues={{ ...currentPort, ...initialValues }} onFinish={mockOnFinish}>
      <EdgeNatFormItems {...defaultProps} {...otherProps}/>
      <Button htmlType='submit'>Submit</Button>
    </Form>
  </Provider>
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

    it('should correctly submit when both of start and end IP are well formatted', async () => {
      render(<MockComponent />)

      const { startInput, endInput } = await natPoolTestPreparation()

      await userEvent.type(startInput, '1.1.2.2')
      await userEvent.type(endInput, '1.1.2.20')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(mockOnFinish).toBeCalledWith({
        natEnabled: true,
        natPools: [{ startIpAddress: '1.1.2.2', endIpAddress: '1.1.2.20' }]
      }))
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    })

    it('does not render NAT IP Addresses Range if HA mode is not ACTIVE_STANDBY', async () => {
      render(<MockComponent
        clusterInfo={{ highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE }}
      />)

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
      render(<MockComponent />)

      const { startInput, endInput } = await natPoolTestPreparation()

      await userEvent.type(startInput, '1.1.1.100')
      await userEvent.type(endInput, '1.1.1.1')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByRole('alert')
      await screen.findByText('Start IP cannot larger or equal to end IP')
    })

    it('correctly block when pool range size > over maximum', async () => {
      render(<MockComponent />)

      const { startInput, endInput } = await natPoolTestPreparation()

      await userEvent.type(startInput, '1.1.1.5')
      await userEvent.type(endInput, '1.1.1.200')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByRole('alert')
      await screen.findByText('NAT IP address range exceeds maximum size 128')
    })

    it('correctly block when pool ranges are overlapped', async () => {
      render(<MockComponent
        portsData={[{
          ...currentPort,
          id: 'mock-port0-id',
          interfaceName: 'port0',
          natPools: [
            { startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }
          ] }]}
      />)

      const { startInput, endInput } = await natPoolTestPreparation()

      await userEvent.type(startInput, '1.1.1.10')
      await userEvent.type(endInput, '1.1.1.20')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByRole('alert')
      await screen.findByText('The selected NAT pool overlaps with other NAT pools')
    })


    it('should block when one of start and end IP is empty', async () => {
      render(<MockComponent
        initialValues={{
          natEnabled: true,
          natPools: [{ startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }]
        }}
      />)

      expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
      // Simulate enabling NAT
      const natSwitch = screen.getByRole('switch')
      await waitFor(() => expect(natSwitch).toBeChecked())

      await screen.findByText('NAT IP Addresses Range')
      const inputs = screen.getAllByRole('textbox')

      const startIp = inputs[0]
      expect(startIp).toHaveValue('1.1.1.5')

      await userEvent.clear(startIp)
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      const alertMsg = await screen.findByRole('alert')
      expect(alertMsg).toBeInTheDocument()
      expect(alertMsg.textContent).toEqual('Invalid NAT pool start or end IP')
      expect(mockOnFinish).not.toBeCalled()
    })

    it('should be ok when both of start and end IP is empty', async () => {
      render(<MockComponent
        initialValues={{
          natEnabled: true,
          natPools: [{ startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }]
        }}
      />)

      expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
      // Simulate enabling NAT
      const natSwitch = screen.getByRole('switch')
      await waitFor(() => expect(natSwitch).toBeChecked())

      await screen.findByText('NAT IP Addresses Range')
      const inputs = screen.getAllByRole('textbox')
      const startIp = inputs[0]
      expect(startIp).toHaveValue('1.1.1.5')
      const endIp = inputs[1]
      expect(endIp).toHaveValue('1.1.1.10')

      await userEvent.clear(startIp)
      await userEvent.clear(endIp)
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(mockOnFinish).toBeCalledWith({
        natEnabled: true,
        natPools: [{ startIpAddress: '', endIpAddress: '' }]
      }))
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    })

    it('should be ok when both of start and end IP is empty - no origin pool data', async () => {
      render(<MockComponent
        initialValues={{
          natEnabled: true
        }}
      />)

      expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
      // Simulate enabling NAT
      const natSwitch = screen.getByRole('switch')
      await waitFor(() => expect(natSwitch).toBeChecked())

      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(mockOnFinish).toBeCalledWith({
        natEnabled: true,
        natPools: [{ startIpAddress: '', endIpAddress: '' }]
      }))
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    })

    it('should block when IP format is invalid', async () => {
      render(<MockComponent
        initialValues={{
          natEnabled: true,
          natPools: [{ startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }]
        }}
      />)

      expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
      // Simulate enabling NAT
      const natSwitch = screen.getByRole('switch')
      await waitFor(() => expect(natSwitch).toBeChecked())

      await screen.findByText('NAT IP Addresses Range')
      const inputs = screen.getAllByRole('textbox')
      const startIp = inputs[0]
      expect(startIp).toHaveValue('1.1.1.5')

      // change into 1.1.1.5555
      await userEvent.type(startIp, '555')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await screen.findByRole('alert')
      await screen.findByText('Please enter a valid IP address')
    })

    it('correctly handles undefined lagData', async () => {
      render(<Form>
        <EdgeNatFormItems
          {...defaultProps}
          lagData={undefined}
        />
        <Button htmlType='submit'>Submit</Button>
      </Form>)

      const { startInput, endInput } = await natPoolTestPreparation()

      await userEvent.type(startInput, '1.1.1.5')
      await userEvent.type(endInput, '1.1.1.200')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByRole('alert')
      await screen.findByText('NAT IP address range exceeds maximum size 128')
    })

    it('should show "Multi NAT IP" compatibility component', async () => {
      render(<MockComponent />)

      await natPoolTestPreparation()
      const compatibilityToolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(compatibilityToolTips.length).toBe(1)
      compatibilityToolTips.forEach(t => expect(t).toBeVisible())
      await userEvent.click(compatibilityToolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.MULTI_NAT_IP)
    })

    describe('LAG has existing NAT pool', () => {
      it('should be blocked when overlapped with existing LAG NAT pool', async () => {
        render(<MockComponent
          lagData={[{ natPools: [{ startIpAddress: '1.1.1.5', endIpAddress: '1.1.1.10' }] }]}
        />)

        const { startInput, endInput } = await natPoolTestPreparation()

        await userEvent.type(startInput, '1.1.1.7')
        await userEvent.type(endInput, '1.1.1.30')
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
        await screen.findByRole('alert')
        await screen.findByText('The selected NAT pool overlaps with other NAT pools')
      })
    })
  })
})

const natPoolTestPreparation = async () => {
  expect(screen.getByText('Use NAT Service')).toBeInTheDocument()
  // Simulate enabling NAT
  const natSwitch = screen.getByRole('switch')
  await userEvent.click(natSwitch)

  await screen.findByText('NAT IP Addresses Range')
  const inputs = screen.getAllByRole('textbox')
  return { startInput: inputs[0], endInput: inputs[1] }
}