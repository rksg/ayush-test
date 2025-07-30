import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                  from '@acx-ui/components'
import { RulesManagementUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { policySetList }                from './__tests__/fixtures'
import { AdaptivePolicySetSettingForm } from './AdaptivePolicySetSettingForm'

jest.mock('./AccessPolicyTable', () => ({
  AccessPolicyTable: () => <div data-testid='AccessPolicyTable' />
}))

describe('AdaptivePolicySetSettingForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.getPolicySetsByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      )
    )
  })

  it('should render AdaptivePolicySetSettingForm successfully', async () => {
    render(
      <Provider>
        <StepsForm buttonLabel={{ submit: 'Save' }}>
          <StepsForm.StepForm>
            <AdaptivePolicySetSettingForm
              accessPolicies={[]}
              setAccessPolicies={() => {}}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    expect(screen.getByRole('textbox', { name: 'Policy Set Name' })).toBeVisible()
    expect(screen.getByTestId('AccessPolicyTable')).toBeVisible()
  })

  it('should show error message while policy set name is duplicated', async () => {
    render(
      <Provider>
        <StepsForm buttonLabel={{ submit: 'Save' }}>
          <StepsForm.StepForm>
            <AdaptivePolicySetSettingForm
              accessPolicies={[]}
              setAccessPolicies={() => {}}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    const policySetNameField = screen.getByRole('textbox', { name: 'Policy Set Name' })
    await userEvent.type(policySetNameField, 'ps12')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText(
        'Adaptive Policy Set with that name already exists'
      )
    ).toBeVisible()
  })

  it('should show error message when policy set name begins with a space', async () => {
    render(
      <Provider>
        <StepsForm buttonLabel={{ submit: 'Save' }}>
          <StepsForm.StepForm>
            <AdaptivePolicySetSettingForm
              accessPolicies={[]}
              setAccessPolicies={() => {}}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    const policySetNameField = screen.getByRole('textbox', { name: 'Policy Set Name' })
    await userEvent.type(policySetNameField, '  ps12')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText(
        'No leading or trailing spaces allowed'
      )
    ).toBeVisible()
  })
})
