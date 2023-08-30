import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import {
  AccessAction,
  ACLDirection,
  AddressType,
  DdosAttackType,
  DdosRateLimitingRule,
  EdgeFirewallSetting,
  EdgeUrlsInfo,
  getServiceRoutePath,
  ProtocolType,
  ServiceOperation,
  ServiceType,
  StatefulAcl
} from '@acx-ui/rc/utils'
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
import { mockFirewall } from '../__tests__/fixtures'

import { SettingsForm } from './SettingsForm'
import { SummaryForm }  from './SummaryForm'

import FirewallForm from './'

const { click, type } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

jest.mock('../FirewallForm/SettingsForm/StatefulACLFormItem/StatefulACLConfigDrawer', () => ({
  StatefulACLConfigDrawer: (props: {
    visible: boolean,
    setVisible: (visible: boolean) => void,
    editData: StatefulAcl
  }) => {
    return props.visible && <div data-testid='rc-StatefulACLConfigDrawer'>
      <div onClick={() => {
        props.setVisible(false)
      }}>Apply</div>
    </div>
  }
}))

jest.mock('../FirewallForm/SettingsForm/DDoSRateFormItem/DDoSRateLimitConfigDrawer', () => ({
  DDoSRateLimitConfigDrawer: (props: {
    visible: boolean,
    setVisible: (visible: boolean) => void,
    data: DdosRateLimitingRule[]
  }) => {
    return props.visible && <div data-testid='rc-DDoSRateLimitConfigDrawer'>
      <div onClick={() => {
        props.setVisible(false)
      }}>Apply</div>
    </div>
  }
}))

const MockedScopeForm = () => {
  return <div data-testid='rc-ScopeForm'>
    <div onClick={() => {
    }}>Apply</div>
  </div>
}
const addSteps = [{
  title: 'Settings',
  content: <SettingsForm />
}, {
  title: 'Scope',
  content: <MockedScopeForm /> },
{
  title: 'Summary',
  content: <SummaryForm />
}]
const editSteps = addSteps.slice(0, 2)
const mockedFinishFn = jest.fn()

describe('firewall form', () => {
  beforeEach(() => {
    mockedFinishFn.mockClear()

    mockServer.use(
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
      )
    )
  })

  it('should navigate to service list when click cancel', async () => {
    render(<FirewallForm
      steps={addSteps}
      onFinish={mockedFinishFn}
    />, {
      wrapper: Provider,
      route: {
        path: '/:tenantId/t/services/firewall/create',
        params: { tenantId: 't-id' }
      }
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_FIREWALL,
      oper: ServiceOperation.LIST
    })

    const form = within(await screen.findByTestId('steps-form'))
    within(await form.findByTestId('steps-form-body'))
    const actions = within(await form.findByTestId('steps-form-actions'))
    await click(await actions.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      })
    })
  })

  describe('Add', () => {
    it('should correctly create DDoS rule', async () => {
      render( <FirewallForm
        steps={addSteps}
        onFinish={mockedFinishFn}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))

      // Step 1
      expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await type(body.getByRole('textbox', { name: 'Service Name' }), 'Test 1')
      await click(body.getByRole('switch', { name: 'ddos' }))
      const drawer = await screen.findByTestId('rc-DDoSRateLimitConfigDrawer')
      await click(within(drawer).getByText('Apply'))

      // Navigate to Step 2
      await click(actions.getByRole('button', { name: 'Next' }))
      await body.findByText('Please create 1 rule at least.')
      await click(body.getByRole('switch', { name: 'ddos' }))

      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByTestId('rc-ScopeForm')).toBeVisible()

      // Navigate to Step 3
      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

      // summary check
      const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
      // eslint-disable-next-line testing-library/no-node-access
      expect((ddosResult.parentNode as HTMLDivElement).textContent)
        .toBe('DDoS Rate-limitingOFF')

      const aclResult = await screen.findByText(/Stateful ACL/)
      // eslint-disable-next-line testing-library/no-node-access
      expect((aclResult.parentNode as HTMLDivElement).textContent)
        .toBe('Stateful ACLOFF')

      expect(screen.getByText('SmartEdge (0)')).not.toBeNull()

      await click(actions.getByRole('button', { name: 'Add' }))
      await waitFor(() => {
        expect(mockedFinishFn).toBeCalledWith({
          serviceName: 'Test 1',
          ddosRateLimitingEnabled: false,
          ddosRateLimitingRules: [],
          statefulAclEnabled: false,
          statefulAcls: []
        })
      })
    })

    it('should correctly create ACL rule', async () => {
      render( <FirewallForm
        steps={addSteps}
        onFinish={mockedFinishFn}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))

      // Step 1
      expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await type(body.getByRole('textbox', { name: 'Service Name' }), 'Test 1')

      // Navigate to Step 2
      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByTestId('rc-ScopeForm')).toBeVisible()

      // Navigate to Step 3
      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

      // summary check
      const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
      // eslint-disable-next-line testing-library/no-node-access
      expect((ddosResult.parentNode as HTMLDivElement).textContent)
        .toBe('DDoS Rate-limitingOFF')

      expect(screen.getByText('SmartEdge (0)')).not.toBeNull()

      await click(actions.getByRole('button', { name: 'Add' }))
      await waitFor(() => {
        expect(mockedFinishFn).toBeCalledWith({
          serviceName: 'Test 1',
          ddosRateLimitingEnabled: false,
          ddosRateLimitingRules: [],
          statefulAclEnabled: false,
          statefulAcls: []
        })
      })
    })
  })

  describe('Edit', () => {
    it('should correctly organize stateful ACL data', async () => {
      const mockFirewall2: EdgeFirewallSetting = _.cloneDeep(mockFirewall)
      mockFirewall2.edgeIds = ['0000000002', '0000000003']
      mockFirewall2.ddosRateLimitingRules = [{
        ddosAttackType: DdosAttackType.ICMP,
        rateLimiting: 12
      }]

      mockFirewall2.statefulAcls.push({
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
          sourceAddressType: AddressType.IP_ADDRESS,
          sourceAddress: '5.5.1.1',
          sourceAddressMask: '',
          sourcePort: '',
          destinationAddressType: AddressType.SUBNET_ADDRESS,
          destinationAddress: '8.8.8.8',
          destinationAddressMask: '255.255.0.0',
          destinationPort: ''
        },{
          priority: 3,
          description: 'Default rule',
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
      })

      render(<FirewallForm
        steps={editSteps}
        onFinish={mockedFinishFn}
        editMode={true}
        editData={mockFirewall2}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))

      // Step 1
      expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await waitFor(() => {
        expect(body.getByRole('textbox', { name: 'Service Name' })).toHaveAttribute('value', 'test')
      })
      // edit service name
      await type(body.getByRole('textbox', { name: 'Service Name' }), '123')
      expect(body.getByRole('switch', { name: 'ddos' })).not.toBeChecked()
      expect(body.getByRole('switch', { name: 'acl' })).toBeChecked()

      // edit ddos rule
      await click(body.getByRole('switch', { name: 'ddos' }))
      // drawer won't open when ddos rule is not first-time setup
      await click(await body.findByRole('button', { name: 'Change' }))
      const drawer = await screen.findByTestId('rc-DDoSRateLimitConfigDrawer')
      await click(within(drawer).getByText('Apply'))

      // Navigate to Step 2
      await click(screen.getByText('Scope'))
      expect(await body.findByTestId('rc-ScopeForm')).toBeVisible()

      await click(actions.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        expect(mockedFinishFn).toBeCalledWith({
          id: 'mock-id',
          serviceName: 'test123',
          edgeIds: ['0000000002', '0000000003'],
          selectedEdges: [{
            name: 'Smart Edge 2',
            serialNumber: '0000000002'
          }, {
            name: 'Smart Edge 3',
            serialNumber: '0000000003'
          }],
          tags: [],
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
              accessAction: AccessAction.ALLOW,
              protocolType: ProtocolType.ESP,
              protocolValue: 0,
              sourceAddressType: AddressType.IP_ADDRESS,
              sourceAddress: '5.5.1.1',
              sourceAddressMask: '',
              sourcePort: '',
              destinationAddressType: AddressType.SUBNET_ADDRESS,
              destinationAddress: '8.8.8.8',
              destinationAddressMask: '255.255.0.0',
              destinationPort: ''
            }]
          }, {
            name: 'Outbound ACL',
            description: '',
            direction: 'OUTBOUND',
            rules: [ {
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
    })

    it('should use default rule when rules is empty', async () => {
      const emptyRules: EdgeFirewallSetting = _.cloneDeep(mockFirewall)
      emptyRules.statefulAcls = [{
        name: 'Inbound ACL',
        description: '',
        direction: 'INBOUND',
        rules: []
      }, {
        name: 'Outbound ACL',
        description: '',
        direction: 'OUTBOUND',
        rules: []
      }]

      render(<FirewallForm
        steps={editSteps}
        onFinish={mockedFinishFn}
        editMode={true}
        editData={emptyRules}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))

      // Step 1
      expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()
      expect(body.getByRole('switch', { name: 'ddos' })).not.toBeChecked()
      expect(body.getByRole('switch', { name: 'acl' })).toBeChecked()

      // outbound acl
      const outboundRow = await body.findByRole('row', { name: /Outbound ACL/i })
      await click(within(outboundRow).getByRole('radio'))
      await click(body.getByRole('button', { name: 'Edit' }))
      const drawer = await screen.findByTestId('rc-StatefulACLConfigDrawer')
      await click(within(drawer).getByText('Apply'))

      // Navigate to Step 2
      await click(screen.getByText('Scope'))
      expect(await body.findByTestId('rc-ScopeForm')).toBeVisible()

      await click(actions.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        expect(mockedFinishFn).toBeCalledWith({
          id: 'mock-id',
          serviceName: 'test',
          edgeIds: [],
          tags: [],
          ddosRateLimitingEnabled: emptyRules.ddosRateLimitingEnabled,
          ddosRateLimitingRules: emptyRules.ddosRateLimitingRules,
          statefulAclEnabled: emptyRules.statefulAclEnabled,
          statefulAcls: [{
            name: 'Inbound ACL',
            description: '',
            direction: 'INBOUND',
            rules: []
          }, {
            direction: 'OUTBOUND',
            description: '',
            name: 'Outbound ACL',
            rules: []
          }]
        })
      })
    })
  })
})
