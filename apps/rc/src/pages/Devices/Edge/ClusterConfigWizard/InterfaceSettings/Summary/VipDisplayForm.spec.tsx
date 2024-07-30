import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { mockClusterConfigWizardData } from '../../__tests__/fixtures'

import { VipDisplayForm } from './VipDisplayForm'

jest.mock('./VipCard', () => ({
  ...jest.requireActual('./VipCard'),
  VipCard: () => <div data-testid='VipCard' />
}))

describe('InterfaceSettings - Summary > VipDisplayForm', () => {
  it('should render correctly', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <VipDisplayForm
            vipConfig={mockClusterConfigWizardData.vipConfig}
            timeout={mockClusterConfigWizardData.timeout + ''}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByTestId('VipCard')).toBeVisible()
    expect(screen.getByText('HA Timeout')).toBeVisible()
    expect(screen.getByText('3 seconds')).toBeVisible()
  })

  it('should not render VipCard when vipConfig is empty/undefined', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <VipDisplayForm
            vipConfig={undefined}
            timeout={mockClusterConfigWizardData.timeout + ''}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.queryByTestId('VipCard')).toBeNull()
    expect(screen.queryByTestId('HA Timeout')).toBeNull()
    expect(screen.queryByTestId('3 seconds')).toBeNull()
  })
})