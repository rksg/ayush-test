import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { AddressType, CommonUrlsInfo, EdgeFirewallUrls, EdgeUrlsInfo, ProtocolType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  cleanup,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList } from '../../../Devices/Edge/__tests__/fixtures'

import AddFirewall from './'

const { click, type, selectOptions, clear } = userEvent

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
    mode,
    ...props
  }: React.PropsWithChildren<{
    showSearch: boolean,
    mode: string,
    onChange?: (value: string) => void }>) => {
    return (<select {...props}
      multiple={mode==='tags' || mode==='multiple'}
      onChange={(e) => props.onChange?.(e.target.value)}>
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
describe('Add edge firewall service', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
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
    const addRuleBtn = within(drawer).getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    await screen.findByText('Add DDoS Rule')
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'ICMP')
    await clear(within(dialog).getByRole('spinbutton'))
    await type(within(dialog).getByRole('spinbutton'), '6')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await within(drawer).findByRole('row', { name: /ICMP/ })

    // add another rule
    await click(addRuleBtn)
    await click(await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }))
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'DNS Response')
    await type(within(dialog).getByRole('spinbutton'), '{backspace}{backspace}{backspace}2')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await within(drawer).findByRole('row', { name: /DNS Response/ })
    await click(within(drawer).getByRole('button', { name: 'Apply' }))

    // Navigate to Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    // Navigate to Step 3
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

    const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((ddosResult.parentNode as HTMLDivElement).textContent)
      .toBe('DDoS Rate-limitingON (2 Rules)')

    expect(screen.getByText('SmartEdge (0)')).not.toBeNull()

    await click(actions.getByRole('button', { name: 'Finish' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        serviceName: 'Test 1',
        edgeIds: [],
        ddosRateLimitingEnabled: true,
        ddosRateLimitingRules: [{
          ddosAttackType: 'ICMP',
          rateLimiting: 6
        }, {
          ddosAttackType: 'DNS_RESPONSE',
          rateLimiting: 2
        }],
        statefulAclEnabled: false,
        statefulAcls: []
      })
    })

    cleanup()
  }, 30000)

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<AddFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  }, 30000)

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<AddFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  }, 30000)

  it.skip('should correctly create with stateful ACL rule', async () => {
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

    // edit outbound ACL
    const outboundRow = await body.findByRole('row', { name: /Outbound ACL/i })
    await click(within(outboundRow).getByRole('radio'))
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
      'ESP')
    const src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Subnet Address' }))
    await type(within(src).getByPlaceholderText('Network address'), '1.1.1.1')
    await type(within(src).getByPlaceholderText('Mask'), '255.255.255.254')
    const destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await type(within(destination).getByRole('textbox', { name: 'Port' }), '2-10')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await click(await within(drawer).findByRole('row', { name: /ESP/ }))
    await click(within(drawer).getByRole('button', { name: 'Add' }))

    // Navigate to Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)
    // activate by button in action column
    await click(
      within(rows.filter(item => item.dataset.rowKey === '0000000003')[0]).getByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Activate' }))

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
              protocolType: ProtocolType.ESP,
              sourceAddressType: AddressType.SUBNET_ADDRESS,
              sourceAddress: '1.1.1.1',
              sourceAddressMask: '255.255.255.254',
              destinationAddressType: AddressType.ANY_IP_ADDRESS,
              destinationAddress: '',
              destinationAddressMask: '',
              destinationPort: '2-10'
            }]
        }]
      })
    })
  }, 30000)
})
