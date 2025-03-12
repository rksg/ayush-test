import userEvent from '@testing-library/user-event'

import { StepsForm }              from '@acx-ui/components'
import { render, screen, within } from '@acx-ui/test-utils'

import { AddDpskModal } from './AddDpskModal'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  NetworkForm: (props: { modalCallBack: () => void }) =>
    <div data-testid='NetworkForm' >
      <button onClick={() => props.modalCallBack()}>Add</button>
    </div>
}))

describe('PIN WirelessNetwork Form - AddDpskModal', () => {
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
  it('Should trigger modal callback after add success', async () => {
    const spySetVisible = jest.fn()
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <AddDpskModal visible={true} setVisible={spySetVisible} />
        </StepsForm.StepForm>
      </StepsForm>
    )

    const networkForm = screen.getByTestId('NetworkForm')
    expect(networkForm).toBeVisible()
    await userEvent.click(within(networkForm).getByRole('button', { name: 'Add' }))
    expect(spySetVisible).toHaveBeenCalled()
  })
})