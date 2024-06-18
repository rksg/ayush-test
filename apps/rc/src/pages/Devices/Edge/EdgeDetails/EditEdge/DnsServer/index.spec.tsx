import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                           from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                   from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import DnsServer from './index'

const { mockEdgeDnsServersData, mockEdgeClusterList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const updateRequestSpy = jest.fn()

describe('EditEdge dns servers', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updateDnsServers.url,
        (req, res, ctx) => {
          updateRequestSpy()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create DnsServer successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            dnsServersData: mockEdgeDnsServersData,
            isDnsServersDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <DnsServer />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/dns' }
      })
    const primary = await screen.findByRole('textbox', { name: 'Primary DNS Server' })
    const secondary = await screen.findByRole('textbox', { name: 'Secondary DNS Server' })

    await waitFor(() => expect(primary).toHaveValue('1.1.1.1'))
    await waitFor(() => expect(secondary).toHaveValue('2.2.2.2'))
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            dnsServersData: mockEdgeDnsServersData,
            isDnsServersDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <DnsServer />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/dns' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })

  it('should update DnsServer successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            dnsServersData: mockEdgeDnsServersData,
            isDnsServersDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <DnsServer />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/dns' }
      })
    const primary = await screen.findByRole('textbox', { name: 'Primary DNS Server' })
    const secondary = await screen.findByRole('textbox', { name: 'Secondary DNS Server' })
    fireEvent.change(primary, { target: { value: '1.2.3.4' } })
    fireEvent.change(secondary, { target: { value: '5.6.7.8' } })
    const applyButton = screen.getByRole('button', { name: 'Apply DNS Server' })
    await user.click(applyButton)
    await waitFor(() => expect(updateRequestSpy).toHaveBeenCalledTimes(1))
  })

})

describe('EditEdge dns servers fail case', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getDnsServers.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDnsServersData))
      ),
      rest.patch(
        EdgeUrlsInfo.updateDnsServers.url,
        (req, res, ctx) => res(ctx.status(500))
      )
    )
  })

  it('update DnsServer failed', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            dnsServersData: mockEdgeDnsServersData,
            isDnsServersDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <DnsServer />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/dns' }
      })
    const primary = await screen.findByRole('textbox', { name: 'Primary DNS Server' })
    const secondary = await screen.findByRole('textbox', { name: 'Secondary DNS Server' })
    fireEvent.change(primary, { target: { value: '1.2.3.4' } })
    fireEvent.change(secondary, { target: { value: '5.6.7.8' } })
    const applyButton = screen.getByRole('button', { name: 'Apply DNS Server' })
    await user.click(applyButton)
    // TODO
    // await screen.findAllByText('Server Error')
  })

})