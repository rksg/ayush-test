import '@testing-library/jest-dom'
import { Upload } from 'antd'
import { rest }   from 'msw'

import { apApi }                                                            from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider, store  }                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { apDetails, apRadio, apViewModel, apPhoto, apNoPhoto, apSampleImage, wifiCapabilities } from '../../__tests__/fixtures'

import * as CropImage from './cropImage'

import { ApPhoto } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => ({
    venueId: 'venue-id',
    tenantId: 'tenant-id',
    serialNumber: 'serial-number'
  })
}))

module.exports = {
  src: '/app/sample.png',
  height: 293,
  width: 172,
  blurDataURL: apSampleImage
}

describe('ApPhoto', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    global.URL.createObjectURL = jest.fn()
      .mockReturnValue('blob:http://localhost/6f5a9d30-b9f8-496f-b9a7-1d5e763c4c3c')
    // jest.spyOn(global.URL, 'createObjectURL')
    // global.URL.createObjectURL = jest.fn()
    // jest.spyOn(global.URL, 'createObjectURL')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apViewModel))
      ),
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetails))
      ),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apRadio))
      ),
      rest.get(
        WifiUrlsInfo.getApPhoto.url,
        (_, res, ctx) => res(ctx.json(apPhoto))
      ),
      rest.delete(
        WifiUrlsInfo.deleteApPhoto.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(wifiCapabilities))
      ),
      rest.get(
        '*/app/sample.png',
        (_, res, ctx) => res(ctx.body(apSampleImage))
      ),
      rest.get(
        'blob:http://localhost/*',
        (_, res, ctx) => res(ctx.body(apSampleImage))
      ),
      rest.post(
        'http://localhost/*',
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        'http://localhost/*',
        (_, res, ctx) => res(ctx.body(apSampleImage))
      )
    )
  })
  it('should render correctly', async () => {

    apViewModel.data[0].model = ''
    render(<Provider><ApPhoto /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const dot1 = await screen.findByTestId('dot1')
    fireEvent.click(dot1)
    const image1 = await screen.findByTestId('image1')
    fireEvent.doubleClick(image1)
    const zoomIn = await screen.findByTestId('image-zoom-in')
    fireEvent.click(zoomIn)
    const zoomOut = await screen.findByTestId('image-zoom-out')
    fireEvent.click(zoomOut)
    const zoomSlider = await screen.findByRole('slider')
    zoomSlider.focus()
    fireEvent.keyPress(zoomSlider, { key: 'Right', code: 39, charCode: 39 })
    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    expect(applyButton).toBeVisible()
    fireEvent.click(applyButton)
  })
  it('should delete image correctly', async () => {
    apViewModel.data[0].model = ''
    render(<Provider><ApPhoto /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const dot1 = await screen.findByTestId('dot1')
    fireEvent.click(dot1)
    const image1 = await screen.findByTestId('image1')
    fireEvent.doubleClick(image1)
    const deleteBtn = await screen.findByTestId('delete')
    fireEvent.click(deleteBtn)
  })
  it('should render default image correctly', async () => {
    apViewModel.data[0].model = 'R650'
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApPhoto.url,
        (_, res, ctx) => res(ctx.json(apNoPhoto))
      )
    )
    render(<Provider><ApPhoto /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const gallery = await screen.findByTestId('gallery')
    fireEvent.click(gallery)
  })
  it('should upload photo correctly', async () => {
    const { asFragment } = render(<Provider><ApPhoto /></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
    jest.spyOn(CropImage, 'createImage')
      .mockImplementationOnce(async () => apSampleImage)
    render(<Upload
      name='apPhoto'
      listType='picture'
      showUploadList={false}
      action={''}
      beforeUpload={jest.fn()}
      accept='image/*'
      style={{
        height: '180px'
      }}
    />)
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: apSampleImage }] }
    })
    Object.setPrototypeOf(file.size, { value: 100000000 })
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: apSampleImage, type: 'image/jpg' }] }
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
