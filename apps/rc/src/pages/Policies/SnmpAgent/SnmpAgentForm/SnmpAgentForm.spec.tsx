import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { policyApi } from '@acx-ui/rc/services'
import {
  ApSnmpRbacUrls,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import SnmpAgentForm from './SnmpAgentForm'

const mockedTenantId = '__Tenant_ID__'
const mockedPolicyId = '__Policy_ID__'

const mockRbacSnmpData = {
  name: 'www',
  id: mockedPolicyId,
  snmpV2Agents: [{
    communityName: 'joe_cn1',
    readOnlyPrivilege: true,
    notificationPrivilege: false
  }, {
    communityName: 'joe_cn2',
    readOnlyPrivilege: false,
    notificationPrivilege: true,
    notificationSettings: {
      targetIpAddress: '192.168.0.120',
      targetPort: 162,
      type: 'TRAP'
    }
  }],
  snmpV3Agents: [{
    userName: 'joe_un1',
    readPrivilege: true,
    trapPrivilege: false,
    authenticationType: 'SHA',
    authenticationPassphrase: '1234567890',
    privacyType: 'NONE'
  }, {
    userName: 'joe_un2',
    readPrivilege: false,
    trapPrivilege: true,
    authenticationType: 'MD5',
    authenticationPassphrase: '123456789',
    privacyType: 'AES',
    privacyPassphrase: '12345678',
    notificationSettings: {
      targetIpAddress: '192.168.0.201',
      targetPort: 162,
      type: 'TRAP'
    }
  }]
}

const mockRbacSnmpListData = [
  mockRbacSnmpData,
  {
    name: 'ttt',
    id: '__Policy_ID_2__',
    snmpV2Agents: [{
      communityName: 'ttt2',
      readOnlyPrivilege: true,
      notificationPrivilege: true,
      notificationSettings: {
        targetIpAddress: '192.168.0.120',
        targetPort: 162,
        type: 'TRAP'
      }
    }],
    snmpV3Agents: [{
      userName: 'ttt3',
      readOnlyPrivilege: false,
      notificationPrivilege: true,
      authenticationType: 'SHA',
      authenticationPassphrase: '1234567890',
      privacyType: 'NONE',
      notificationSettings: {
        targetIpAddress: '192.168.0.100',
        targetPort: 162,
        type: 'TRAP'
      }
    }]
  }]


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
  const mockGetProfileApi = jest.fn()
  const mockAddFn = jest.fn()
  const mockEditFn = jest.fn()

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())
    mockAddFn.mockClear()
    mockEditFn.mockClear()
    mockGetProfileApi.mockClear()
    mockedUseNavigate.mockClear()

    mockServer.use(
      rest.post(ApSnmpRbacUrls.addApSnmpPolicy.url,
        (_, res, ctx) => {
          mockAddFn()
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.get(ApSnmpRbacUrls.getApSnmpPolicy.url,
        (_, res, ctx) => {
          mockGetProfileApi()
          return res(ctx.json(mockRbacSnmpData))
        }
      ),
      rest.post(ApSnmpRbacUrls.getApSnmpFromViewModel.url,
        (_, res, ctx) => res(ctx.json({ data: mockRbacSnmpListData }))),
      rest.put(ApSnmpRbacUrls.updateApSnmpPolicy.url,
        (_, res, ctx) => {
          mockEditFn()
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )
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

    expect(await screen.findByText('Add SNMP Agent')).toBeInTheDocument()
    // In create mode doesn't call the getting profile API
    expect(mockGetProfileApi).not.toBeCalled()
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

    await waitFor(() => {
      expect(mockGetProfileApi).toBeCalled()
    })

    // data has been loaded
    expect(await screen.findByDisplayValue('www')).toBeInTheDocument()
    expect(await screen.findByText('joe_cn1')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(mockEditFn).toBeCalled()
    })
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
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Profile Name')

    // Policy name can't be duplicate
    const inputElem = await screen.findByRole('textbox')
    await userEvent.type(inputElem, 'www')
    expect(inputElem).toHaveAttribute('value', 'www')

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText(/already exists/)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/__Tenant_ID__/t/policies/snmpAgent/list',
      hash: '',
      search: ''
    }, { replace: true })
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


    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText(/At least one SNMPv2 agent or SNMPv3 agent/)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/__Tenant_ID__/t/policies/snmpAgent/list',
      hash: '',
      search: ''
    }, { replace: true })
  })

})
