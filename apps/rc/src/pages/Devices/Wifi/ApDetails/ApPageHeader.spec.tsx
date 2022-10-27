import { rest } from 'msw'

import { apApi }                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { apDetailData } from './__tests__/fixtures'
import ApPageHeader     from './ApPageHeader'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
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
    const params = { tenantId: 't1', apId: 'v1' }
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    expect(mockNavigate).toBeCalledWith(expect.objectContaining({
      pathname: '/t/t1/devices/aps/v1/edit'
    }))
  })
})
