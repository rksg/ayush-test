/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }             from '@acx-ui/components'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { pinApi }                from '@acx-ui/rc/services'
import {
  EdgePinFixtures, EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
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

jest.mock('@acx-ui/rc/components',() => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
jest.mock('./PersonalIdentityPreparationListDrawer', () => ({
  PersonalIdentityPreparationListDrawer: (props: { open: boolean, onClose: () => void }) => <div data-testid='PersonalIdentityPreparationListDrawer'>
    {`${props.open}`}
    <button onClick={props.onClose}>Close</button>
  </div>
}))
jest.mock('./PropertyManagementInfo', () => ({
  PropertyManagementInfo: () => <div data-testid='PropertyManagementInfo' />
}))
jest.mock('./PersonalIdentityDiagram', () => ({
  PersonalIdentityDiagram: () => <div data-testid='PersonalIdentityDiagram' />
}))
jest.mock('./enhanced', () => ({
  EnhancedGeneralSettingsForm: () => <div data-testid='EnhancedGeneralSettingsForm' />
}))

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockPinStatsList } = EdgePinFixtures

describe('PersonalIdentityNetworkForm - GeneralSettingsForm', () => {
  store.dispatch(pinApi.util.resetApiState())
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (req, res, ctx) => res(ctx.json(mockPinStatsList))
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
      { route: { params, path: createPinPath } })
    expect(await screen.findByRole('textbox', { name: 'Service Name' })).toBeVisible()
    expect(await screen.findByRole('combobox', { name: 'Venue with RUCKUS Edge deployed' })).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityPreparationListDrawer')).toHaveTextContent('false')
    expect( screen.queryByTestId('EnhancedGeneralSettingsForm')).not.toBeInTheDocument()
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
              <GeneralSettingsForm />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>,
      { route: { params, path: createPinPath } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Service Name')).toBeVisible()
    expect(await screen.findByText('Please select a Venue')).toBeVisible()
  })

  it('Step1 - validation for special character on service name', async () => {
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
      { route: { params, path: createPinPath } })
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), ' testing$(')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.')).toBeVisible()
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
      { route: { params, path: createPinPath } })
    expect(screen.queryByTestId('PersonalIdentityDiagram')).not.toBeInTheDocument()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with RUCKUS Edge deployed' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(screen.queryByTestId('PersonalIdentityDiagram')).toBeVisible()
  })

  it('Step1 - Shuould show/hide preparation drawer', async () => {
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
      { route: { params, path: createPinPath } })

    expect(await screen.findByRole('textbox', { name: 'Service Name' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'preparations' }))
    const drawer = await screen.findByTestId('PersonalIdentityPreparationListDrawer')
    expect(drawer).toHaveTextContent('true')
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
    expect(drawer).toHaveTextContent('false')
  })

  describe('PIN enhance FF is enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    })

    it('Should render enhanced form', async () => {
      render(
        <Provider>
          <PersonalIdentityNetworkFormContext.Provider value={mockContextData}>
            <StepsForm>
              <StepsForm.StepForm>
                <GeneralSettingsForm />
              </StepsForm.StepForm>
            </StepsForm>
          </PersonalIdentityNetworkFormContext.Provider>
        </Provider>,
        { route: { params, path: createPinPath } })

      expect(await screen.findByTestId('EnhancedGeneralSettingsForm')).toBeVisible()
      expect(screen.queryByRole('combobox', { name: 'Venue with RUCKUS Edge deployed' })).not.toBeInTheDocument()
    })
  })
})