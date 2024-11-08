import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, waitFor } from '@acx-ui/test-utils'

import { EdgeTnmDetails } from '.'

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
describe('Edge TNM Service Details', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: mockTnm1.id!
    }

    mockAddReq.mockClear()

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
      )
    )
  })

  it('should create table successfully', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Mocked_TNMService_1')).toBeVisible()
    const rows = screen.getAllByRole('row', { name: /example-host8/i })
    expect(rows.length).toBe(1)
  })

  it('should create host successfully', async () => {
    render(<Provider>
      <EdgeTnmDetails />
    </Provider>, {
      route: { params, path: mockPath }
    })

    expect(await screen.findByText('Mocked_TNMService_1')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Add TNM Host' }))
    await screen.findByRole('dialog')
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
  })
})