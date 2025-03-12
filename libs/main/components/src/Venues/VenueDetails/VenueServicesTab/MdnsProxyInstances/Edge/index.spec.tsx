import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeGeneralFixtures,
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { EdgeMdnsTab } from '.'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const targetData = mockEdgeMdnsViewDataList[0].activations[0]

const removeMdnsProxyFn = jest.fn()
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    loading, // remove and left unassigned to prevent warning
    dropdownClassName, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{
    loading: Boolean,
    showSearch: boolean,
    dropdownClassName?: string,
    onChange?: (value: string) => void
  }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

describe('Edge Venue MdnsProxyInstances', () => {
  const params = {
    tenantId: 'mock-tentnt-id',
    venueId: targetData.venueId
  }

  const path = '/:tenantId/t/venues/:venueId/venue-details/services'

  beforeEach(async () => {
    removeMdnsProxyFn.mockClear()

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: mockEdgeMdnsViewDataList
        }))
      ),
      rest.delete(
        EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          removeMdnsProxyFn(req.params)
          return res(ctx.status(202), ctx.json({ requestId: '__REQUEST_ID__' }))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should render table with the giving data', async () => {
    render(<Provider>
      <EdgeMdnsTab />
    </Provider>, {
      route: { params, path }
    })

    const firstRow = await checkIfReady()
    expect(firstRow).toHaveTextContent(targetData.edgeClusterName)
  })

  it('should remove the instance from mDNS Proxy service', async () => {
    render(<Provider>
      <EdgeMdnsTab />
    </Provider>, {
      route: { params, path }
    })

    const firstRow = await checkIfReady()
    await userEvent.click(within(firstRow).getByRole('radio'))

    const removeButton = await screen.findByRole('button', { name: 'Remove' })
    await userEvent.click(removeButton)

    expect(await screen.findByText(`Delete "${targetData.edgeClusterName}"?`)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Delete Instance' }))
    await waitFor(() => expect(removeMdnsProxyFn).toHaveBeenCalledTimes(1))
    expect(removeMdnsProxyFn).toBeCalledWith({
      venueId: params.venueId,
      serviceId: mockEdgeMdnsViewDataList[0].id,
      edgeClusterId: targetData.edgeClusterId
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should deactivate the instance from mDNS Proxy service', async () => {
    render(<Provider>
      <EdgeMdnsTab />
    </Provider>, {
      route: { params, path }
    })

    const firstRow = await checkIfReady()
    await userEvent.click(within(firstRow).getByRole('switch'))

    expect(await screen.findByText(`Delete "${targetData.edgeClusterName}"?`)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Delete Instance' }))
    await waitFor(() => expect(removeMdnsProxyFn).toHaveBeenCalledTimes(1))
    expect(removeMdnsProxyFn).toBeCalledWith({
      venueId: params.venueId,
      serviceId: mockEdgeMdnsViewDataList[0].id,
      edgeClusterId: targetData.edgeClusterId
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should change the mDNS Proxy service', async () => {
    const activateFn = jest.fn()

    mockServer.use(
      rest.put(
        EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          activateFn(req.params)
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )

    render(<Provider>
      <EdgeMdnsTab />
    </Provider>, {
      route: { params, path }
    })

    const firstRow = await checkIfReady()

    await userEvent.click(within(firstRow).getByRole('radio'))
    const changeButton = await screen.findByRole('button', { name: 'Change' })
    await userEvent.click(changeButton)

    const serviceDropdown = await screen.findByRole('combobox', { name: /mDNS Proxy Service/i })
    const dialog = screen.getByRole('dialog')
    await within(dialog).findByText(mockEdgeMdnsViewDataList[1].name)
    // should default select current service
    expect(serviceDropdown).toHaveValue(mockEdgeMdnsViewDataList[0].id)
    await userEvent.selectOptions(
      serviceDropdown,
      mockEdgeMdnsViewDataList[1].name)

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(activateFn).toHaveBeenCalledWith({
        venueId: params.venueId,
        serviceId: mockEdgeMdnsViewDataList[1].id,
        edgeClusterId: targetData.edgeClusterId
      })
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should add instance', async () => {
    const activateFn = jest.fn()

    mockServer.use(
      rest.put(
        EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          activateFn(req.params)
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )

    render(<Provider>
      <EdgeMdnsTab />
    </Provider>, {
      route: { params, path }
    })

    await checkIfReady()
    await userEvent.click(screen.getByRole('button', { name: 'Add Instance' }))

    const clusterDropdown = await screen.findByRole('combobox', { name: /Edge Cluster/i })
    await userEvent.selectOptions(
      clusterDropdown,
      mockEdgeClusterList.data[1].name)

    const serviceDropdown = screen.getByRole('combobox', { name: /mDNS Proxy Service/i })
    await userEvent.selectOptions(
      serviceDropdown,
      mockEdgeMdnsViewDataList[1].name )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(activateFn).toHaveBeenCalledWith({
        venueId: params.venueId,
        serviceId: mockEdgeMdnsViewDataList[1].id,
        edgeClusterId: mockEdgeClusterList.data[1].clusterId
      })
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

const checkIfReady = async () => {
  const firstRow = await screen.findByRole('row',
    { name: new RegExp(targetData.edgeClusterName) })
  return firstRow
}