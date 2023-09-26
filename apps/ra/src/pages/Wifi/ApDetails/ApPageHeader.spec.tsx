import { rest } from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
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
  // beforeEach(() => store.dispatch(apApi.util.resetApiState()))

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
