/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsFormNew } from '@acx-ui/components'
import {
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import {
  mockVenueNetworkData,
  mockNetworkGroup
} from '../../__tests__/fixtures'

import { WirelessNetworkForm } from '.'

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

describe('NetworkSegmentation - GeneralSettingsForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.status(200))
      )
    )
  })

  it('Step3 - Wireless network success', async () => {
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
            <WirelessNetworkForm />
          </StepsFormNew.StepForm>
        </StepsFormNew>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )
    await user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })

  it('Step3 - Wireless network will be block by mandatory validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsFormNew onFinish={mockedFinishFn}>
          <StepsFormNew.StepForm>
            <WirelessNetworkForm />
          </StepsFormNew.StepForm>
        </StepsFormNew>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
    await screen.findByText('Please select at least 1 network')
  })
})
