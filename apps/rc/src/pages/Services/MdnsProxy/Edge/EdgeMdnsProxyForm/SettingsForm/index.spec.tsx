import userEvent                from '@testing-library/user-event'
import { Form }                 from 'antd'
import { cloneDeep, find, set } from 'lodash'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  EdgeMdnsFixtures,
  EdgeMdnsProxyViewData
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  renderHook,
  screen,
  within
} from '@acx-ui/test-utils'

import { SettingsForm } from '.'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const originData = mockEdgeMdnsViewDataList[0]

const mockedSetFieldValue = jest.fn()

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

// eslint-disable-next-line max-len
type MockedTargetComponentType = Pick<StepsFormProps, 'form' | 'editMode'>
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form, editMode } = props
  return <Provider>
    <StepsForm form={form} editMode={editMode}>
      <SettingsForm />
    </StepsForm>
  </Provider>
}

const useMockedFrom = (data?: EdgeMdnsProxyViewData) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue(data ?? originData)
  jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
  return form
}

describe('EdgeMdnsProxyForm: settings', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear()
  })

  it('should render correctly', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

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

    const expected = cloneDeep(originData.forwardingRules)
    const target = find(expected, { ruleIndex: 2 })
    set(target!, 'mdnsProtocol', 'UDP')
    set(target!, 'toVlan', 1201)

    expect(mockedSetFieldValue).toBeCalledWith('forwardingRules', expected)
  })

  it('Input invalid service name should show error message', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    await checkBasicSettings()

    const nameField = screen.getByRole('textbox', { name: 'Service Name' })
    await userEvent.type(nameField, '``')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.'))
      .toBeVisible()
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')
  const nameField = screen.getByRole('textbox', { name: 'Service Name' })
  expect(nameField).toHaveValue(originData.name)
  return formBody
}