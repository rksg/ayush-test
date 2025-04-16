import userEvent        from '@testing-library/user-event'
import { FormInstance } from 'antd'

import { defaultDualWanLinkHealthCheckPolicy }               from '@acx-ui/edge/components'
import { EdgeDualWanFixtures, EdgeWanLinkHealthCheckPolicy } from '@acx-ui/rc/utils'
import { render, screen, waitFor }                           from '@acx-ui/test-utils'

import { LinkHealthMonitorToggleButton } from './LinkHealthMonitorToggleButton'
const { mockDualWanData } = EdgeDualWanFixtures

// eslint-disable-next-line max-len
const mockWanLinkHealthCheckPolicy = mockDualWanData.wanMembers[0].linkHealthCheckPolicy as EdgeWanLinkHealthCheckPolicy

jest.mock('./LinkHealthMonitorSettingForm', () => {
  const { Form } = jest.requireActual('antd')

  return {
    LinkHealthMonitorSettingForm: (props: {
      form: FormInstance
      onFinish: (values: EdgeWanLinkHealthCheckPolicy) => Promise<void>
      editData?: EdgeWanLinkHealthCheckPolicy
    }) =>
      <div data-testid='LinkHealthMonitorSettingForm'>
        {props.editData && <p>{JSON.stringify(props.editData)}</p>}
        <Form
          form={props.form}
          onFinish={() => props.onFinish(mockWanLinkHealthCheckPolicy)}
        />
      </div>
  }
})
describe('LinkHealthMonitorToggleButton', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should toggle the visibility when the switch is clicked', async () => {

    render(<LinkHealthMonitorToggleButton
      portName='Port 1'
      enabled={false}
      linkHealthSettings={undefined}
      onChange={mockOnChange}
    />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()
    const editButton = screen.queryByTestId('EditOutlined')
    expect(editButton).toBeNull()
    await userEvent.click(switchElement)
    expect(mockOnChange).toHaveBeenCalledWith(true, defaultDualWanLinkHealthCheckPolicy)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should open the drawer when the edit button is clicked', async () => {
    render(<LinkHealthMonitorToggleButton
      portName='Port 2'
      enabled={false}
      linkHealthSettings={mockWanLinkHealthCheckPolicy}
      onChange={mockOnChange}
    />)
    const switchElement = screen.getByRole('switch')
    await userEvent.click(switchElement)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const form = screen.getByTestId('LinkHealthMonitorSettingForm')
    expect(form).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(form).toHaveTextContent(JSON.stringify(mockDualWanData.wanMembers[0].linkHealthCheckPolicy))
  })

  it('should call onClose when the drawer is closed', async () => {
    render(<LinkHealthMonitorToggleButton
      portName='Port 1'
      enabled={true}
      linkHealthSettings={undefined}
      onChange={mockOnChange}
    />)
    const editButton = screen.getByTestId('EditOutlined')
    await userEvent.click(editButton)
    const dialog= await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
  })

  it('should call handleFinish when the save button is clicked', async () => {
    render(
      <LinkHealthMonitorToggleButton
        portName='Port 1'
        enabled={true}
        linkHealthSettings={undefined}
        onChange={mockOnChange}
      />
    )
    const editButton = screen.getByTestId('EditOutlined')
    await userEvent.click(editButton)
    const dialog= await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(saveButton)
    await waitFor(() => expect(dialog).not.toBeInTheDocument())

  })
})