import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { ApSnmpUrls, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockServer, render, screen, within }                          from '@acx-ui/test-utils'

import SnmpAgentTable from './SnmpAgentTable'


const mockTableResult = {
  totalCount: 2,
  page: 1,
  data: [{
    aps: { count: 0 },
    id: '237466d3bea34b399a7dda74d724c5fc',
    name: 'Joe-snmp',
    v2Agents: { count: 1, names: ['v2'] },
    v3Agents: { count: 1, names: ['joeV3'] },
    venues: { count: 0 }
  }, {
    aps: { count: 1, names: ['R550_0131'] },
    id: 'c1082e7d05d74eb897bb3600a15c1dc7',
    name: 'SNMP-1',
    v2Agents: { count: 1, names: ['test'] },
    v3Agents: { count: 1, names: ['testUser'] },
    venues: { count: 1, names: ['My-Venue'] }
  }]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
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
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })

  beforeEach(async () => {
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

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        ApSnmpUrls.deleteApSnmpProfile.url,
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

    let target = mockTableResult.data[0]
    let row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))


    target = mockTableResult.data[1]
    row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
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

  })
})

