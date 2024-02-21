/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                         from '@acx-ui/components'
import { nsgApi }                            from '@acx-ui/rc/services'
import {
  EdgeNSGFixtures, NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockContextData }                    from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { GeneralSettingsForm } from '.'

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

jest.mock('./PersonalIdentityPreparationListDrawer', () => ({
  PersonalIdentityPreparationListDrawer: () => <div data-testid='PersonalIdentityPreparationListDrawer' />
}))
jest.mock('./PropertyManagementInfo', () => ({
  PropertyManagementInfo: () => <div data-testid='PropertyManagementInfo' />
}))
jest.mock('./PersonalIdentityDiagram', () => ({
  PersonalIdentityDiagram: () => <div data-testid='PersonalIdentityDiagram' />
}))

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockNsgStatsList } = EdgeNSGFixtures

describe('PersonalIdentityNetworkForm - GeneralSettingsForm', () => {
  store.dispatch(nsgApi.util.resetApiState())
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      )
    )
  })

  it('Step1 - Shuould render general setting successfully', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <GeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    expect(await screen.findByRole('textbox', { name: 'Service Name' })).toBeVisible()
    expect(await screen.findByRole('combobox', { name: 'Venue with SmartEdge deployed' })).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityPreparationListDrawer')).toBeVisible()
  })

  it('Step1 - Shuould show property config when the venue has been selected', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <GeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    expect(screen.queryByTestId('PropertyManagementInfo')).not.toBeInTheDocument()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with SmartEdge deployed' }),
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
              <GeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Service Name')).toBeVisible()
    expect(await screen.findByText('Please select a Venue')).toBeVisible()
  })

  it('Step1 - Should show diagram after selecting a venue', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <GeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createNsgPath } })
    expect(screen.queryByTestId('PersonalIdentityDiagram')).not.toBeInTheDocument()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with SmartEdge deployed' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(screen.queryByTestId('PersonalIdentityDiagram')).toBeVisible()
  })
})
