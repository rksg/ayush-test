import userEvent           from '@testing-library/user-event'
import { find, omit, set } from 'lodash'
import { rest }            from 'msw'

import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  EdgeMdnsProxyUrls,
  EdgeMdnsFixtures,
  CommonUrlsInfo,
  VenueFixtures,
  EdgeGeneralFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import EditEdgeMdnsProxy from './'

const { mockEdgeMdnsViewDataList, mockEdgeMdnsSetting } = EdgeMdnsFixtures
const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUseNavigate = jest.fn()
const mockUpdateReq = jest.fn()

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
  const params = { tenantId: 'mock-t', serviceId: mockEdgeMdnsViewDataList[0].id }

  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.EDIT })

  beforeEach(async () => {
    mockedUseNavigate.mockClear()
    mockUpdateReq.mockClear()

    mockServer.use(
      rest.put(
        EdgeMdnsProxyUrls.updateEdgeMdnsProxy.url,
        (req, res, ctx) => {
          mockUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.get(
        EdgeMdnsProxyUrls.getEdgeMdnsProxy.url,
        (_, res, ctx) => res(ctx.json(mockEdgeMdnsSetting))
      ),
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockEdgeMdnsViewDataList }))
      )
    )
  })

  it('should correctly edit rules and trigger update api', async () => {
    const originData = mockEdgeMdnsViewDataList[0]

    render(<Provider>
      <EditEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: editPath }
    })

    const formBody = await basicCheck()
    const nameInput = within(formBody).getByRole('textbox', { name: /Service Name/ })
    await userEvent.type(nameInput, 'testEdit')

    const row = await within(formBody).findByRole('row', { name: 'Apple TV 10 200' })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByRole('spinbutton', { name: /To VLAN/i }), '5')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))

    await(userEvent.click(screen.getByRole('button', { name: 'Apply' })))

    const expected = originData.forwardingRules.map(i => ({
      ...omit(i, 'service'),
      serviceType: i.service
    }))
    const target = find(expected, { ruleIndex: 0 })
    set(target!, 'toVlan', 2005)

    await waitFor(() =>
      expect(mockUpdateReq).toBeCalledWith({
        name: 'edge-mdns-proxy-1testEdit',
        forwardingRules: expected
      }))
  })

  it.skip('should correctly edit activations and trigger update api', async () => {
    const originData = mockEdgeMdnsViewDataList[0]
    const mockDeactivateReq = jest.fn()
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.delete(
        EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          mockDeactivateReq(req.params)
          return res(ctx.status(202))
        }
      )
    )

    render(<Provider>
      <EditEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: editPath }
    })

    const formBody = await basicCheck()
    const nameInput = within(formBody).getByRole('textbox', { name: /Service Name/ })
    await userEvent.type(nameInput, 'testEdit2')

    await userEvent.click(screen.getByRole('button', { name: 'Scope' }))

    // venue table
    const row = await within(formBody).findByRole('row', { name: /Mock Venue 1/ })
    await userEvent.click(within(row).getByRole('radio'))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Select RUCKUS Edge clusters' }))
    const dialog = await screen.findByRole('dialog')

    const clusterRow = await within(dialog).findByRole('row', { name: /Edge Cluster 1/ })
    const switchBtn = await within(clusterRow).findByRole('switch')
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)

    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    await(userEvent.click(screen.getByRole('button', { name: 'Apply' })))

    const targetCluster = mockEdgeClusterList.data[0]
    await waitFor(() =>
      expect(mockDeactivateReq).toBeCalledWith({
        serviceId: originData.id,
        venueId: targetCluster.venueId,
        edgeClusterId: targetCluster.clusterId
      }))
  })

  it('should navigate to the table view when clicking Cancel button', async () => {
    render(<Provider>
      <EditEdgeMdnsProxy />
    </Provider>, {
      route: { params, path: editPath }
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.LIST
    })

    await basicCheck()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toBeCalledWith({
      hash: '',
      pathname: '/mock-t/t/'+targetPath,
      search: ''
    })
  })

  describe('API failed', () => {
    it('should catch profile API error', async () => {
      const mockedConsoleFn = jest.fn()
      jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)

      mockServer.use(
        rest.put(
          EdgeMdnsProxyUrls.updateEdgeMdnsProxy.url,
          (req, res, ctx) => {
            mockUpdateReq(req.body)
            return res(ctx.status(500))
          }
        ))

      render(<Provider>
        <EditEdgeMdnsProxy />
      </Provider>, {
        route: { params, path: editPath }
      })

      await basicCheck()
      const form = screen.getByTestId('steps-form')
      await userEvent.click(within(form).getByRole('button', { name: 'Apply' }))
      await waitFor(() => expect(mockUpdateReq).toBeCalledTimes(1))
      await waitFor(() => expect(mockedConsoleFn).toBeCalled())
      expect(mockedUseNavigate).toBeCalledTimes(1)
    })
    it('should catch relation API error', async () => {
      render(<Provider>
        <EditEdgeMdnsProxy />
      </Provider>, {
        route: { params, path: editPath }
      })

      await basicCheck()
      const form = screen.getByTestId('steps-form')
      await userEvent.click(within(form).getByRole('button', { name: 'Apply' }))
      await waitFor(() => expect(mockUpdateReq).toBeCalledTimes(1))
      await waitFor(() => expect(mockedUseNavigate).toBeCalledTimes(1))
    })
  })
})

const basicCheck = async (): Promise<HTMLElement> => {
  const originData = mockEdgeMdnsSetting

  const formBody = await screen.findByTestId('steps-form-body')
  expect(formBody).toBeVisible()
  const nameInput = await within(formBody).findByRole('textbox', { name: /Service Name/ })
  expect(nameInput).toHaveValue(originData.name)
  return formBody
}