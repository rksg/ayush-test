import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockEdgePortConfig } from '../../../../__tests__/fixtures'

import { LagDrawer } from './LagDrawer'


type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedSetVisible = jest.fn()

describe('EditEdge ports - LAG', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'sub-interface'
    }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdgeLag.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeUrlsInfo.updateEdgeLag.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Should add LAG correctly', async () => {
    render(
      <Provider>
        <LagDrawer
          visible={true}
          setVisible={mockedSetVisible}
          portList={mockEdgePortConfig.ports}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const selector = await screen.findAllByRole('combobox')
    await userEvent.selectOptions(selector[0], '2')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })

  it('Should pop up warning modal when select inused port', async () => {
    render(
      <Provider>
        <LagDrawer
          visible={true}
          setVisible={mockedSetVisible}
          portList={mockEdgePortConfig.ports}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const selector = await screen.findAllByRole('combobox')
    await userEvent.selectOptions(selector[0], '2')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Port 1' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Port Enabled' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Replace with LAG settings' }))
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })
})
