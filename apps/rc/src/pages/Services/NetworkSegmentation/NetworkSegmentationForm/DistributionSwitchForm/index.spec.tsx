/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsFormNew }     from '@acx-ui/components'
import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen, within
} from '@acx-ui/test-utils'

import {
  mockNsgSwitchInfoData
} from '../../__tests__/fixtures'

import { DistributionSwitchForm } from '.'

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
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.distributionSwitches }))
      ),
      rest.get(
        NetworkSegmentationUrls.getAccessSwitchesByDS.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.accessSwitches }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      )
    )
  })

  it('Step4 - Distribution switch success', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('venueId', 'testVenueId')
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsFormNew form={formRef.current} onFinish={mockedFinishFn}>
          <StepsFormNew.StepForm>
            <DistributionSwitchForm />
          </StepsFormNew.StepForm>
        </StepsFormNew>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.click(await screen.findByRole('button', { name: 'Add Distribution Switch' }))
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Distribution Switch' }),
      await screen.findByRole('option', { name: 'FMN4221R00H---DS---3' })
    )
    await user.type(await screen.findByRole('textbox', { name: 'VLAN Range' }), '10')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface ID' }), '12')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface IP Address' }), '1.2.3.4')
    await user.type(await screen.findByRole('textbox', { name: 'Lookback Interface Subnet Mask' }), '255.255.255.0')

    await user.click(await screen.findByRole('button', { name: 'Select' }))
    const asTransfer = await screen.findByRole('dialog', { name: /Select Access Switches/i })
    await user.click(await within(asTransfer).findByText(/FEK3224R09N---AS---3/i))
    await user.click(await within(asTransfer).findByRole('button', { name: /Add/i }))

    await user.click(await within(asTransfer).findByRole('button', { name: 'Apply' }))

    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })
})
