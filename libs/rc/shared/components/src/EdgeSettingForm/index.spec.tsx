import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                  from '@acx-ui/components'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockVenueData } from './__tests__/fixtures'

import { EdgeSettingForm } from './index'

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

describe('EdgeSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should create EdgeSettingForm successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'SmartEdge Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible()
  })

  it('should create EdgeSettingForm with edit mode successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm isEdit />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Serial Number' })).toBeDisabled()
  })

  it('should render init data correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    expect((await screen.findAllByRole('option', { name: /Mock Venue/i })).length).toBe(3)
  })

  it('should show OTP message correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '96_serial_number_test')
    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('should show error when serial number is not for v-edge', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '12345')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should show error when v-edge sn contains invalid characters', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '96bacs;;aaaaaabbbbbbbbbbcccccccccc')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should show error when length of v-edge sn is less then 34', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '96ABCDE')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Field must be exactly 34 characters')).toBeVisible()
  })

  it('should show error when length of v-edge sn is more then 34', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const serialNumberInput = await screen.findByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '967107237F423711EE948762BC9B5F795AB')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Field must be exactly 34 characters')).toBeVisible()
  })
})
