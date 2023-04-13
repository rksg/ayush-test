import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { AddressType, EdgeFirewallUrls, EdgeUrlsInfo, ProtocolType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList } from '../../../Devices/Edge/__tests__/fixtures'

import AddFirewall from './'

const { click, type, selectOptions } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockedAddFn = jest.fn()
describe('SettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        EdgeFirewallUrls.addEdgeFirewall.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly create with DDoS rule', async () => {
    render(<AddFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()

    // Step 1
    await type(body.getByRole('textbox', { name: 'Service Name' }), 'Test 1')
    await click(body.getByRole('switch', { name: 'ddos' }))
    const drawer = await screen.findByRole('dialog')
    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()

    // add ddos rule
    await click(within(drawer).getByRole('button', { name: 'Add Rule' }))
    await screen.findByText('Add DDoS Rule')
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'ICMP')
    await type(within(dialog).getByRole('spinbutton'), '6')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await click(await within(drawer).findByRole('row', { name: /ICMP/ }))
    await click(within(drawer).getByRole('button', { name: 'Apply' }))

    // Navigate to Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)
    // activate by button in action column
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await click(within(row).getByRole('switch'))

    // Navigate to Step 3
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

    const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((ddosResult.parentNode as HTMLDivElement).textContent)
      .toBe('DDoS Rate-limitingON (1 Rule)')

    expect(screen.getByText('SmartEdge (1)')).not.toBeNull()
    expect(screen.getByText('Smart Edge 2')).not.toBeNull()

    await click(actions.getByRole('button', { name: 'Finish' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        serviceName: 'Test 1',
        edgeIds: ['0000000002'],
        ddosRateLimitingEnabled: true,
        ddosRateLimitingRules: [{
          ddosAttackType: 'ICMP',
          rateLimiting: 6
        }],
        statefulAclEnabled: false,
        statefulAcls: []
      })
    })
  })

  it('should correctly create with stateful ACL rule', async () => {
    render(<AddFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()

    // Step 1
    await type(body.getByRole('textbox', { name: 'Service Name' }), 'Test 2')
    await click(body.getByRole('switch', { name: 'acl' }))
    const outboundRow = await body.findByRole('row', { name: /Outbound ACL/i })
    await click(within(outboundRow).getByRole('checkbox'))
    await click(body.getByRole('button', { name: 'Edit' }))
    const drawer = await screen.findByRole('dialog')
    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // add stateful ACL rule
    await click(await within(drawer).findByText('Add Rule'))
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    expect(dialog).not.toBeNull()
    await click(await within(dialog).findByText(/Block/))
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Protocol Type' }),
      'UDP')
    const src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Subnet Address' }))
    await type(within(src).getByPlaceholderText('Network address'), '1.1.1.1')
    await type(within(src).getByPlaceholderText('Mask'), '255.255.255.255')
    const destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await click(await within(drawer).findByRole('row', { name: /UDP/ }))
    await click(within(drawer).getByRole('button', { name: 'Add' }))

    // Navigate to Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)
    // activate by button in action column
    const row = await screen.findByRole('row', { name: /Smart Edge 3/i })
    await click(within(row).getByRole('switch'))

    // Navigate to Step 3
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

    const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((ddosResult.parentNode as HTMLDivElement).textContent)
      .toBe('DDoS Rate-limitingOFF')

    const aclResult = await screen.findByText(/Stateful ACL/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((aclResult.parentNode as HTMLDivElement).textContent)
      .toBe('Stateful ACLON (2 ACL)')

    expect(screen.getByText('SmartEdge (1)')).not.toBeNull()
    expect(screen.getByText('Smart Edge 3')).not.toBeNull()

    await click(actions.getByRole('button', { name: 'Finish' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        serviceName: 'Test 2',
        edgeIds: ['0000000003'],
        ddosRateLimitingEnabled: false,
        ddosRateLimitingRules: [],
        statefulAclEnabled: true,
        statefulAcls: [{
          name: 'Inbound ACL',
          direction: 'INBOUND',
          rules: []
        },{
          name: 'Outbound ACL',
          direction: 'OUTBOUND',
          rules: [
            {
              accessAction: 'BLOCK',
              protocolType: ProtocolType.UDP,
              sourceAddressType: AddressType.SUBNET_ADDRESS,
              sourceAddress: '1.1.1.1',
              sourceAddressMask: '255.255.255.255',
              destinationAddressType: AddressType.ANY_IP_ADDRESS,
              priority: 4
            }]
        }]
      })
    })
  })
})
