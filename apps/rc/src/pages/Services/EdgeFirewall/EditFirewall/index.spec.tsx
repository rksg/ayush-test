import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import {
  ACLDirection, AccessAction, AddressType,
  CommonUrlsInfo, DdosAttackType, EdgeFirewallSetting,
  EdgeFirewallUrls, EdgeUrlsInfo, ProtocolType } from '@acx-ui/rc/utils'
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
import { mockFirewall } from '../__tests__/fixtures'

import EditFirewall from './'


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
      onChange={(e) => {
        props.onChange?.(e.target.value)}
      }>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockedGetFn = jest.fn()
const mockedUpdateFn = jest.fn()
describe('Edit edge firewall service', () => {
  beforeEach(() => {
    mockedGetFn.mockReset()
    mockedUpdateFn.mockReset()

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFn()
          return res(ctx.json(mockFirewall))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => {
          const filteredSN = req.body?.filters?.serialNumber
          if (filteredSN) {
            const usedData = mockEdgeList.data.filter((item) => {
              return filteredSN.includes(item.serialNumber)
            })

            return res(ctx.json({ ...mockEdgeList, data: usedData, totalCount: usedData.length }))
          } else {
            return res(ctx.json(mockEdgeList))
          }
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.put(
        EdgeFirewallUrls.updateEdgeFirewall.url,
        (req, res, ctx) => {
          mockedUpdateFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  afterEach(() => {
    mockedGetFn.mockReset()
    mockedUpdateFn.mockReset()
  })

  it('should correctly edit DDoS rule', async () => {
    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await waitFor(() => {
      expect(mockedGetFn).toBeCalled()
    })
    // Step 1
    await waitFor(() => {
      expect(body.getByRole('textbox', { name: 'Service Name' })).toHaveAttribute('value', 'test')
    })
    // edit service name
    await type(body.getByRole('textbox', { name: 'Service Name' }), '123')
    expect(body.getByRole('switch', { name: 'ddos' })).not.toBeChecked()
    expect(body.getByRole('switch', { name: 'acl' })).toBeChecked()

    // edit ddos rule
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
    const icmpRow = await within(drawer).findByRole('row', { name: /ICMP/ })
    // edit added rule
    await click(await within(icmpRow).findByRole('checkbox'))
    await click(await within(drawer).findByRole('button', { name: 'Edit' }))
    await type(within(dialog).getByRole('spinbutton'), '1')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await click(within(drawer).getByRole('button', { name: 'Apply' }))

    // Navigate to Step 2
    await click(screen.getByText('Scope'))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await body.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    await click(actions.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(mockedUpdateFn).toBeCalledWith({
        serviceName: 'test123',
        edgeIds: [],
        // tags: [],
        ddosRateLimitingEnabled: true,
        ddosRateLimitingRules: [{
          ddosAttackType: 'ICMP',
          rateLimiting: 61
        }],
        statefulAclEnabled: true,
        statefulAcls: [{
          name: 'Inbound ACL',
          direction: 'INBOUND',
          rules: []
        }, {
          name: 'Outbound ACL',
          description: '',
          direction: 'OUTBOUND',
          rules: [{
            description: '',
            accessAction: 'BLOCK',
            protocolType: 'ICMP',
            protocolValue: null,
            sourceAddressType: 'ANY_IP_ADDRESS',
            sourceAddress: '',
            sourceAddressMask: '',
            sourcePort: '',
            destinationAddressType: 'ANY_IP_ADDRESS',
            destinationAddress: '',
            destinationAddressMask: '',
            destinationPort: ''
          }]
        }]
      })
    })

    cleanup()
  }, 30000)

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  }, 30000)

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  }, 30000)

  it.skip('should correctly edit stateful ACL rule', async () => {
    const mockFirewall2: EdgeFirewallSetting = _.cloneDeep(mockFirewall)
    mockFirewall2.edgeIds = ['0000000002', '0000000003']
    mockFirewall2.ddosRateLimitingEnabled = true
    mockFirewall2.ddosRateLimitingRules = [{
      ddosAttackType: DdosAttackType.ICMP,
      rateLimiting: 12
    }]

    mockFirewall2.statefulAcls.push(
      {
        name: 'Inbound ACL',
        direction: ACLDirection.INBOUND,
        description: '',
        rules: [{
          priority: 1,
          accessAction: AccessAction.ALLOW,
          protocolType: ProtocolType.ICMP,
          protocolValue: 0,
          sourceAddressType: AddressType.SUBNET_ADDRESS,
          sourceAddress: '3.3.3.3',
          sourceAddressMask: '255.255.0.0',
          sourcePort: '',
          destinationAddressType: AddressType.IP_ADDRESS,
          destinationAddress: '12.12.12.11',
          destinationAddressMask: '',
          destinationPort: ''
        },{
          priority: 2,
          accessAction: AccessAction.ALLOW,
          protocolType: ProtocolType.ESP,
          protocolValue: 0,
          sourceAddressType: AddressType.SUBNET_ADDRESS,
          sourceAddress: '5.5.1.1',
          sourceAddressMask: '255.255.255.0',
          sourcePort: '',
          destinationAddressType: AddressType.IP_ADDRESS,
          destinationAddress: '8.8.8.8',
          destinationAddressMask: '',
          destinationPort: ''
        },{
          priority: 3,
          accessAction: AccessAction.BLOCK,
          protocolType: ProtocolType.ANY,
          protocolValue: 0,
          sourceAddressType: AddressType.ANY_IP_ADDRESS,
          sourceAddress: '',
          sourceAddressMask: '',
          sourcePort: '',
          destinationAddressType: AddressType.ANY_IP_ADDRESS,
          destinationAddress: '',
          destinationAddressMask: '',
          destinationPort: ''
        }]
      }
    )

    const mockedGetFn2 = jest.fn()
    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFn2()
          return res(ctx.json(mockFirewall2))
        }
      )
    )

    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await waitFor(() => {
      expect(mockedGetFn2).toBeCalled()
    })
    // Step 1
    await waitFor(() => {
      expect(body.getByRole('textbox', { name: 'Service Name' })).toHaveAttribute('value', 'test')
    })

    // edit service name
    await waitFor(() => {
      expect(body.getByRole('switch', { name: 'ddos' })).toBeChecked()
    })
    expect(body.getByRole('switch', { name: 'acl' })).toBeChecked()

    // edit outbound acl
    const outboundRow = await body.findByRole('row', { name: /Outbound ACL/i })
    await click(within(outboundRow).getByRole('radio'))
    await click(body.getByRole('button', { name: 'Edit' }))
    let drawer = await screen.findByRole('dialog')
    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // add new acl rule
    const addRuleBtn = within(drawer).getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    const dialogs = screen.queryAllByRole('dialog')
    const dialog1 = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    await click(await within(dialog1).findByText(/Allow/))
    await selectOptions(
      await within(dialog1).findByRole('combobox', { name: 'Protocol Type' }),
      'Custom')
    await type(within(dialog1).getByRole('spinbutton', { name: 'Protocol Value' }), '20')
    let src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'IP Address' }))
    await type(within(src).getByPlaceholderText('IP Address'), '1.2.3.4')
    let destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await type(within(destination).getByRole('textbox', { name: 'Port' }), '120')
    await click(within(dialog1).getByRole('button', { name: 'Add' }))
    await click(within(drawer).getByRole('button', { name: 'Add' }))

    // edit inbound acl
    const inboundRow = await body.findByRole('row', { name: /Inbound ACL/i })
    await click(within(inboundRow).getByRole('radio'))
    await click(body.getByRole('button', { name: 'Edit' }))
    drawer = await screen.findByRole('dialog')
    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // edit existing rule
    const icmpRow = await within(drawer).findByRole('row', { name: /ICMP/ })
    await click(await within(icmpRow).findByRole('checkbox'))
    await click(await within(drawer).findByRole('button', { name: 'Edit' }))

    const dialog2 = screen.queryAllByRole('dialog')
      .filter(elem => elem.classList.contains('ant-modal'))[0]

    src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Any IP Address' }))
    destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Subnet Address' }))
    await type(within(destination).getByPlaceholderText('Mask'), '255.255.255.0')
    await click(within(dialog2).getByRole('button', { name: 'Add' }))

    const espRow = await within(drawer).findByRole('row', { name: /ESP/ })
    await click(await within(espRow).findByRole('checkbox'))
    await click(await within(drawer).findByRole('button', { name: 'Clear selection' }))
    await click(await within(espRow).findByRole('checkbox'))
    await click(await within(drawer).findByRole('button', { name: 'Edit' }))

    await click(await within(src).findByRole('radio', { name: 'IP Address' }))
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await click(within(dialog2).getByRole('button', { name: 'Add' }))
    await click(within(drawer).getByRole('button', { name: 'Add' }))

    // Navigate to Step 2
    await click(screen.getByText('Scope'))
    expect(await body.findByRole('heading', { name: 'Scope' })).toBeVisible()

    // Step 2
    const rows = await body.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)
    // eslint-disable-next-line max-len
    expect(within(body.getByRole('row', { name: /Smart Edge 2/i })).getByRole('switch')).toBeChecked()
    await click(
      within(body.getByRole('row', { name: /Smart Edge 2/i })).getByRole('checkbox'))
    await click(await body.findByRole('button', { name: 'Deactivate' }))


    await click(actions.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(mockedUpdateFn).toBeCalledWith({
        serviceName: 'test',
        edgeIds: ['0000000003'],
        // tags: [],
        ddosRateLimitingEnabled: true,
        ddosRateLimitingRules: [{
          ddosAttackType: 'ICMP',
          rateLimiting: 12
        }],
        statefulAclEnabled: true,
        statefulAcls: [{
          name: 'Inbound ACL',
          direction: 'INBOUND',
          description: '',
          rules: [{
            accessAction: 'ALLOW',
            protocolType: 'ICMP',
            protocolValue: 0,
            sourceAddressType: 'ANY_IP_ADDRESS',
            sourceAddress: '',
            sourceAddressMask: '',
            sourcePort: '',
            destinationAddressType: 'SUBNET_ADDRESS',
            destinationAddress: '12.12.12.11',
            destinationAddressMask: '255.255.255.0',
            destinationPort: ''
          },{
            accessAction: 'ALLOW',
            protocolType: 'ESP',
            protocolValue: 0,
            sourceAddressType: 'IP_ADDRESS',
            sourceAddress: '5.5.1.1',
            sourceAddressMask: '',
            sourcePort: '',
            destinationAddressType: 'ANY_IP_ADDRESS',
            destinationAddress: '',
            destinationAddressMask: '',
            destinationPort: ''
          }]
        }, {
          name: 'Outbound ACL',
          description: '',
          direction: 'OUTBOUND',
          rules: [{
            description: '',
            accessAction: 'BLOCK',
            protocolType: 'ICMP',
            protocolValue: null,
            sourceAddressType: 'ANY_IP_ADDRESS',
            sourceAddress: '',
            sourceAddressMask: '',
            sourcePort: '',
            destinationAddressType: 'ANY_IP_ADDRESS',
            destinationAddress: '',
            destinationAddressMask: '',
            destinationPort: ''
          },{
            accessAction: 'ALLOW',
            protocolType: 'CUSTOM',
            protocolValue: 20,
            sourceAddressType: 'IP_ADDRESS',
            sourceAddress: '1.2.3.4',
            sourceAddressMask: '',
            destinationAddressType: 'ANY_IP_ADDRESS',
            destinationAddress: '',
            destinationAddressMask: '',
            destinationPort: '120'
          }]
        }]
      })
    })
    cleanup()
  }, 40000)

})
