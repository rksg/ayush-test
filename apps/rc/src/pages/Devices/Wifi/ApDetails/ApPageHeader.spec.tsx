import { venueApi }                  from '@acx-ui/rc/services'
import { Provider, store }           from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

// import { venueDetailHeaderData } from '../__tests__/fixtures'

import ApPageHeader from './ApPageHeader'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('ApPageHeader', () => {
  beforeEach(() => store.dispatch(venueApi.util.resetApiState()))

  it('navigate to edit when configure clicked', async () => {

    // mockServer.use(
    //   rest.get(
    //     CommonUrlsInfo.getVenueDetailsHeader.url,
    //     (_, res, ctx) => res(ctx.json(venueDetailHeaderData))
    //   )
    // )
    const params = { tenantId: 't1', venueId: 'v1' }
    render(<ApPageHeader />, { route: { params }, wrapper: Provider })

    fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    expect(mockNavigate).toBeCalledWith(expect.objectContaining({
      pathname: '/t/t1/venues/v1/edit/details'
    }))
  })
})
