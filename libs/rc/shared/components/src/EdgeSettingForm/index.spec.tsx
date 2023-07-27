import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                             from '@acx-ui/components'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { mockVenueData } from './__tests__/fixtures'

import { EdgeSettingForm } from './index'

describe.skip('EdgeSettingForm', () => {
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
        <EdgeSettingForm />
      </Provider>, { route: { params } }
    )
    await screen.findByRole('combobox', { name: 'Venue' })
    await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    await screen.findByRole('textbox', { name: 'Serial Number' })
    await screen.findByRole('textbox', { name: 'Description' })
  })

  it('should create EdgeSettingForm with edit mode successfully', async () => {
    render(
      <Provider>
        <EdgeSettingForm isEdit />
      </Provider>, { route: { params } }
    )
    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeDisabled()
    expect(await screen.findByRole('textbox', { name: 'Serial Number' })).toBeDisabled()
  })

  it('should render init data correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeSettingForm />
      </Provider>, { route: { params } }
    )
    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await screen.findByText('Mock Venue 1')
    await screen.findByText('Mock Venue 2')
    await screen.findByText('Mock Venue 3')
  })

  it('should show OTP message correctly', async () => {
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
    fireEvent.change(serialNumberInput, { target: { value: '96_serial_number_test' } })
    await screen.findByRole('alert')
  })

  it('should show error when serial number is invalid', async () => {
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
    fireEvent.change(serialNumberInput, { target: { value: '12345' } })
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })
})
