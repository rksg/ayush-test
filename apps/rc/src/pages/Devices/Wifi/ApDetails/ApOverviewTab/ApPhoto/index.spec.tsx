import '@testing-library/jest-dom'
import { Upload } from 'antd'
import { rest }   from 'msw'

import { apApi }                                                            from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider, store  }                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { apDetails, apRadio, apViewModel, apPhoto, apSampleImage, wifiCapabilities } from '../../__tests__/fixtures'

import * as CropImage from './cropImage'

import { ApPhoto } from '.'

const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  serialNumber: 'serial-number'
}
describe('ApPhoto', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    global.URL.createObjectURL = jest.fn()
    jest.spyOn(global.URL, 'createObjectURL')
    // jest.spyOn(global.URL, 'createObjectURL')
    //   .mockImplementation(() => 'blob:http://localhost:3000/6f5a9d30-b9f8-496f-b9a7-1d5e763c4c3c')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apViewModel))
      ),
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json(apDetails))
      ),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))
      ),
      rest.get(
        WifiUrlsInfo.getApPhoto.url,
        (req, res, ctx) => res(ctx.json(apPhoto))
      ),
      rest.get(
        WifiUrlsInfo.getWifiCapabilities.url,
        (req, res, ctx) => res(ctx.json(wifiCapabilities))
      ),
      rest.get(
        '/ap/sample.png',
        (req, res, ctx) => res(ctx.body(apSampleImage))
      ),
      rest.get(
        'blob:http://localhost:3000/6f5a9d30-b9f8-496f-b9a7-1d5e763c4c3c',
        (req, res, ctx) => res(ctx.body(apSampleImage))
      )
    )
    jest.spyOn(CropImage, 'createImage').mockImplementation((url: string) => fetch(url))
  })

  it('should render correctly', async () => {
    render(<Provider><ApPhoto /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const dot2 = screen.getByTestId('dot2')
    fireEvent.click(dot2)
    const image2 = screen.getByTestId('image2')
    fireEvent.doubleClick(image2)
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    expect(applyButton).toBeVisible()
    fireEvent.click(applyButton)
    CropImage.createImage('/ap/sample.png')
  })

  it('should upload photo correctly', async () => {
    const { asFragment } = render(<Provider><ApPhoto /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    render(<Upload
      name='apPhoto'
      listType='picture'
      showUploadList={false}
      action={URL.createObjectURL(file)}
      beforeUpload={jest.fn()}
      accept='image/*'
      style={{
        height: '180px'
      }}
    />)

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png' }] }
    })

    Object.setPrototypeOf(file.size, { value: 100000000 })
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.change(document.querySelector('input')!, {
      target: { files: [{ file: 'foo.png', type: 'image/png' }] }
    })

    expect(asFragment()).toMatchSnapshot()
  })

})
