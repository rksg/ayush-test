import { Form } from 'antd'
import { rest } from 'msw'

import { StepsForm }                                     from '@acx-ui/components'
import { edgeApi }                                       from '@acx-ui/rc/services'
import { EdgeHqosProfileFixtures, EdgeHqosProfilesUrls } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen }        from '@acx-ui/test-utils'

import { EdgeHqosProfileSelectionForm } from './index'

const { mockEdgeHqosProfileStatusList, mockEdgeHqosData } = EdgeHqosProfileFixtures

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

describe('EdgeHqosProfileSelectionForm', () => {
  let params: { tenantId: string, clusterId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '736bc471-a520-4382-a5c5-560c1791ac11'
    }

    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList))
      ),
      rest.get(
        EdgeHqosProfilesUrls.getEdgeHqosProfileById.url,
        (_, res, ctx) => res(ctx.json(mockEdgeHqosData))
      )
    )
  })

  it('should create EdgeHqosProfileSelectionForm successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeHqosProfileSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText('HQoS Bandwitdth Profile')).toBeVisible()
  })

  it('should show HQoS profile name when qosId is given', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldValue('hqosId', mockEdgeHqosProfileStatusList.data[0].id)

    render(
      <Provider>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <EdgeHqosProfileSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText('Test-QoS-1')).toBeVisible()
  })
})
