import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                                   from '@acx-ui/components'
import { OperatorType }                                from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { RadiusAttributeGroupSettingForm } from '.'

const mockedAddFunc = jest.fn()
const mockedEditFunc = jest.fn()

describe('RadiusAttributeGroupSettingForm', () => {

  beforeEach(() => {
    mockedAddFunc.mockClear()
    mockedEditFunc.mockClear()
  })

  it('should excute add func while clicking add button', async () => {
    render(
      <Provider>
        <StepsForm buttonLabel={{ submit: 'Save' }}>
          <StepsForm.StepForm>
            <RadiusAttributeGroupSettingForm
              onAddClick={mockedAddFunc}
              onEditClick={mockedEditFunc}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedAddFunc).toBeCalled()
  })

  it('should excute edit func while clicking edit button', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        attributeAssignments: [{
          id: 'id1',
          attributeName: 'name1',
          attributeValue: 'value1',
          operator: OperatorType.ADD
        }]
      })
      return { form }
    })

    render(
      <Provider>
        <StepsForm
          form={result.current.form}
          buttonLabel={{ submit: 'Save' }}
        >
          <StepsForm.StepForm>
            <RadiusAttributeGroupSettingForm
              onAddClick={mockedAddFunc}
              onEditClick={mockedEditFunc}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const row = await screen.findByRole('row', { name: /name1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(mockedEditFunc).toBeCalled()
  })

  it('should delete selected row while clicking delete button', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        attributeAssignments: [{
          id: 'id1',
          attributeName: 'name1',
          attributeValue: 'value1',
          operator: OperatorType.ADD
        }]
      })
      return { form }
    })

    render(
      <Provider>
        <StepsForm
          form={result.current.form}
          buttonLabel={{ submit: 'Save' }}
        >
          <StepsForm.StepForm>
            <RadiusAttributeGroupSettingForm
              onAddClick={mockedAddFunc}
              onEditClick={mockedEditFunc}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const row = await screen.findByRole('row', { name: /name1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(row).not.toBeInTheDocument())
  })
})
