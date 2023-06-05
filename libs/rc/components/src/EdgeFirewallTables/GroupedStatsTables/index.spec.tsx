/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { DdosAttackType, EdgeFirewallSetting, EdgeFirewallUrls, EdgeStatus } from '@acx-ui/rc/utils'
import { Provider }                                                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockFirewall, mockFirewallACLStats, mockFirewallDDoSStats } from './__tests__/fixtures'

import { GroupedStatsTables } from './'

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

const mockedGetDDoSDataFn = jest.fn()
const mockedGetACLDataFn = jest.fn()
const mockedEdgeStatus = {
  serialNumber: '0000000001',
  venueId: '00001',
  firewallId: 'mock-serviceId'
}

describe('Edge firewall service grouped rule tables with stats', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }

    mockServer.use(
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallDDoSStats.url,
        (req, res, ctx) => {
          mockedGetDDoSDataFn()
          return res(ctx.json(mockFirewallDDoSStats))
        }
      ),
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallACLStats.url,
        (req, res, ctx) => {
          mockedGetACLDataFn()
          return res(ctx.json(mockFirewallACLStats))
        }
      )
    )

    mockedGetDDoSDataFn.mockReset()
    mockedGetACLDataFn.mockReset()
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <GroupedStatsTables
          edgeData={mockedEdgeStatus as EdgeStatus}
          edgeFirewallData={mockFirewall as EdgeFirewallSetting}
        />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetDDoSDataFn).toBeCalled()
    })

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')
    expect(ddosRows.length).toBe(4) // 2 + 2(header)
    expect(within(ddosPane).queryByRole('row', { name: /ICMP 200 12 20/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /NTP Reflection 120 9 21/ })).toBeValid()

    // display stateful ACL rules
    await userEvent.click(screen.getByRole('tab', { name: 'Stateful ACL' }))
    await waitFor(() => {
      expect(mockedGetACLDataFn).toBeCalled()
    })
    await waitFor(async () => {
      expect(await screen.findByText('Src Port')).toBeVisible()
    })

    // check inbound data
    const aclPane = screen.getByRole('tabpanel', { hidden: false })
    const aclInRows = await within(aclPane).findAllByRole('row')
    expect(aclInRows.length).toBe(2) // 1 + 1(header)

    // change ACL direction
    await userEvent.selectOptions(
      await screen.findByRole('combobox'),
      'Outbound')
    const aclOutRows = await within(aclPane).findAllByRole('row')
    expect(aclOutRows.length).toBe(6) // 5 + 1(header)
    expect(screen.queryByText('Permmited by ACL Sessions')).toBeNull()
    expect(within(aclPane).queryByRole('row', { name: /1 Default ACL rule Inspect Any Any Any 12 72/ })).toBeValid()
    expect(within(aclPane).queryByRole('row', { name: /2 Default ACL rule Inspect Any Any 443 TCP 9 168/ })).toBeValid()
    expect(within(aclPane).queryByRole('row', { name: /3 Default ACL rule Inspect Any Any 123 Any -- --/ })).toBeValid()
    expect(within(aclPane).queryByRole('row', { name: /4 Block Any Any ICMP -- --/ })).toBeValid()
    expect(within(aclPane).queryByRole('row', { name: /5 Default ACL rule Inspect Any Any Any -- --/ })).toBeValid()
  })

  it('should correctly render ACL info table', async () => {
    render(
      <Provider>
        <GroupedStatsTables
          edgeData={mockedEdgeStatus as EdgeStatus}
          edgeFirewallData={mockFirewall as EdgeFirewallSetting}
          displayACLOtherInfo={true}
        />
      </Provider>, {
        route: { params }
      })

    // display stateful ACL rules
    await userEvent.click(screen.getByRole('tab', { name: 'Stateful ACL' }))
    await waitFor(() => {
      expect(mockedGetACLDataFn).toBeCalled()
    })

    await waitFor(async () => {
      expect(await screen.findByText('Src Port')).toBeVisible()
    })
    const aclPane = screen.getByRole('tabpanel', { hidden: false })
    // change ACL direction
    await userEvent.selectOptions(
      await screen.findByRole('combobox'),
      'Outbound')
    const aclOutRows = await within(aclPane).findAllByRole('row')
    expect(aclOutRows.length).toBe(8) // 5 + 1(header) + 2 rows in info table

    // check permitted session data
    expect(screen.queryByText('Permmited by ACL Sessions')).toBeValid()
    expect(within(aclPane).queryByRole('row', { name: 'Permmited by ACL Sessions 150' })).toBeValid()
  })

  it('should correctly render when ddos use All rule', async () => {
    const mockFirewallDDoSAll = { ...mockFirewall,
      serviceName: 'mocked-firewall-ddos2',
      ddosRateLimitingRules: [
        {
          ddosAttackType: DdosAttackType.ALL,
          rateLimiting: 100
        }
      ] }

    render(
      <Provider>
        <GroupedStatsTables
          edgeData={mockedEdgeStatus as EdgeStatus}
          edgeFirewallData={mockFirewallDDoSAll as EdgeFirewallSetting}
        />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetDDoSDataFn).toBeCalled()
    })

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')

    // should expand rule - all one by one
    expect(ddosRows.length).toBe(6) // 4 + 2(header)
    expect(within(ddosPane).queryByRole('row', { name: /ICMP 100 12 20/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /DNS Response 100 -- --/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /NTP Reflection 100 9 21/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /TCP SYN 100 -- --/ })).toBeValid()
  })

  it('should correctly render when ddos rule is null', async () => {
    const mockFirewallDDoSNull = { ...mockFirewall,
      serviceName: 'mocked-firewall-ddos2',
      ddosRateLimitingRules: null
    }

    render(
      <Provider>
        <GroupedStatsTables
          edgeData={mockedEdgeStatus as EdgeStatus}
          edgeFirewallData={mockFirewallDDoSNull}
        />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetDDoSDataFn).toBeCalled()
    })

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')

    // should expand rule - all one by one
    expect(ddosRows.length).toBe(3) // message row + 2(header)
    expect(within(ddosPane).queryByRole('row', { name: '' })).toBeValid()
  })
})