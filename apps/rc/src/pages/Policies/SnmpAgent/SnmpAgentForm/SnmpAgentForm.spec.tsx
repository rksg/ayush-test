import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { ApSnmpUrls, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockServer, render, screen, within }                          from '@acx-ui/test-utils'

import SnmpAgentForm from './SnmpAgentForm'



const mockSnmpData = {
  policyName: 'www',
  id: '876899c9f9a64196b4604fe5d5dac9d2',
  tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
  snmpV2Agents: [
    {
      communityName: 'joe_cn1',
      readPrivilege: true,
      trapPrivilege: false
    },
    {
      communityName: 'joe_cn2',
      readPrivilege: false,
      trapPrivilege: true,
      notificationType: 'Trap',
      targetAddr: '192.168.0.120',
      targetPort: 162
    }
  ],
  snmpV3Agents: [
    {
      userName: 'joe_un1',
      readPrivilege: false,
      trapPrivilege: true,
      notificationType: 'Trap',
      targetAddr: '192.168.0.100',
      targetPort: 162,
      authProtocol: 'SHA',
      authPassword: '1234567890',
      privacyProtocol: 'None'
    },
    {
      userName: 'joe_un2',
      readPrivilege: true,
      trapPrivilege: false,
      notificationType: 'Trap',
      targetPort: 162,
      authProtocol: 'MD5',
      authPassword: '123456789',
      privacyProtocol: 'AES',
      privacyPassword: '12345678'
    }
  ]
}

const mockSnmpListData = [
  {
    policyName: 'www',
    id: '876899c9f9a64196b4604fe5d5dac9d2',
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'joe_cn1',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162
      },
      {
        communityName: 'joe_cn2',
        readPrivilege: false,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '192.168.0.120',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'joe_un1',
        readPrivilege: false,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '192.168.0.100',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '1234567890',
        privacyProtocol: 'None'
      },
      {
        userName: 'joe_un2',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162,
        authProtocol: 'MD5',
        authPassword: '123456789',
        privacyProtocol: 'AES',
        privacyPassword: '12345678'
      }
    ]
  }, {
    policyName: 'ttt',
    id: '876899c9f9a64196b4604fe5d5dac9d8',
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'ttt2',
        readPrivilege: true,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '192.168.0.120',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'ttt3',
        readPrivilege: false,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '192.168.0.100',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '1234567890',
        privacyProtocol: 'None'
      }
    ]
  }]

const mockedTenantId = '__Tenant_ID__'
const mockedPolicyId = '__Policy_ID__'

// eslint-disable-next-line max-len
const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })
// eslint-disable-next-line max-len
const editPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.EDIT })

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))


describe('SnmpAgentForm', () => {

  beforeEach(async () => {
    mockServer.use(
      rest.post(ApSnmpUrls.addApSnmpPolicy.url,
        (_, res, ctx) => res(ctx.json({ requestId: '123456789' }))),
      rest.get(ApSnmpUrls.getApSnmpPolicy.url,
        (_, res, ctx) => res(ctx.json(mockSnmpData))),
      rest.get(ApSnmpUrls.getApSnmpPolicyList.url,
        (_, res, ctx) => res(ctx.json(mockSnmpListData))),
      rest.put(ApSnmpUrls.updateApSnmpPolicy.url,
        (_, res, ctx) => res(ctx.json({ requestId: '123456789' })))
    )
  })

  it.skip('should create SNMP Agent successfully', async () => {
    render(
      <Provider>
        <SnmpAgentForm editMode={false}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      })

    const header = screen.getByRole('heading', { name: /Add SNMP Agent/i })
    expect(header).toBeInTheDocument()

    const inputElem = await screen.findByRole('textbox')
    await userEvent.type(inputElem, 'test1')
    expect(inputElem).toHaveAttribute('value', 'test1')


    // Add SNMPv2 Agent
    await userEvent.click(await screen.findByRole('button', { name: 'Add SNMPv2 Agent' }))
    await userEvent.type(await screen.findByRole('textbox', { name: 'Community Name' }), 'cn1')
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Read-only' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // Edit SNMPv2 Agent
    let row = await screen.findByRole('row', { name: /cn1/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Read-only' }))
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Notification' }))
    await userEvent.type(await screen.findByRole('textbox', { name: 'Target IP' }), '192.168.0.100')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))


    // await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SnmpAgentForm editMode={false}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'SNMP Agent'
    })).toBeVisible()
  })

  it('should edit SNMP Agent successfully', async () => {
    render(
      <Provider>
        <SnmpAgentForm editMode={true}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId }, path: editPath }
      })


    const header = screen.getByRole('heading', { name: /Edit SNMP Agent/i })
    expect(header).toBeInTheDocument()

    // await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
  })

  it('should Policy name not empty and duplicated', async () => {
    render(
      <Provider>
        <SnmpAgentForm editMode={false}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      })

    const header = screen.getByRole('heading', { name: /Add SNMP Agent/i })
    expect(header).toBeInTheDocument()

    // Policy name can't empty
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByText('Please enter Profile Name')

    // Policy name can't be duplicate
    const inputElem = await screen.findByRole('textbox')
    await userEvent.type(inputElem, 'www')
    expect(inputElem).toHaveAttribute('value', 'www')

    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByText(/already exists/)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/__Tenant_ID__/t/policies/snmpAgent/list',
      hash: '',
      search: ''
    })
  })

  it('should at least one SNMPv2 agent or SNMPv3 agent', async () => {
    render(
      <Provider>
        <SnmpAgentForm editMode={false}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      })

    const header = screen.getByRole('heading', { name: /Add SNMP Agent/i })
    expect(header).toBeInTheDocument()

    const inputElem = await screen.findByRole('textbox')
    await userEvent.type(inputElem, 'SNMP-test')
    expect(inputElem).toHaveAttribute('value', 'SNMP-test')


    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByText(/At least one SNMPv2 agent or SNMPv3 agent/)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/__Tenant_ID__/t/policies/snmpAgent/list',
      hash: '',
      search: ''
    })
  })

})
