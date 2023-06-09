/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { DdosAttackType, EdgeFirewallUrls, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList, mockFirewall, mockFirewall2, mockFirewallACLStats, mockFirewallDDoSStats } from './__tests__/fixtures'

import  EdgeFirewall from './'

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

const mockedGetFirewallFn = jest.fn()
const mockedEdgeStatus = {
  serialNumber: '0000000001',
  venueId: '00001',
  firewallId: 'mock-serviceId'
}

describe('Venue Firewall Service', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => res(ctx.json(mockFirewall))
      ),
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallDDoSStats.url,
        (req, res, ctx) => res(ctx.json(mockFirewallDDoSStats))
      ),
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallACLStats.url,
        (req, res, ctx) => res(ctx.json(mockFirewallACLStats))
      )
    )

    mockedGetFirewallFn.mockReset()
  })

  it('should render correctly when ddos disabled, ACL enabled', async () => {
    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus} />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('OFF')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('ON (IN: 1 rule, OUT: 5 rules)')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')
    // only default table row
    expect(ddosRows.length).toBe(3) // message row + 2(header)

    // display stateful ACL rules
    await userEvent.click(screen.getByRole('tab', { name: 'Stateful ACL' }))
    await waitFor(async () => {
      expect(await screen.findByText('Src Port')).toBeVisible()
    })
    const aclPane = screen.getByRole('tabpanel', { hidden: false })
    const aclInRows = await within(aclPane).findAllByRole('row')
    expect(aclInRows.length).toBe(2) // 1 + 1(header)

    // change ACL direction
    await userEvent.selectOptions(
      await screen.findByRole('combobox'),
      'Outbound')
    const aclOutRows = await within(aclPane).findAllByRole('row')
    expect(aclOutRows.length).toBe(6) // 5 + 1(header)
  })

  it('should render correctly when ddos enabled, ACL disabled', async () => {
    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFirewallFn()
          return res(ctx.json(mockFirewall2))
        }
      )
    )

    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus}/>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetFirewallFn).toBeCalled()
    })

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall-ddos' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('ON (2 rules)')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('OFF')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')
    // only default table row
    expect(ddosRows.length).toBe(4) // 2 + 2(header)

    // display stateful ACL rules
    await userEvent.click(screen.getByRole('tab', { name: 'Stateful ACL' }))
    await waitFor(async () => {
      expect(await screen.findByText('Src Port')).toBeVisible()
    })
    const aclPane = screen.getByRole('tabpanel', { hidden: false })
    const aclInRows = await within(aclPane).findAllByRole('row')
    expect(aclInRows.length).toBe(2) // 1 + 1(header)

    // change ACL direction
    await userEvent.selectOptions(
      await screen.findByRole('combobox'),
      'Outbound')
    const aclOutRows = await within(aclPane).findAllByRole('row')
    expect(aclOutRows.length).toBe(2) // no data row + 1(header)
  })

  it('should render correctly when ddos use All rule', async () => {
    const mockFirewall3 = { ...mockFirewall2,
      serviceName: 'mocked-firewall-ddos2',
      ddosRateLimitingRules: [
        {
          ddosAttackType: DdosAttackType.ALL,
          rateLimiting: 100
        }
      ] }

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFirewallFn()
          return res(ctx.json(mockFirewall3))
        }
      )
    )

    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus}/>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetFirewallFn).toBeCalled()
    })

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall-ddos2' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('ON (1 rule)')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('OFF')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')

    // should expand rule - all one by one
    expect(ddosRows.length).toBe(6) // 4 + 2(header)
    expect(within(ddosPane).queryByRole('row', { name: /ICMP 100 12 20/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /DNS Response 100 -- --/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /NTP Reflection 100 -- --/ })).toBeValid()
    expect(within(ddosPane).queryByRole('row', { name: /TCP SYN 100 9 21/ })).toBeValid()
  })

  it('should render correctly when ddos does not have rule', async () => {
    const mockFirewall4 = { ...mockFirewall2,
      serviceName: 'mocked-firewall-ddos-empty',
      ddosRateLimitingRules: [] }
    delete mockFirewall4.ddosRateLimitingRules

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFirewallFn()
          return res(ctx.json(mockFirewall4))
        }
      )
    )

    render(
      <Provider>
        <EdgeFirewall edgeData={mockedEdgeStatus as EdgeStatus}/>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedGetFirewallFn).toBeCalled()
    })

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall-ddos-empty' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('ON (0 rules)')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('OFF')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')

    // should expand rule - all one by one
    expect(ddosRows.length).toBe(3) // no data row + 2(header)
  })
})