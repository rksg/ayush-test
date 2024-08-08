import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }                            from '@acx-ui/store'
import { render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import FloorPlanForm from '.'

describe('Floor Plan Form', () => {

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    const onFormSubmit = jest.fn()
    const { asFragment } = render(<Provider>
      <FloorPlanForm
        formLoading={false}
        form={formRef.current}
        onFormSubmit={onFormSubmit}
        imageFile={''}/></Provider>)

    formRef.current.setFieldsValue({
      name: 'Test1',
      floorNumber: 1,
      imageName: 'test.jpg'
    })
    const form: Form = await screen.findByTestId('floor-plan-form')
    form.form = formRef.current
    form.submit()

    await waitFor(() => expect(onFormSubmit).toBeCalled())
    expect(asFragment()).toMatchSnapshot()
  })

})
