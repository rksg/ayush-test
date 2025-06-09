import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  EdgeMdnsProxyUrls,
  CommonUrlsInfo,
  EdgeUrlsInfo,
  VenueFixtures,
  EdgeGeneralFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import AddEdgeMdnsProxy from './'

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

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
  const expectedListPath = getServiceRoutePath({
    type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.LIST
  })

  beforeEach(async () => {
    mockedAddReq.mockClear()
    mockedUseNavigate.mockClear()

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.addEdgeMdnsProxy.url,
        (req, res, ctx) => {
          mockedAddReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ))
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

  it('should navigate to the table view when clicking Cancel button', async () => {
    render(<Provider>
      <AddEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: createPath }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toBeCalledWith('/mock-t/t/' + expectedListPath, { replace: true })
  })

  describe('API failed', () => {
    it('should catch profile API error', async () => {
      const mockedFn = jest.fn()
      const mockedConsoleFn = jest.fn()
      jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)

      mockServer.use(
        rest.post(
          EdgeMdnsProxyUrls.addEdgeMdnsProxy.url,
          (req, res, ctx) => {
            mockedFn(req.body)
            return res(ctx.status(500))
          }
        ))

      render(<Provider>
        <AddEdgeMdnsProxy />
      </Provider>, {
        route: { params, path: createPath }
      })

      // eslint-disable-next-line max-len
      await userEvent.type(await screen.findByRole('textbox', { name: /Service Name/ }), 'test failed')

      await userEvent.click(screen.getByRole('button', { name: 'Add Rule' }))

      await screen.findByRole('dialog')
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: 'Type' }),
        screen.getByRole('option', { name: 'Apple Mobile Devices' })
      )
      await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), '2')
      await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), '6')

      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await screen.findByRole('heading', { name: 'Scope', level: 3 })
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await screen.findByRole('heading', { name: 'Summary', level: 3 })
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(mockedFn).toBeCalledTimes(1))
      await waitFor(() => expect(mockedConsoleFn).toBeCalled())
      expect(mockedUseNavigate).toBeCalledTimes(1)
      expect(mockedUseNavigate).toBeCalledWith({
        hash: '',
        pathname: '/mock-t/t/'+expectedListPath,
        search: ''
      }, { replace: true })
    })
  })
})
