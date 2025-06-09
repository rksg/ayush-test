import React from 'react'

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { BridgeServiceProtocolEnum, EdgeMdnsFixtures, EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'
import { render, screen, waitFor, within }                                    from '@acx-ui/test-utils'

import { EditEdgeMdnsProxyForm } from './EditEdgeMdnsProxyForm'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures

const originData = mockEdgeMdnsViewDataList[0]

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    options,
    loading,
    ...props
  }: React.PropsWithChildren<{
    options: Array<{ label: string, value: unknown }>,
    loading: boolean,
    onChange?: (value: string) => void }>) => {
    return (loading
      ? <div role='img' data-testid='loadingIcon'>Loading</div>
      : <select {...props}
        onChange={(e) => {
          props.onChange?.(e.target.value)}
        }>
        {/* Additional <option> to ensure it is possible to reset value to empty */}
        <option value={undefined}></option>
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const onFinish = jest.fn()
const onCancel = jest.fn()

const MockComponent = (props: { editData?: EdgeMdnsProxyViewData }) => {
  return <EditEdgeMdnsProxyForm
    editData={props.editData}
    onFinish={onFinish}
    onCancel={onCancel}
  />
}

describe('EditEdgeMdnsProxyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', async () => {
    render(<MockComponent editData={originData as EdgeMdnsProxyViewData} />)

    const formBody = await checkBasicSettings()
    screen.getByText('Forwarding Rules (3)')

    const row = within(formBody).getByRole('row', { name: '_testCXCX._tcp. (Other) 5 120' })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Transport Protocol' }),
      within(dialog).getByRole('option', { name: 'UDP' }))

    await userEvent.type(within(dialog).getByRole('spinbutton', { name: /To VLAN/i }), '1')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const expectedData = cloneDeep(originData) as EdgeMdnsProxyViewData
    expectedData.forwardingRules![2].mdnsProtocol = BridgeServiceProtocolEnum.UDP
    expectedData.forwardingRules![2].toVlan = 1201

    await waitFor(() => expect(onFinish).toBeCalled())
    expect(onFinish.mock.calls[0][0]).toStrictEqual(expectedData)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(<MockComponent />)
    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)
    await waitFor(() => expect(onCancel).toHaveBeenCalled())
  })

  it('renders steps with correct titles', () => {
    render(<MockComponent />)
    expect(screen.getAllByText('Settings').length).toBe(2)
    expect(screen.getByText('Scope')).toBeInTheDocument()
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')
  const nameField = screen.getByRole('textbox', { name: 'Service Name' })
  expect(nameField).toHaveValue(originData.name)
  return formBody
}