import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { AddDpskModal } from './AddDpskModal'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  NetworkForm: () => <div data-testid='NetworkForm' />
}))

describe('NSG WirelessNetwork Form - AddDpskModal', () => {
  it('Should render modal successfully', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <AddDpskModal visible={true} setVisible={() => {}} />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByTestId('NetworkForm')).toBeVisible()
  })
})