import userEvent from '@testing-library/user-event'

import { StepsForm }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { Default } from './stories'

import { TradeOff, TradeOffProps } from './index'

const { click } = userEvent

describe('TradeOff', () => {

  it('should render with StepsForm', async () => {
    let currentValue = 'value1'
    const mockedUpdateReq = jest.fn()
    const mockedChangeReq = jest.fn().mockImplementation((value) => {currentValue = value})

    render(<Provider>
      <StepsForm onFinish={mockedUpdateReq}>
        <StepsForm.StepForm>
          <TradeOff {...(Default.args as TradeOffProps)}
            currentValue={currentValue}
            onChange={mockedChangeReq} />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Intent Priority')).toBeVisible()
    expect(await screen.findByText('AI Driven - Configuration change')).toBeVisible()
    expect(screen.getByRole('radio', {
      name: 'Maximize client density - simultaneous connected clients (Default)'
    })).toBeChecked()

    await click(screen.getByRole('radio', { name: 'Lable3' }))
    expect(screen.getByRole('radio', { name: 'Lable3' })).toBeChecked()
    expect(mockedChangeReq).toBeCalledWith('value3')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const call = mockedUpdateReq.mock.calls[0]
    expect(call[0]).toStrictEqual({ tradeOff: 'value3' })
  })

})
