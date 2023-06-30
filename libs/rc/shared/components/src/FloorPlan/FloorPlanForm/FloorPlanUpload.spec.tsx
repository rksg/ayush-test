import '@testing-library/jest-dom'

import { Upload } from 'antd'
import { rest }   from 'msw'

import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import FloorplanUpload from './FloorPlanUpload'

describe('Floor Plan Upload', () => {

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn()
    jest.spyOn(global.URL, 'createObjectURL')
    mockServer.use(rest.post('',
      (_, res, ctx) => res(ctx.json({})))
    )})

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render correctly', async () => {
    const validateFile = jest.fn()
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    const { asFragment } = render(<FloorplanUpload
      validateFile={validateFile}
      imageFile=''
    />)

    render(<Upload
      name='floorplan'
      listType='picture-card'
      className='avatar-uploader'
      showUploadList={false}
      action={URL.createObjectURL(file)}
      beforeUpload={jest.fn()}
      onChange={jest.fn()}
      accept='image/*'
    />)

    // eslint-disable-next-line testing-library/no-node-access
    await fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png' }] }
    })

    Object.setPrototypeOf(file.size, { value: 120000000 })
    // eslint-disable-next-line testing-library/no-node-access
    await fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png', type: 'image/png' }] }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should show error correctly', async () => {
    const validateFile = jest.fn()
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    const { asFragment } = render(<FloorplanUpload
      validateFile={validateFile}
      imageFile=''
    />)

    render(<Upload
      name='floorplan'
      listType='picture-card'
      className='avatar-uploader'
      showUploadList={false}
      action={URL.createObjectURL(file)}
      beforeUpload={jest.fn()}
      onChange={jest.fn()}
      accept='image/*'
    />)

    // eslint-disable-next-line testing-library/no-node-access
    await fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png' }] }
    })

    const typeError = await screen.findAllByText('Invalid Image type!')

    await expect(typeError[0]).toBeVisible()

    Object.setPrototypeOf(file.size, { value: 120000000 })
    // eslint-disable-next-line testing-library/no-node-access
    await fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png', type: 'image/png' }] }
    })

    const sizeError = await screen.findAllByText('Image must smaller than 20MB!')

    await expect(sizeError[0]).toBeVisible()

    expect(asFragment()).toMatchSnapshot()
  })

  it('should pass file validation', async () => {
    const validateFile = jest.fn()
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    const { asFragment } = render(<FloorplanUpload
      validateFile={validateFile}
      imageFile=''
    />)

    render(<Upload
      name='floorplan'
      listType='picture-card'
      className='avatar-uploader'
      showUploadList={false}
      action={URL.createObjectURL(file)}
      beforeUpload={jest.fn()}
      onChange={jest.fn()}
      accept='image/*'
    />)

    // eslint-disable-next-line testing-library/no-node-access
    await fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png', type: 'image/png', size: 10000 }] }
    })
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = jest.fn()
    expect(asFragment()).toMatchSnapshot()
  })

})
