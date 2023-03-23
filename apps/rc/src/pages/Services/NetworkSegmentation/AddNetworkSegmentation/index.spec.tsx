/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  DpskUrls,
  EdgeDhcpUrls,
  EdgeUrlsInfo,
  NetworkSegmentationUrls,
  PersonaUrls,
  PropertyUrlsInfo,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockDpsk,
  mockEdgeData,
  mockEdgeDhcpDataList,
  mockNetworkGroup,
  mockNsgSwitchInfoData,
  mockPersonaGroup,
  mockPropertyConfigs,
  mockVenueData,
  mockVenueNetworkData,
  switchLagList,
  switchPortList,
  switchVlanUnion,
  webAuthList
} from '../__tests__/fixtures'

import AddNetworkSegmentation from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
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

describe('AddNetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
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
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: switchPortList }))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(switchLagList))
      ),
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...webAuthList[0] }))
      ),
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      ),
      rest.post(
        NetworkSegmentationUrls.createNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.distributionSwitches }))
      ),
      rest.get(
        NetworkSegmentationUrls.getAccessSwitchesByDS.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.accessSwitches }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateAccessSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
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

    // step 4
    await user.click(await screen.findByRole('button', { name: 'Add Distribution Switch' }))
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Distribution Switch' }),
      await screen.findByRole('option', { name: 'FMN4221R00H---DS---3' })
    )
    await user.type(await screen.findByRole('textbox', { name: 'VLAN Range' }), '10')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface ID' }), '12')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface IP Address' }), '1.2.3.4')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface Subnet Mask' }), '255.255.255.0')

    await user.click(await screen.findByRole('button', { name: 'Select' }))
    const asTransfer = await screen.findByRole('dialog', { name: /Select Access Switches/i })
    await user.click(await within(asTransfer).findByText(/FEK3224R09N---AS---3/i))
    await user.click(await within(asTransfer).findByRole('button', { name: /Add/i }))

    await user.click(await within(asTransfer).findByRole('button', { name: 'Apply' }))

    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Next' }))

    // step5
    const asRow = await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    await user.click(asRow)
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })

})
