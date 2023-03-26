/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsFormNew }                     from '@acx-ui/components'
import {
  NetworkSegmentationUrls, SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import {
  mockNsgSwitchInfoData, switchLagList, switchPortList, switchVlanUnion, webAuthList
} from '../../__tests__/fixtures'

import { AccessSwitchForm } from '.'

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

describe('AddNetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...webAuthList[0] }))
      ),
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: switchPortList }))
      ),
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(switchLagList))
      ),
      rest.post(
        NetworkSegmentationUrls.validateAccessSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      )
    )
  })

  it('Step5 - Access switch success', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('accessSwitchInfos', mockNsgSwitchInfoData.accessSwitches)
      form.setFieldValue('venueId', 'testVenueId')
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsFormNew form={formRef.current} onFinish={mockedFinishFn}>
          <StepsFormNew.StepForm>
            <AccessSwitchForm />
          </StepsFormNew.StepForm>
        </StepsFormNew>
      </Provider>,
      { route: { params, path: createNsgPath } })
    const asRow = await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    await user.click(asRow)
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })
})
