import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  EdgeMdnsProxyUrls } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import AddEdgeMdnsProxy from './'

const mockedUseNavigate = jest.fn()
const mockedAddReq = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate
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
  const params = { tenantId: 'mock-t' }

  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })

  beforeEach(async () => {
    mockedAddReq.mockClear()

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.addEdgeMdnsProxy.url,
        (req, res, ctx) => {
          mockedAddReq(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create a service profile', async () => {
    render(<Provider>
      <AddEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: createPath }
    })

    await userEvent.type(await screen.findByRole('textbox', { name: /Service Name/ }), 'My mDNS')

    await userEvent.click(screen.getByRole('button', { name: 'Add Rule' }))

    await screen.findByRole('dialog')
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Type' }),
      screen.getByRole('option', { name: 'AirDisk' })
    )
    await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), '1')
    await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), '2')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedAddReq).toBeCalledWith({
        name: 'My mDNS',
        forwardingRules: [{
          ruleIndex: 0,
          fromVlan: 1,
          toVlan: 2,
          serviceType: 'AIRDISK'
        }]
      })
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider>
      <AddEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: createPath }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Edge mDNS Proxy'
    })).toBeVisible()
  })

  it('should navigate to the table view when clicking Cancel button', async () => {
    render(<Provider>
      <AddEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: createPath }
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.LIST
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toBeCalledWith({
      hash: '',
      pathname: '/mock-t/t/'+targetPath,
      search: ''
    })
  })
})
