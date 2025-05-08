import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { policyApi }                                                   from '@acx-ui/rc/services'
import { ApSnmpUrls, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider, store }                                             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  within }                          from '@acx-ui/test-utils'

import SnmpAgentTable from './SnmpAgentTable'


const mockTableResult = {
  totalCount: 2,
  page: 1,
  data: [{
    aps: { count: 0 },
    id: 'Joe-snmp-id',
    name: 'Joe-snmp',
    v2Agents: { count: 1, names: ['joeV2xxx'] },
    v3Agents: { count: 1, names: ['joeV3'] },
    venues: { count: 0 }
  }, {
    aps: { count: 1, names: ['R550_Fake'] },
    id: 'SNMP-1-id',
    name: 'SNMP-1',
    v2Agents: { count: 1, names: ['testV2User'] },
    v3Agents: { count: 1, names: ['testV3User'] },
    venues: { count: 1, names: ['My-Venue123'] }
  }]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: '__tenantId__/t',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('SnmpAgentTable', () => {
  const params = {
    tenantId: '__tenantId__'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.post(
        ApSnmpUrls.getApSnmpFromViewModel.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <SnmpAgentTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add SNMP Agent/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SnmpAgentTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        ApSnmpUrls.deleteApSnmpPolicy.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <SnmpAgentTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    let target = mockTableResult.data[0]
    let row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))


    target = mockTableResult.data[1]
    row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    /*
    expect(await screen.findByText('Delete a SNMP agent that is currently in use?')).toBeVisible()

    let cancelBtns = await screen.findAllByRole('button', { name: /Cancel/i })
    await userEvent.click(cancelBtns[0])

    row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    expect(await screen.findByText('Delete a SNMP agent that is currently in use?')).toBeVisible()
    let deleteBtns = await screen.findAllByRole('button', { name: /Delete/i })
    expect(deleteBtns.length).toBe(2)

    await userEvent.click(deleteBtns[1])
    */
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <SnmpAgentTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('should show warning modal when deleting SNMP agent with active venues', async () => {
    render(
      <Provider>
        <SnmpAgentTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Select the SNMP agent that has active venues (SNMP-1)
    const target = mockTableResult.data[1]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    // Click delete button
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // Verify warning modal appears
    expect(await screen.findByText(
      'You are unable to delete this record due to its usage in Venue'
    )).toBeVisible()

    expect(screen.getByRole('button', { name: /OK/ })).toBeVisible()

    // Click OK to close modal
    await userEvent.click(screen.getByRole('button', { name: /OK/ }))

    // Verify the row is still selected and not deleted
    expect(screen.getByRole('row', { name: new RegExp(target.name) })).toBeVisible()
  })
})
