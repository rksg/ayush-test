import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MdnsProxyUrls }           from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import { mockedVenueApList, mockedTenantId, mockedVenueId } from './__tests__/fixtures'

import MdnsProxyInstances from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('MdnsProxyInstances', () => {
  const params = {
    tenantId: mockedTenantId,
    venueId: mockedVenueId
  }

  const path = '/:tenantId/venues/:venueId/venue-details/services'

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxyApsByVenue.url,
        (req, res, ctx) => res(ctx.json(mockedVenueApList))
      )
    )
  })

  it('should render table with the giving data', async () => {
    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetAp = mockedVenueApList[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(targetAp.apName) })

    expect(targetRow).toBeInTheDocument()
  })

  xit('should navigate to the Add AP form', async () => {
    const { result } = renderHook(() => useTenantLink('devices/wifi/add'))

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const addApButton = screen.getByRole('button', { name: 'Add AP' })

    await userEvent.click(addApButton)

    expect(mockedUseNavigate).toHaveBeenCalledWith(result.current)
  })
})
