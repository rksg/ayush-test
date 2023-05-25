/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeFirewallUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList, mockFirewall, mockFirewall2 } from './__tests__/fixtures'

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
      )
    )
  })

  it('should render correctly when ddos disabled, ACL enabled', async () => {
    render(
      <Provider>
        <EdgeFirewall serviceId='mock-serviceId'/>
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    // display firewall config data
    expect(await screen.findByRole('link', { name: 'mocked-firewall' })).toBeVisible()
    const ddosInfo = screen.queryByText('DDoS Rate-limiting')
    // eslint-disable-next-line testing-library/no-node-access
    const ddosWrapper = ddosInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(ddosWrapper).queryByText('OFF (0 rules)')).toBeValid()
    const aclInfo = screen.queryAllByText('Stateful ACL').filter(elem => elem.tagName === 'SPAN')[0]
    // eslint-disable-next-line testing-library/no-node-access
    const aclWrapper = aclInfo?.closest('div.ant-space')! as HTMLDivElement
    expect(within(aclWrapper).queryByText('ON (IN: 1 rule, OUT: 5 rules)')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')
    // only default table row
    expect(ddosRows.length).toBe(2) // message row + 1(header)

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
        <EdgeFirewall serviceId='mock-serviceId'/>
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
    expect(within(aclWrapper).queryByText('OFF (IN: 1 rule, OUT: 5 rules)')).toBeValid()

    // display ddos rules
    const ddosPane = screen.getByRole('tabpanel', { hidden: false })
    const ddosRows = await within(ddosPane).findAllByRole('row')
    // only default table row
    expect(ddosRows.length).toBe(3) // 2 + 1(header)

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
})