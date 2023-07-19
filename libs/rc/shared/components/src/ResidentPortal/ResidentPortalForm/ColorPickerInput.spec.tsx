import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { ColorPickerInput } from './ColorPickerInput'

describe('ColorPickerInput', () => {

  it('should render the color picker and reset color to default', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const customColor = '#FFFFFF'
    const defaultColor = '#000000'

    formRef.current.setFieldValue('colorMain', customColor)

    render(
      <Provider>
        <Form form={formRef.current}>
          <Form.Item name='colorMain'
            label='testColorPicker'
            children={
              // @ts-ignore
              <ColorPickerInput defaultColorHex={defaultColor}
                colorName='Color Picker Test Name' />}
          />
        </Form>
      </Provider>
    )

    expect(formRef.current.getFieldValue('colorMain')).toBe(customColor)
    await userEvent.click(screen.getByRole('button', { name: /Reset to Default/ }))
    expect(formRef.current.getFieldValue('colorMain')).toBe(defaultColor)
  })


})
