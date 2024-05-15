import { Form } from 'antd'
import { rest } from 'msw'

import { StepsForm }                              from '@acx-ui/components'
import { edgeApi }                                from '@acx-ui/rc/services'
import { EdgeDHCPFixtures, EdgeDhcpUrls }         from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'


import { EdgeDhcpSelectionForm } from './index'

const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures

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

describe('EdgeDhcpSelectionForm', () => {
  let params: { tenantId: string, clusterId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '736bc471-a520-4382-a5c5-560c1791ac11'
    }

    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      )
    )
  })

  it('should create EdgeDhcpSelectionForm successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSelectionForm hasNsg={false} />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText('DHCP Service')).toBeVisible()
  })

  it('should show "Select" in drop-down when dhcpId is not given', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSelectionForm hasNsg={false} />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText('Select...')).toBeVisible()
    expect(screen.queryByText('Pool Name')).toBeNull()
  })

  it('should show DHCP profile name and pools when dhcpId is given', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldValue('dhcpId', 1)

    render(
      <Provider>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <EdgeDhcpSelectionForm hasNsg={false} />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText('TestDHCP-1')).toBeVisible()
    expect(await screen.findByText('PoolTest1')).toBeVisible()
  })
})
