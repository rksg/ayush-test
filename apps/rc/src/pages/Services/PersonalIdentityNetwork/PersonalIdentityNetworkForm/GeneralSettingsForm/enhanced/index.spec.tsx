/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }              from '@acx-ui/components'
import { pinApi }                 from '@acx-ui/rc/services'
import {
  EdgePinFixtures, EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockContextData }                    from '../../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../../PersonalIdentityNetworkFormContext'

import { EnhancedGeneralSettingsForm } from '.'

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

jest.mock('./PropertyManagementInfo', () => ({
  PropertyManagementInfo: () => <div data-testid='PropertyManagementInfo' />
}))

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockPinStatsList } = EdgePinFixtures

describe('PersonalIdentityNetworkForm - EnhancedGeneralSettingsForm', () => {
  store.dispatch(pinApi.util.resetApiState())

  let params: { tenantId: string, serviceId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      ))
  })

  it('Step1 - Shuould render general setting successfully', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <EnhancedGeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    expect(await screen.findByRole('textbox', { name: 'Service Name' })).toBeVisible()
    expect(await screen.findByRole('combobox', { name: 'Venue with RUCKUS Edge deployed' })).toBeVisible()
    expect(screen.queryByTestId('PropertyManagementInfo')).toBeNull()
  })

  it('Step1 - Shuould show property config when the venue has been selected', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <EnhancedGeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    expect(screen.queryByTestId('PropertyManagementInfo')).not.toBeInTheDocument()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with RUCKUS Edge deployed' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    await screen.findByTestId('PropertyManagementInfo')
  })

  it('Step1 - General setting will be block by mandatory validation', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <EnhancedGeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Service Name')).toBeVisible()
    expect(await screen.findByText('Please select a Venue')).toBeVisible()
  })
})
