import userEvent     from '@testing-library/user-event'
import { Form }      from 'antd'
import { cloneDeep } from 'lodash'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeGeneralFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { SettingsForm } from '.'

const mockEdgeClusterList = cloneDeep(EdgeGeneralFixtures.mockEdgeClusterList)
mockEdgeClusterList.data[4].highAvailabilityMode = ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY

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

const useMockedFrom = () => {
  const [ form ] = Form.useForm()
  jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
  return form
}

const mockedSetFieldsValue = jest.fn()

describe('EdgeMdnsProxyForm: settings', () => {
  beforeEach(() => {
    mockedSetFieldsValue.mockClear()
  })

  it('should render correctly', async () => {
    const { result: stepFormRef } = renderHook(useMockedFrom)
    render(<MockedTargetComponent form={stepFormRef.current} />)

    await checkBasicSettings()

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

  return formBody
}