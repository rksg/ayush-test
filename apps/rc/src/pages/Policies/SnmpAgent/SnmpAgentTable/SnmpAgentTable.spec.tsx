import { cleanup } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'
import { Path }    from 'react-router-dom'

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
    id: 'Joe-snmp-id',
    name: 'Joe-snmp',
    v2Agents: { count: 1, names: ['joeV2xxx'] },
    v3Agents: { count: 1, names: ['joeV3'] },
    venues: { count: 0 },
    venueIds: [],
    apActivations: [] // No AP in use
  }, {
    id: 'SNMP-1-id',
    name: 'SNMP-1',
    v2Agents: { count: 1, names: ['testV2User'] },
    v3Agents: { count: 1, names: ['testV3User'] },
    venues: { count: 1, names: ['My-Venue123'] },
    venueIds: ['venue1'],
    apActivations: ['ap1'] // AP in use
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

  afterEach(() => {
    cleanup()
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
    await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))


    target = mockTableResult.data[1]
    row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))

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
    const mockDataWithOnlyVenueIds = {
      ...mockTableResult,
      data: [{
        ...mockTableResult.data[0],
        venues: { count: 0, names: [] },
        venueIds: ['venue1']
      }]
    }

    mockServer.use(
      rest.post(
        ApSnmpUrls.getApSnmpFromViewModel.url,
        (req, res, ctx) => res(ctx.json(mockDataWithOnlyVenueIds))
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

    // Select the SNMP agent that has active venues (SNMP-1)
    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    // Click delete button
    await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))

    // Verify warning modal appears
    expect(await screen.queryAllByText(
      'You are unable to delete this record due to its usage in venues'
    )[0]).toBeVisible()

    expect(screen.queryAllByRole('button', { name: /OK/ })[0]).toBeVisible()

    // Click OK to close modal
    await userEvent.click(screen.queryAllByRole('button', { name: /OK/ })[0])

    // Verify the row is still selected and not deleted
    expect(screen.getByRole('row', { name: new RegExp(target.name) })).toBeVisible()
  })

  describe('Delete functionality', () => {
    // eslint-disable-next-line max-len
    it('should show error message when trying to delete SNMP agent with active venues or APs', async () => {
      render(
        <Provider>
          <SnmpAgentTable />
        </Provider>, {
          route: { params, path: tablePath }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Select the SNMP agent that has active venues and APs (SNMP-1)
      const target = mockTableResult.data[1]
      const row = await screen.findByRole('row', { name: new RegExp(target.name) })
      await userEvent.click(within(row).getByRole('radio'))

      // Click delete button
      await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))

      // Verify error message appears
      expect(await screen.queryAllByText(
        'You are unable to delete this record due to its usage in venues,aps'
      )[0]).toBeVisible()

      // Verify OK button is present
      expect(screen.queryAllByRole('button', { name: /OK/ })[0]).toBeVisible()

      // Click OK to close modal
      await userEvent.click(screen.queryAllByRole('button', { name: /OK/ })[0])

      // Verify the row is still selected and not deleted
      expect(screen.getByRole('row', { name: new RegExp(target.name) })).toBeVisible()
    })

    // eslint-disable-next-line max-len
    it('should show error message when trying to delete SNMP agent with active APs only', async () => {
      // Modify mock data to create an SNMP agent with only APs in use
      const mockDataWithOnlyApActivations = {
        ...mockTableResult,
        data: [{
          ...mockTableResult.data[0],
          venues: { count: 0, names: [] },
          apActivations: [{}] // AP in use
        }]
      }

      mockServer.use(
        rest.post(
          ApSnmpUrls.getApSnmpFromViewModel.url,
          (req, res, ctx) => res(ctx.json(mockDataWithOnlyApActivations))
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

      const target = mockDataWithOnlyApActivations.data[0]
      const row = await screen.findByRole('row', { name: new RegExp(target.name) })
      await userEvent.click(within(row).getByRole('radio'))

      await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))

      expect(await screen.queryAllByText(
        'You are unable to delete this record due to its usage in aps'
      )[0]).toBeVisible()

      expect(screen.queryAllByRole('button', { name: /OK/ })[0]).toBeVisible()
    })

    // eslint-disable-next-line max-len
    it('should show confirmation dialog when deleting SNMP agent without active venues or APs', async () => {
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

      // Select the SNMP agent that has no active venues or APs (Joe-snmp)
      const target = mockTableResult.data[0]
      const row = await screen.findByRole('row', { name: new RegExp(target.name) })
      await userEvent.click(within(row).getByRole('radio'))

      // Click delete button
      await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }))

      // Verify confirmation dialog appears
      expect(await screen.findByText(
        'Are you sure you want to delete this SNMP Agent?'
      )).toBeVisible()

      // Verify Delete and Cancel buttons are present
      expect(screen.getByRole('button', { name: /Delete SNMP Agent/ })).toBeVisible()
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeVisible()

      // Click Delete to confirm
      await userEvent.click(screen.getByRole('button', { name: /Delete SNMP Agent/ }))

      // Verify delete API was called
      expect(deleteFn).toHaveBeenCalled()
    })
  })
})
