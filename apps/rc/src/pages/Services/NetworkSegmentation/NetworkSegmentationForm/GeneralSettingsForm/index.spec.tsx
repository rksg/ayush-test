/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm } from '@acx-ui/components'
import {
  DpskUrls, PersonaUrls,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockAvailablePropertyConfigs,
  mockDpsk, mockPersonaGroup,
  mockPropertyConfigs
} from '../../__tests__/fixtures'

import { GeneralSettingsForm } from '.'

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
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (req, res, ctx) => res(ctx.json(mockAvailablePropertyConfigs))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      )
    )
  })

  it('Step1 - General setting success', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <GeneralSettingsForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(serviceNameInput, 'TestService')
    await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with the property management enabled' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('Step1 - General setting will be block by mandatory validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <GeneralSettingsForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    await user.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Service Name')
    await screen.findByText('Please select a Venue')
  })
})
