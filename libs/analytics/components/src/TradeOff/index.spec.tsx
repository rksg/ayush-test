import userEvent from '@testing-library/user-event'

import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { Default } from './stories'

import { TradeOff, TradeOffProps } from './index'

const { click } = userEvent

describe('TradeOff', () => {

  it('should render loader', async () => {
    render(<StepsForm>
      <StepsForm.StepForm>
        <TradeOff {...(Default.args as TradeOffProps)} />
      </StepsForm.StepForm>
    </StepsForm>, { route: true })
    expect(await screen.findByText('Intent Trade-off')).toBeVisible()
    expect(await screen.findByText('AI Driven - Configuration change')).toBeVisible()

    await click(screen.getByRole('radio', { name: 'Maximize client throughput' }))
    expect(screen.getByRole('radio', { name: 'Maximize client throughput' })).toBeChecked()
  })

})
