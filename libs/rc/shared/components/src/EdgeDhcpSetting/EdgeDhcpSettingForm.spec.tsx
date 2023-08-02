import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { EdgeDhcpSettingForm } from './EdgeDhcpSettingForm'

jest.mock('./DhcpPool/PoolDrawer', () => ({
  PoolDrawer: () => <div data-testid='mocked-PoolDrawer'></div>
}))
jest.mock('./DhcpOption/OptionDrawer', () => ({
  OptionDrawer: () => <div data-testid='mocked-OptionDrawer'></div>
}))
jest.mock('./DhcpHost/HostDrawer', () => ({
  HostDrawer: () => <div data-testid='mocked-HostDrawer'></div>
}))

describe('EdgeDhcpSettingForm', () => {

  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should show external dhcp server setting', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    expect(await screen.findByTestId('steps-form')).toBeVisible()
    expect(await screen.findByText('Service Name')).toBeVisible()
    expect(await screen.findByRole('textbox', { name: 'Primary DNS Server' })).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: 'DHCP Relay:' }))
    expect(await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })).toBeVisible()
  })

  it('should show secondary dns server', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    expect(await screen.findByRole('textbox', { name: 'Secondary DNS Server' })).toBeVisible()
  })

  it('should show error dns ip is invalid', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Primary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Secondary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), 'test')
    const errors = await screen.findAllByText('Please enter a valid IP address' )
    expect(errors.length).toBe(2)
  })
})
