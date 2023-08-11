/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }        from '@acx-ui/components'
import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import {
  mockNsgSwitchInfoData, webAuthList
} from '../../__tests__/fixtures'

import { SummaryForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

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

const mockedFinishFn = jest.fn()

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('SummaryForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('name', 'testNsgName')
      form.setFieldValue('tags', ['Tag1', 'Tag2'])
      form.setFieldValue('venueName', 'testVenue')
      form.setFieldValue('edgeName', 'testEdge')
      form.setFieldValue('segments', 10)
      form.setFieldValue('devices', 10)
      form.setFieldValue('dhcpName', 'testDhcp')
      form.setFieldValue('poolName', 'testDhcpPool')
      form.setFieldValue('tunnelProfileName', 'Default')
      form.setFieldValue('networkNames', ['testDpsk1', 'testDpsk2'])
      form.setFieldValue('distributionSwitchInfos', mockNsgSwitchInfoData.distributionSwitches)
      form.setFieldValue('accessSwitchInfos', mockNsgSwitchInfoData.accessSwitches)
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm form={formRef.current} onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <SummaryForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.click(await screen.findByRole('button', { name: 'Add' }))
  })
})
