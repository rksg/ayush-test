/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'

import { StepsForm } from '@acx-ui/components'
import { Provider }  from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockContextData,
  mockNetworkGroup,
  mockNsgStatsList
} from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { WirelessNetworkForm } from '.'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
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

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'

describe('PersonalIdentityNetworkForm - WirelessNetworkForm', () => {
  let params: { tenantId: string, serviceId: string }
  const mockedGetNetworkDeepList = jest.fn()

  beforeEach(() => {
    mockedGetNetworkDeepList.mockReset()
    params = {
      tenantId: tenantId,
      serviceId: 'testServiceId'
    }
  })

  it('Step3 - Wireless network success', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <WirelessNetworkForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )

    const checkboxs = await screen.findAllByRole('checkbox', { name: /Network /i })
    const usedNetowrkIds = mockNsgStatsList.data.flatMap(item => item.networkIds)
    const unusedNetworkOptions = mockNetworkGroup.response.length - usedNetowrkIds.length
    expect(checkboxs.length).toBe(unusedNetworkOptions)
    await user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[1])
    expect(mockedFinishFn).toBeCalledTimes(1)
  })

  it('Step3 - Wireless network will be not block by empty list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <WirelessNetworkForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })

    await screen.findByRole('checkbox', { name: 'Network 1' })
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[1])
    expect(mockedFinishFn).toBeCalledTimes(1)
  })
})
