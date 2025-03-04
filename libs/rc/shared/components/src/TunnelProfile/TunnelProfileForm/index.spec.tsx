import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Features, useIsBetaEnabled }                                 from '@acx-ui/feature-toggle'
import { getTunnelProfileFormDefaultValues, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                                 from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { TunnelProfileForm } from './index'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('../../ApCompatibility/ApCompatibilityToolTip', () => ({
  ApCompatibilityToolTip: (props: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip'>
      <button onClick={props.onClick}>See compatibility</button>
    </div>
}))

jest.mock('../../Compatibility/Edge/EdgeCompatibilityDrawer', () => ({
  ...jest.requireActual('../../Compatibility/Edge/EdgeCompatibilityDrawer'),
  EdgeCompatibilityDrawer: (props: { featureName: string, onClose: () => void }) =>
    <div data-testid='EdgeCompatibilityDrawer'>
      <span>Feature:{props.featureName}</span>
      <button onClick={props.onClose}>Close</button>
    </div>
}))

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

describe('TunnelProfileForm', () => {
  const defaultValues = getTunnelProfileFormDefaultValues()

  it('should render TunnelProfileForm successfully', () => {
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )

    expect(screen.getByRole('textbox', { name: 'Profile Name' })).toBeVisible()
    // screen.getByRole('combobox', { name: 'Tags' })
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Manual' })).toBeVisible()
    expect(screen.getByRole('switch')).toBeVisible()
    expect(screen.getByText('Tunnel Idle Timeout')).toBeVisible()
    expect(screen.getByRole('spinbutton')).toBeVisible()
  })

  it('should show MTU size field when select Manual', async () => {
    const user = userEvent.setup()
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )
    await user.click(screen.getByRole('radio', { name: 'Manual' }))
    const spinBtns = await screen.findAllByRole('spinbutton') // MTU size / idleTime unit
    expect(spinBtns.length).toBe(2)
    expect(spinBtns.filter(i => i.id === 'mtuSize').length).toBe(1)
    expect(screen.getByText(/Please check Ethernet MTU on AP/i)).toBeVisible()
  })

  it('should show error when ageTime is invalid', async () => {
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton')

    await userEvent.clear(ageTimeInput)
    await userEvent.type(ageTimeInput, '1')
    expect(await screen.findByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
      .toBeVisible()

    await userEvent.clear(ageTimeInput)
    await userEvent.type(ageTimeInput, '10081')
    expect(await screen.findByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
      .toBeVisible()
  })

  it('should trigger ageTime validate when change unit', async () => {
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton')
    await userEvent.clear(ageTimeInput)
    await userEvent.type(ageTimeInput, '5')
    const ageTimeUnitSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(
      ageTimeUnitSelect,
      await screen.findByRole('option', { name: 'Week' })
    )
    expect(await screen.findByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
      .toBeVisible()
  })

  it('Input invalid profile name will show error message', async () => {
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await userEvent.type(profileNameField, '``')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.'))
      .toBeVisible()
  })

  it('should correctly lock fields', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff =>(ff === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))

    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldValue('disabledFields', [
        'name',
        'mtuType',
        'mtuSize',
        'forceFragmentation',
        'ageTimeMinutes',
        'ageTimeUnit',
        'type',
        'natTraversalEnabled'
      ])
      return form
    })

    render(
      <Form form={formRef.current} initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )

    expect(await screen.findByRole('textbox', { name: 'Profile Name' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Manual' })).toBeDisabled()
    const switchBtns = screen.getAllByRole('switch')
    const fragmentSwitch = switchBtns.find(btn => btn.id === 'forceFragmentation')
    expect(fragmentSwitch).toBeDisabled()
    expect(screen.getByRole('spinbutton')).toBeDisabled()
    expect(screen.getByRole('combobox')).toBeDisabled()
    const natTraversalSwitch = switchBtns.find(btn => btn.id === 'natTraversalEnabled')
    expect(natTraversalSwitch).toBeDisabled()
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('MTU help message should only display when manual', async () => {
    render(
      <Form initialValues={defaultValues}>
        <TunnelProfileForm />
      </Form>
    )

  })


  describe('when SD-LAN is ready and Keep Alive is not ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
    })

    it('should correctly set tunnel type', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        form.setFieldValue('disabledFields', undefined)
        return form
      })

      render(
        <Form form={formRef.current}>
          <TunnelProfileForm />
        </Form>
      )

      const typeField = await screen.findByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).not.toBeDisabled()
      expect(screen.queryByText('Network Segment Type')).not.toBeInTheDocument()
      await userEvent.selectOptions(
        typeField,
        await screen.findByRole('option', { name: 'VxLAN' })
      )
    })

    it('should lock tunnel type when the disableTunnelType is true', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        form.setFieldValue('disabledFields', ['type'])
        return form
      })

      render(
        <Form form={formRef.current}>
          <TunnelProfileForm />
        </Form>
      )

      const typeField = await screen.findByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).toBeDisabled()
    })
  })

  describe('when SD-LAN and Keep Alive are ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
          || ff === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
    })

    it('should display network segment type and keep alive related columns', async () => {
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      expect(screen.getByText('Network Segment Type')).toBeInTheDocument()
      expect(screen.queryByText('Tunnel Type')).not.toBeInTheDocument()
      expect(screen.getByText('Path MTU Request Timeout')).toBeInTheDocument()
      expect(screen.getByText('Path MTU Request Retries')).toBeInTheDocument()
      expect(screen.getByText('Tunnel Keep Alive Interval')).toBeInTheDocument()
      expect(screen.getByText('Tunnel Keep Alive Retries')).toBeInTheDocument()
    })

    it('should show error when mtuRequestTimeout is invalid', async () => {
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )

      const spinBtns = (await screen.findAllByRole('spinbutton'))
        .filter(p => p.id === 'mtuRequestTimeout')[0]
      userEvent.clear(spinBtns)
      expect(await screen.findByText('Please enter Path MTU Request Timeout')).toBeVisible()

      userEvent.type(spinBtns, '0')
      expect(await screen.findByText('Value must between 10-10000 milliseconds or 1-10 seconds'))
        .toBeVisible()

      await userEvent.clear(spinBtns)
      await userEvent.type(spinBtns, '11')
      expect(await screen.findByText('Value must between 10-10000 milliseconds or 1-10 seconds'))
        .toBeVisible()
    })

    it('should trigger mtuRequestTime validate when change unit', async () => {
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      const mtuTimeInput = (await screen.findAllByRole('spinbutton'))
        .filter(p => p.id === 'mtuRequestTimeout')[0]
      await userEvent.clear(mtuTimeInput)
      await userEvent.type(mtuTimeInput, '10001')
      const mtuTimeUnitSelect =
        (await screen.findAllByRole('combobox')).filter(p => p.id === 'mtuRequestTimeoutUnit')[0]
      await userEvent.selectOptions(
        mtuTimeUnitSelect,
        await screen.findByRole('option', { name: 'Milliseconds' })
      )
      expect(await screen.findByText('Value must between 10-10000 milliseconds or 1-10 seconds'))
        .toBeVisible()
    })

    it('should show error when keepAliveRetry and keepAliveInterval are invalid', async () => {
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      const keepAliveRetryInput = (await screen.findAllByRole('spinbutton'))
        .filter(p => p.id === 'keepAliveRetry')[0]
      const keepAliveIntervalInput = (await screen.findAllByRole('spinbutton'))
        .filter(p => p.id === 'keepAliveInterval')[0]
      await userEvent.clear(keepAliveIntervalInput)
      expect(await screen.findByText('Please enter Tunnel Keep Alive Interval')).toBeVisible()

      await userEvent.clear(keepAliveRetryInput)
      expect(await screen.findByText('Please enter Tunnel Keep Alive Retries')).toBeVisible()

      await userEvent.type(keepAliveRetryInput, '0')
      expect(await screen.findByText('Tunnel Keep Alive Retries must be between 3 and 10'))
        .toBeVisible()

      await userEvent.type(keepAliveIntervalInput, '0')
      expect(await screen.findByText('Tunnel Keep Alive Interval must be between 1 and 5'))
        .toBeVisible()
    })
  })

  describe('when NAT-Traversal Support is ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
          || ff === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE
          || ff === Features.EDGE_PIN_HA_TOGGLE
          || ff === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
    })

    it('NAT-T switch should be enable when type is vlan_vxlan', async () => {
      const user = userEvent.setup()
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      expect(screen.getByText('Network Segment Type')).toBeInTheDocument()
      expect(screen.getByText('Enable NAT-T Support')).toBeInTheDocument()
      await user.click(screen.getByRole('radio', { name: 'VLAN to VNI map' }))
      const switchBtns = screen.getAllByRole('switch')
      const natTraversalSwitch = switchBtns.find(btn => btn.id === 'natTraversalEnabled')
      expect(natTraversalSwitch).toBeEnabled()
    })

    it('NAT-T switch should be disabled when type is vxlan', async () => {
      const user = userEvent.setup()
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      expect(screen.getByText('Network Segment Type')).toBeInTheDocument()
      expect(screen.getByText('Enable NAT-T Support')).toBeInTheDocument()
      const switchBtns = screen.getAllByRole('switch')
      const natTraversalSwitch = switchBtns.find(btn => btn.id === 'natTraversalEnabled')
      expect(natTraversalSwitch).toBeEnabled()
      await user.click(switchBtns[0])
      await user.click(screen.getByRole('radio', { name: 'VNI' }))
      expect(natTraversalSwitch).not.toBeChecked()
      expect(natTraversalSwitch).toBeDisabled()
    })

    it('should show "NAT Traversal" compatibility component', async () => {
      const user = userEvent.setup()
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )

      const compatibilityToolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(compatibilityToolTips.length).toBe(1)
      compatibilityToolTips.forEach(t => expect(t).toBeVisible())
      await user.click(compatibilityToolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.NAT_TRAVERSAL)
    })

    it('should show BetaIndicator when "NAT Traversal" is beta feature', async () => {
      jest.mocked(useIsBetaEnabled).mockReturnValue(true)
      render(
        <Form initialValues={defaultValues}>
          <TunnelProfileForm />
        </Form>
      )
      expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
    })
  })
})