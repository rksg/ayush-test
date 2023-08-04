import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import AddDhcp from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('AddEdgeDhcp', () => {
  let params: { tenantId: string }
  const mockedReqFn = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockedReqFn.mockClear()

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => {
          mockedReqFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Service Name')
    await screen.findByText('Please create DHCP pools')
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })

    expect(await screen.findByRole('link', { name: 'Services' })).toBeVisible()
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for SmartEdge'
    })).toBeVisible()
  })

  it('should add edge dhcp successfully', async () => {
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })

    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    fireEvent.change(serviceNameInput, { target: { value: 'myTest' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    let drawer = await screen.findByRole('dialog')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Pool Name' }), 'Pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.1')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.4')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
    await userEvent.click(screen.getByRole('radio', { name: 'Infinite' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Add Host' }))
    drawer = await screen.findByRole('dialog')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Host Name' }), 'Host1')
    await userEvent.type(await screen.findByRole('textbox', { name: 'MAC Address' }),
      '00:0c:29:26:dd:fc')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Fixed Address' }),
      '1.1.1.1')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedReqFn).toBeCalledWith({
        serviceName: 'myTest',
        dhcpRelay: false,
        leaseTime: -1,
        leaseTimeType: 'Infinite',
        leaseTimeUnit: 'HOURS',
        dhcpPools: [{
          id: '',
          poolName: 'Pool1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.5',
          gatewayIp: '1.2.3.4'
        }],
        hosts: [{
          id: '',
          hostName: 'Host1',
          mac: '00:0c:29:26:dd:fc',
          fixedAddress: '1.1.1.1'
        }]
      })
    })
  })

  it('should add edge dhcp with option successfully', async () => {
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })

    await userEvent.type(await screen.findByRole('textbox', { name: /service name/i }), 'myTest')
    await userEvent.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    let drawer = await screen.findByRole('dialog')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Pool Name' }), 'Pool1')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.1')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.4')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
    await userEvent.click(await screen.findByRole('button', { name: 'Add Option' }))
    drawer = await screen.findByRole('dialog')

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Option Name' }),
      '15')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Option Value' }),
      'testOpt')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedReqFn).toBeCalledWith({
        serviceName: 'myTest',
        dhcpRelay: false,
        leaseTime: 24,
        leaseTimeType: 'Limited',
        leaseTimeUnit: 'HOURS',
        dhcpPools: [{
          id: '',
          poolName: 'Pool1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.5',
          gatewayIp: '1.2.3.4'
        }],
        dhcpOptions: [{
          id: '',
          optionId: '15',
          optionName: 'Domain name',
          optionValue: 'testOpt'
        }]
      })
    })
  })

  it('should show show external server setting successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, { route: { params } }
    )

    const toggle = screen.getByRole('switch')
    await user.click(toggle)
    expect(toggle).toBeChecked()

    await screen.findByText('FQDN Name or IP Address')
  })

  it('cancel and go back to my service', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/services`,
      hash: '',
      search: ''
    })
  })
})

describe('AddEdgeDhcp api fail', () => {
  let params: { tenantId: string }
  const mockedErrorFn = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockedErrorFn)

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json(null))
      )
    )
  })

  it('should trigger error log', async () => {
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/create' }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    await userEvent.type(serviceNameInput, 'myTest')
    await userEvent.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Pool Name' }), 'Pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    const textBoxs = within(drawer).getAllByRole('textbox')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.1')
    await userEvent.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedErrorFn).toBeCalled())
  })
})