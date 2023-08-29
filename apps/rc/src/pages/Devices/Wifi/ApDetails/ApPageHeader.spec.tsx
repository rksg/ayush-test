import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }           from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { apDetailData } from './__tests__/fixtures'
import ApPageHeader     from './ApPageHeader'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const params = { tenantId: 't1', serialNumber: 'v1' }
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
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    await userEvent.click(await screen.findByText('More Actions'))

    await userEvent.click(await screen.findByText('Reboot'))
  })

  it('should render correct breadcrumb', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
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
