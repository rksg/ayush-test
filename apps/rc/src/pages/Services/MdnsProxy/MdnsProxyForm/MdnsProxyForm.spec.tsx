import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  MdnsProxyUrls,
  ServiceType,
  websocketServerUrl,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  fireEvent,
  logRoles,
  mockServer,
  render,
  renderHook,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockedTenantId,
  mockedVenueList,
  mockedGetApiResponse,
  mockedServiceId,
  mockedMdnsProxyList
} from './__tests__/fixtures'
import MdnsProxyForm from './MdnsProxyForm'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
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

describe('MdnsProxyForm', () => {
  const params = {
    tenantId: mockedTenantId
  }
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })

  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MdnsProxyUrls.addMdnsProxy.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        MdnsProxyUrls.getMdnsProxy.url,
        (req, res, ctx) => res(ctx.json({ ...mockedGetApiResponse }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedVenueList }))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([...mockedMdnsProxyList]))
      )
    )
  })

  it('should create a service profile', async () => {
    render(
      <Provider>
        <MdnsProxyForm editMode={false} />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    await userEvent.type(await screen.findByRole('textbox', { name: /Service Name/ }), 'My mDNS')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating, { timeout: 2000 })

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should show toast when edit service profile failed', async () => {
    mockServer.use(
      rest.put(
        MdnsProxyUrls.updateMdnsProxy.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )

    render(
      <Provider>
        <MdnsProxyForm editMode={true} />
      </Provider>, {
        route: { params: { ...params, serviceId: mockedServiceId }, path: editPath }
      }
    )

    await userEvent.type(await screen.findByRole('textbox', { name: /service name/i }), 'My mDNS')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await screen.findByText('An error occurred')
  })

  it('should render edit form', async () => {
    render(
      <Provider>
        <MdnsProxyForm editMode={true} />
      </Provider>, {
        route: { params: { ...params, serviceId: mockedServiceId }, path: editPath }
      }
    )

    await screen.findByDisplayValue(mockedGetApiResponse.serviceName)
  })

  it('should navigate to the Select service page when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      return useTenantLink('/services')
    })

    render(
      <Provider>
        <MdnsProxyForm editMode={false} />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(selectServicePath.current)
  })
})
