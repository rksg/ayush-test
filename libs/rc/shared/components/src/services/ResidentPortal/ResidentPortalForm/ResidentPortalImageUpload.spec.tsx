import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }                              from '@acx-ui/store'
import { fireEvent, render, renderHook, screen } from '@acx-ui/test-utils'

import ResidentPortalImageUpload from './ResidentPortalImageUpload'

describe('ResidentPortalImageUpload', () => {

  const checkCircle = 'data:image/svg+xml;base64,asdfasdfasdfasdf'
  const checkCircleFilename = 'checkCircle.svg'

  it('should render the upload, set new value', async () => {

    const file = new File(['test'], 'testImage.png', { type: 'image/png' })

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const { container } = render(
      <Provider>
        <Form form={formRef.current}>
          <Form.Item name='fileLogo'
            label='Image Upload'
            children={
            // @ts-ignore
              <ResidentPortalImageUpload
                existingImage={{ fileSrc: checkCircle, filename: checkCircleFilename }}/>
            }/>
        </Form>
      </Provider>
    )

    expect(formRef.current.getFieldValue('fileLogo')).toBeUndefined()

    // eslint-disable-next-line
    let input = container.querySelector('input[type="file"]') as Element

    await fireEvent.change(input, {
      target: { files: [file] }
    })

    expect(formRef.current.getFieldValue('fileLogo').file).toBe(file)
    expect(formRef.current.getFieldValue('fileLogo').isRemoved).toBeFalsy()

  })

  it('should remove the existing image', async () => {

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <Form.Item name='fileLogo'
            label='Image Upload'
            children={
            // @ts-ignore
              <ResidentPortalImageUpload
                existingImage={{ fileSrc: checkCircle, filename: checkCircleFilename }}/>
            }/>
        </Form>
      </Provider>
    )

    expect(formRef.current.getFieldValue('fileLogo')).toBeUndefined()
    await userEvent.click(screen.getByRole('button', { name: /Remove/ }))
    expect(formRef.current.getFieldValue('fileLogo').file).toBeUndefined()
    expect(formRef.current.getFieldValue('fileLogo').isRemoved).toBeTruthy()
  })

  it('should render not show the reset button with no existing image', async () => {

    const file = new File(['test'], 'testImage.png', { type: 'image/png' })

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const { container } = render(
      <Provider>
        <Form form={formRef.current}>
          <Form.Item name='fileLogo'
            label='Image Upload'
            children={
            // @ts-ignore
              <ResidentPortalImageUpload existingImage={{}}/>
            }/>
        </Form>
      </Provider>
    )

    // eslint-disable-next-line
    let input = container.querySelector('input[type="file"]') as Element

    // await act(() => {
    await fireEvent.change(input, {
      target: { files: [file] }
    })
    // })

    expect(formRef.current.getFieldValue('fileLogo').file).toBe(file)
    expect(formRef.current.getFieldValue('fileLogo').isRemoved).toBeFalsy()

    expect(screen.queryByRole('button', { name: /Reset/ })).not.toBeInTheDocument()

  })

})
