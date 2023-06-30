import '@testing-library/jest-dom'

import { renderHook } from '@testing-library/react'
import { Form }       from 'antd'
import { act }        from 'react-dom/test-utils'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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
    await act(() => {
      form.submit()
    })
    expect(onFormSubmit).toBeCalled()
    expect(asFragment()).toMatchSnapshot()
  })

})
