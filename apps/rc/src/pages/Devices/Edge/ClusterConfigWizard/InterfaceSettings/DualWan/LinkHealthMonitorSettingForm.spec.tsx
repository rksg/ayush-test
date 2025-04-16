import userEvent           from '@testing-library/user-event'
import { Form }            from 'antd'
import { cloneDeep, find } from 'lodash'

import { EdgeDualWanFixtures, EdgeLinkDownCriteriaEnum, EdgeMultiWanProtocolEnum, EdgeWanLinkHealthCheckPolicy } from '@acx-ui/rc/utils'
import { render, renderHook, screen, waitFor, within }                                                           from '@acx-ui/test-utils'

import { LinkHealthMonitorSettingForm } from './LinkHealthMonitorSettingForm'

const { mockDualWanData } = EdgeDualWanFixtures


jest.mock('./InputInlineEditor', () => {
  const origin = jest.requireActual('./InputInlineEditor')
  return {
    InputInlineEditor: (props: Record<string, unknown>) => <div data-testid='InputInlineEditor'>
      <origin.InputInlineEditor {...props} />
    </div>
  }
})
type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, options, dropdownClassName, ...props
  }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? children : ''}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('LinkHealthMonitorSettingForm', () => {
  const mockOnFinish = jest.fn()
  // eslint-disable-next-line max-len
  const mockEditData = mockDualWanData.wanMembers[0].linkHealthCheckPolicy as EdgeWanLinkHealthCheckPolicy

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with initial values', async () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())
    render(<LinkHealthMonitorSettingForm
      form={mockForm}
      onFinish={mockOnFinish}
    />)

    const protocolDropdown = screen.getByRole('combobox', { name: 'Protocol' })
    expect(protocolDropdown).toHaveValue(EdgeMultiWanProtocolEnum.PING)
    expect(protocolDropdown).toBeDisabled()

    expect(screen.getByRole('button', { name: 'Add Target' })).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('radio', { name: 'All targets were unreachable' })).toBeChecked()
    const selects = screen.getAllByRole('combobox')
    selects.forEach((select) => {
      if ( select.getAttribute('id') === 'protocol' ) return
      expect(select).toHaveValue('3')
    })
  })

  it('should render form with edit data', () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())

    render(<LinkHealthMonitorSettingForm
      form={mockForm}
      onFinish={mockOnFinish}
      editData={mockEditData}
    />)

    // eslint-disable-next-line max-len
    expect(screen.getByRole('combobox', { name: 'Protocol' })).toHaveValue(EdgeMultiWanProtocolEnum.PING)
    expect(screen.getByRole('button', { name: 'Add Target' })).toBeInTheDocument()
    expect(screen.getByText('8.8.8.8')).toBeVisible()
    expect(screen.getByText('10.10.10.10')).toBeVisible()

    // eslint-disable-next-line max-len
    expect(screen.getByRole('radio', { name: 'One or more of the targets were unreachable' })).toBeChecked()

    const selects = screen.getAllByRole('combobox')
    const intervalSeconds = find(selects, { id: 'intervalSeconds' })
    expect(intervalSeconds).toHaveValue('2')

    const maxCountToDown = find(selects, { id: 'maxCountToDown' })
    expect(maxCountToDown).toHaveValue('7')

    const maxCountToUp = find(selects, { id: 'maxCountToUp' })
    expect(maxCountToUp).toHaveValue('9')
  })

  it('should correctly submit form data', async () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())

    render(<LinkHealthMonitorSettingForm
      form={mockForm}
      onFinish={mockOnFinish}
      editData={mockEditData}
    />)

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('radio', { name: 'One or more of the targets were unreachable' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'All targets were unreachable' }))

    const selects = screen.getAllByRole('combobox')
    const intervalSeconds = find(selects, { id: 'intervalSeconds' }) as HTMLElement
    await userEvent.selectOptions(intervalSeconds,
      within(intervalSeconds).getByRole('option', { name: '9' }))
    const maxCountToDown = find(selects, { id: 'maxCountToDown' }) as HTMLElement
    await userEvent.selectOptions(maxCountToDown,
      within(maxCountToDown).getByRole('option', { name: '3' }))

    mockForm.submit()
    await waitFor(() => expect(mockOnFinish).toHaveBeenCalledWith({
      protocol: EdgeMultiWanProtocolEnum.PING,
      targetIpAddresses: ['8.8.8.8', '10.10.10.10'],
      linkDownCriteria: EdgeLinkDownCriteriaEnum.ALL_TARGETS_DOWN,
      intervalSeconds: 9,
      maxCountToDown: 3,
      maxCountToUp: 9
    }))
  })

  describe('target address', () => {
    it('should correctly add new target', async () => {
      const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())

      render(<LinkHealthMonitorSettingForm
        form={mockForm}
        onFinish={mockOnFinish}
        editData={mockEditData}
      />)

      await userEvent.click(await screen.findByRole('button', { name: 'Add Target' }))
      const input = await screen.findByRole('textbox')
      await userEvent.type(input, '12.12.12.12')
      expect(input).toHaveValue('12.12.12.12')
      const checkIcon = screen.getByTestId('Check')
      await userEvent.click(checkIcon)
      await screen.findByText('12.12.12.12')

      mockForm.submit()
      await waitFor(() => expect(mockOnFinish).toHaveBeenCalledWith({
        ...mockEditData,
        targetIpAddresses: ['8.8.8.8', '10.10.10.10', '12.12.12.12']
      }))
    })
    it('should correctly edit a target', async () => {
      const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())

      render(<LinkHealthMonitorSettingForm
        form={mockForm}
        onFinish={mockOnFinish}
        editData={mockEditData}
      />)

      const inputEditors = await screen.findAllByTestId('InputInlineEditor')
      await userEvent.click(within(inputEditors[0]).getByTestId('EditOutlined'))
      const input = await screen.findByRole('textbox')
      expect(input).toHaveValue('8.8.8.8')
      await userEvent.type(input, '{backspace}66')
      await userEvent.click(screen.getByTestId('Check'))
      expect(await screen.findByText('8.8.8.66')).toBeVisible()

      mockForm.submit()
      await waitFor(() => expect(mockOnFinish).toHaveBeenCalledWith({
        ...mockEditData,
        targetIpAddresses: ['8.8.8.66', '10.10.10.10']
      }))
    })

    it('should correctly remove target', async () => {
      const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())

      render(<LinkHealthMonitorSettingForm
        form={mockForm}
        onFinish={mockOnFinish}
        editData={mockEditData}
      />)

      const inputEditors = await screen.findAllByTestId('InputInlineEditor')
      await userEvent.click(within(inputEditors[0]).getByTestId('DeleteOutlined'))
      expect(screen.queryByText('8.8.8.8')).toBeNull()

      mockForm.submit()
      await waitFor(() => expect(mockOnFinish).toHaveBeenCalledWith({
        ...mockEditData,
        targetIpAddresses: ['10.10.10.10']
      }))
    })

    it('should catch error when target > 3', async () => {
      const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())
      const mockData = cloneDeep(mockEditData)
      mockData.targetIpAddresses.push('1.2.3.4')

      render(<LinkHealthMonitorSettingForm
        form={mockForm}
        onFinish={mockOnFinish}
        editData={mockData}
      />)

      await userEvent.click(await screen.findByRole('button', { name: 'Add Target' }))
      const input = await screen.findByRole('textbox')
      await userEvent.type(input, '12.12.12.12')
      expect(input).toHaveValue('12.12.12.12')
      const checkIcon = screen.getByTestId('Check')
      await userEvent.click(checkIcon)
      await screen.findByText('12.12.12.12')

      mockForm.submit()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Target IP must be between 1 and 3 addresses')
    })
  })
})