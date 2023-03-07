/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, EdgeUrlsInfo, NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
}                                 from '@acx-ui/test-utils'

import { mockEdgeData, mockEdgeDhcpDataList, mockNetworkGroup, mockVenueData, mockVenueNetworkData } from '../__tests__/fixtures'

import AddNetworkSegmentation from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('Create NetworkSegmentation', () => {
  // eslint-disable-next-line @typescript-eslint/semi
  let params: { tenantId: string };
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.status(200))
      ),
      rest.post(
        NetworkSegmentationUrls.createNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(<AddNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: createNsgPath }
    })
    // step 1
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(serviceNameInput, 'TestService')
    await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with the property management enabled' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    const segmentsInput = await screen.findByRole('spinbutton', { name: 'Number of Segments' })
    await user.type(segmentsInput, '10')
    const devicesInput = await screen.findByRole('spinbutton', { name: 'Number of devices per Segment' })
    await user.type(devicesInput, '10')
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    await user.click(await screen.findByRole('button', { name: 'Select Pool' }))
    await user.click(await screen.findByText('PoolTest1'))
    await user.click(await screen.findByRole('button', { name: 'Select' }))
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )
    await user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step4
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })


  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(<AddNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: createNsgPath }
    })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/services`,
      hash: '',
      search: ''
    })
  })

  it('Add DHCP service', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddNetworkSegmentation />
      </Provider>, {
        route: { params, path: createNsgPath }
      })
    // step 1
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(serviceNameInput, 'TestService')
    await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with the property management enabled' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    user.click(await screen.findByRole('button', { name: 'Add' }))

    const dhcpServiceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(dhcpServiceNameInput, 'myTest')
    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const startIpInput = await screen.findByRole('textbox', { name: 'Start IP Address' })
    const endIpInput = await screen.findByRole('textbox', { name: 'End IP Address' })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await user.type(poolNameInput, 'Pool1')
    await user.type(subnetMaskInput, '255.255.255.0')
    await user.type(startIpInput, '1.1.1.1')
    await user.type(endIpInput, '1.1.1.5')
    await user.type(gatewayInput, '1.2.3.4')
    const addDhcpPoolDrawer = screen.getAllByRole('dialog')[1]
    await user.click(within(addDhcpPoolDrawer).getByRole('button', { name: 'Add' }))
    const addDhcpModal = screen.getAllByRole('dialog')[0]
    await user.click(within(addDhcpModal).getByRole('button', { name: 'Add' }))
  })

  it('Add DHCP pool', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddNetworkSegmentation />
      </Provider>, {
        route: { params, path: createNsgPath }
      })
    // step 1
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(serviceNameInput, 'TestService')
    await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with the property management enabled' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'SmartEdge' }),
      await screen.findByRole('option', { name: 'Smart Edge 1' })
    )
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    await user.selectOptions(
      dhcpSelect,
      await screen.findByRole('option', { name: 'TestDhcp-1' })
    )
    user.click(await screen.findByRole('button', { name: 'Select Pool' }))

    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const startIpInput = await screen.findByRole('textbox', { name: 'Start IP Address' })
    const endIpInput = await screen.findByRole('textbox', { name: 'End IP Address' })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await user.type(poolNameInput, 'Pool1')
    await user.type(subnetMaskInput, '255.255.255.0')
    await user.type(startIpInput, '1.1.1.1')
    await user.type(endIpInput, '1.1.1.5')
    await user.type(gatewayInput, '1.2.3.4')
    const addDhcpPoolDrawer = screen.getAllByRole('dialog')[1]
    await user.click(within(addDhcpPoolDrawer).getByRole('button', { name: 'Add' }))
  })
})
