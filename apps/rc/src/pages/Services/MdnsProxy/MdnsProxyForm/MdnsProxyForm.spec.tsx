import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, MdnsProxyUrls, ServiceType, websocketServerUrl } from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                        from '@acx-ui/react-router-dom'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, renderHook, screen }                         from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'

import { mockedFormData, mockedTenantId, mockedVenueList } from './__tests__/fixtures'
import MdnsProxyForm                                       from './MdnsProxyForm'


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
        (req, res, ctx) => res(ctx.json(mockedFormData))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueList))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
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

    await userEvent.type(await screen.findByRole('textbox', { name: /service name/i }), 'My mDNS')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should show toast when create service profile failed', async () => {
    mockServer.use(
      rest.post(
        MdnsProxyUrls.addMdnsProxy.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )

    render(
      <Provider>
        <MdnsProxyForm editMode={false} />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    await userEvent.type(await screen.findByRole('textbox', { name: /service name/i }), 'My mDNS')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await screen.findByText('An error occurred')
  })

  it('should render edit form', async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxy.url,
        (req, res, ctx) => res(ctx.json(mockedFormData))
      )
    )

    render(
      <Provider>
        <MdnsProxyForm editMode={true} />
      </Provider>, {
        route: { params: { ...params, serviceId: 'mocked_service_id' }, path: editPath }
      }
    )

    await screen.findByDisplayValue(mockedFormData.name)
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
