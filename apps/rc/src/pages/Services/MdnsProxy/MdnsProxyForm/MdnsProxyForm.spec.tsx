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
  mockServer,
  render,
  renderHook,
  screen
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

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    return (
      <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {children}
      </select>
    )
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

describe('MdnsProxyForm', () => {
  const params = {
    tenantId: mockedTenantId
  }
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })

  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })

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

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Type' }),
      await screen.findByRole('option', { name: 'AirDisk' })
    )
    await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), '1')
    await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), '2')

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <MdnsProxyForm editMode={false} />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'mDNS Proxy'
    })).toBeVisible()
  })

  it.skip('should show toast when edit service profile failed', async () => {
    const targetErrorMessage = 'Profile not found'

    mockServer.use(
      rest.put(
        MdnsProxyUrls.updateMdnsProxy.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            requestId: 'fa60fbba-529f-4206-a131-3fe778a4202f',
            errors: [{
              code: 'WIFI-10000',
              message: targetErrorMessage
            }]
          }))
        }
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
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // TODO
    // await screen.findByText('Server Error')
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

  it('should navigate to the table view when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      return useTenantLink(getServiceRoutePath({
        type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST
      }))
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
