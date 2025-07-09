import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }           from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiRbacUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { deviceAps } from '../../__tests__/fixtures'

import { apDetailData } from './__tests__/fixtures'
import ApPageHeader     from './ApPageHeader'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))

const params = { tenantId: 't1', venueId: 'u1', serialNumber: 'v1' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))

describe('ApPageHeader', () => {
  beforeEach(() => store.dispatch(apApi.util.resetApiState()))

  it('navigate to edit when configure clicked', async () => {

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
      )
    )
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))
      )
    )
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    // expect(mockNavigate).toBeCalledWith(expect.objectContaining({
    //   pathname: '/t/t1/devices/wifi/v1/edit/details'
    // }))
    expect(mockNavigate).toBeCalledTimes(1)
  })

  it('click to action button', async () => {

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
      )
    )
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))
      )
    )
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('Reboot'))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Reboot Access Point/)).toBeVisible()
    const cancelBtn = await within(dialog).findByRole('button', { name: 'Cancel' })
    expect(cancelBtn).toBeVisible()
    fireEvent.click(cancelBtn)
  })

  it('click CLI Session button', async () => {
    mockServer.resetHandlers()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApJwtToken.url,
        (_, res, ctx) => res(ctx.json({id_token: 'token'}))
      )
    )
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('CLI Session'))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/CLI Session/)).toBeVisible()
  })

  it('should render correct breadcrumb', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
      )
    )
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))
      )
    )
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Access Points')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /ap list/i
    })).toBeTruthy()
  })
})
