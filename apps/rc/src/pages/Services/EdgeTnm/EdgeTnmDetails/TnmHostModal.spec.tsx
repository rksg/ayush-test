import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { TnmHostModal } from './TnmHostModal'

const { mockTnmServiceDataList, mockTnmHostList, mockTnmHostGroups } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

const mockTnm1 = mockTnmServiceDataList[0]

jest.mock('./EdgeTnmGraphTable', () => ({
  ...jest.requireActual('./EdgeTnmGraphTable'),
  EdgeTnmHostGraphTable: () => <div dataa-testid='rc-EdgeTnmHostGraphTable' />
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string | string[]) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  maxTagCount?: number,
  showArrow?: boolean,
  showSearch?: boolean,
  maxTagPlaceholder?: React.ReactNode,
  menuItemSelectedIcon?: React.ReactNode,
  dropdownClassName?: string,
  value?: string | string[],
  mode?: 'multiple'
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, mode, options,
    showArrow, maxTagCount, showSearch, maxTagPlaceholder,
    optionFilterProp, allowClear,
    menuItemSelectedIcon,dropdownClassName, value,
    ...props }: MockSelectProps) => {
    // eslint-disable-next-line max-len
    return <select {...props} multiple={mode === 'multiple'} onChange={(e) => onChange?.(e.target.value)} value={value}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value=''></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const mockAddReq = jest.fn()
const mockUpdateReq = jest.fn()
describe('Edge TNM Service Host Modal', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: mockTnm1.id!
    }

    mockAddReq.mockClear()
    mockUpdateReq.mockClear()

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmServiceList.url,
        (_, res, ctx) => res(ctx.json(mockTnmServiceDataList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostGroupList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostGroups))
      ),
      rest.post(
        EdgeTnmServiceUrls.createEdgeTnmHost.url,
        (req, res, ctx) => {
          mockAddReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeTnmServiceUrls.updateEdgeTnmHost.url,
        (req, res, ctx) => {
          mockUpdateReq(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create host successfully', async () => {
    const mockCloseFn = jest.fn()

    render(<Provider>
      <TnmHostModal
        visible
        serviceId='mock-serviceId'
        onClose={mockCloseFn}
      />
    </Provider>, {
      route: { params, path: mockPath }
    })

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'amyTest')

    const dropdown = screen.getByRole('listbox')
    const targetOpt1 = await screen.findByRole('option', { name: mockTnmHostGroups[1].name })
    await userEvent.selectOptions(dropdown, targetOpt1)

    await userEvent.type(screen.getByRole('textbox', { name: 'IP Address' }), '1.2.3.4')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Port' }), '112')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockAddReq).toBeCalledWith({
      host: 'amyTest',
      interfaces: [{
        interfaceid: undefined,
        ip: '1.2.3.4',
        port: '112',
        main: 1,
        type: 2,
        useip: 1,
        dns: '',
        details: {
          version: '2',
          community: 'zabbix'
        }
      }],
      groups: [{ groupid: '20' }],
      templates: [{
        templateid: '10226'
      }],
      tags: [
        {
          tag: 'host-name',
          value: 'Sibi_Rodan_3u_Stack_Postman_2'
        }
      ]
    }))

    await waitFor(() => expect(mockCloseFn).toBeCalled())
  })

  it('should edit host name successfully', async () => {
    render(<Provider>
      <TnmHostModal
        visible
        serviceId='mock-serviceId'
        onClose={jest.fn()}
        editData={mockTnmHostList[0]}
      />
    </Provider>, {
      route: { params, path: mockPath }
    })

    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('example-host8')
    await userEvent.clear(input)
    await userEvent.type(input, 'amyTest')

    expect(screen.getByRole('listbox')).toHaveValue(['2'])
    expect(screen.getByRole('textbox', { name: 'IP Address' })).toHaveValue('192.168.1.1')
    expect(screen.getByRole('spinbutton', { name: 'Port' })).toHaveValue(161)

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockUpdateReq).toBeCalledWith({
      host: 'amyTest',
      interfaces: [{
        interfaceid: '12',
        ip: '192.168.1.1',
        port: '161',
        main: 1,
        type: 2,
        useip: 1,
        dns: '',
        details: {
          version: '2',
          community: 'zabbix'
        }
      }],
      groups: [{ groupid: '2' }],
      templates: [{
        templateid: '10226'
      }],
      tags: [
        {
          tag: 'host-name',
          value: 'Sibi_Rodan_3u_Stack_Postman_2'
        }
      ]
    }))
  })
})