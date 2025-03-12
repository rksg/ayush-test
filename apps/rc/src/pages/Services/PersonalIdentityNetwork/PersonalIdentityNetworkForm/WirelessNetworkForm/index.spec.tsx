/* eslint-disable max-len */

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { StepsForm }       from '@acx-ui/components'
import { EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockContextData
} from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { WirelessNetworkForm } from '.'

const {
  mockNetworkGroup,
  mockPinStatsList
} = EdgePinFixtures

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
jest.mock('./AddDpskModal', () => ({
  AddDpskModal: (props: { visible: boolean }) => <div data-testid='AddDpskModal'>
    {''+props.visible}
  </div>
}))
jest.mock('@acx-ui/rc/components', () => ({
  TunnelProfileAddModal: () => <div data-testid='TunnelProfileAddModal' />,
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
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

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'

describe('PersonalIdentityNetworkForm - WirelessNetworkForm', () => {
  const params: { tenantId: string, serviceId: string } = {
    tenantId: tenantId,
    serviceId: 'testServiceId'
  }
  const mockedGetNetworkDeepList = jest.fn()

  beforeEach(() => {
    mockedGetNetworkDeepList.mockReset()
    mockedFinishFn.mockReset()
  })

  it('Step3 - Wireless network success', async () => {
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
      { route: { params, path: createPinPath } })
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )

    const checkboxs = await screen.findAllByRole('checkbox', { name: /Network /i })
    const usedNetowrkIds = mockPinStatsList.data.flatMap(item => item.tunneledWlans.map(wlan => wlan.networkId))
    const unusedNetworkOptions = mockNetworkGroup.response.length - usedNetowrkIds.length
    expect(checkboxs.length).toBe(unusedNetworkOptions)
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)
    expect(mockedFinishFn).toBeCalledTimes(1)
  })

  it('Step3 - Wireless network will be not block by empty list', async () => {
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
      { route: { params, path: createPinPath } })

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )
    await screen.findByRole('checkbox', { name: 'Network 1' })
    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)
    expect(mockedFinishFn).toBeCalledTimes(1)
  })

  it('Step3 - should correctly render when no network is available', async () => {
    const mockContextData_noNetwork = cloneDeep(mockContextData)
    mockContextData_noNetwork.networkOptions = []

    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData_noNetwork}
        >
          <StepsForm onFinish={mockedFinishFn}>
            <StepsForm.StepForm>
              <WirelessNetworkForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })

    await screen.findByText(/No networks activated on Venue/)

    const addNetworkButton = await screen.findByRole('button', { name: 'Add DPSK Network' })
    await userEvent.click(addNetworkButton)
    expect(screen.getByTestId('AddDpskModal')).toHaveTextContent('true')
  })
})