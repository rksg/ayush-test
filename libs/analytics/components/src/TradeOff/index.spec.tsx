import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'

import { StepsForm }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Default } from './stories'

import { TradeOff, TradeOffProps } from '.'

const { click } = userEvent

describe('TradeOff', () => {

  it('should render with StepsForm', async () => {
    const { name, ...props } = Default.args as TradeOffProps

    const mockedUpdateReq = jest.fn()
    const mockedChangeReq = jest.fn()
    const mockedOnChange = jest.fn()

    render(<Provider>
      <StepsForm
        onFinish={mockedUpdateReq}
        onFieldsChange={([field]) => field && mockedChangeReq(field.value)}
        initialValues={{ [String(name)]: props.radios[0].value }}>
        <StepsForm.StepForm>
          <Form.Item
            name={name}
            children={<TradeOff
              {..._.pick(props, ['headers', 'radios'])}
              onChange={mockedOnChange}
            />}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Intent Priority')).toBeVisible()
    expect(await screen.findByText('IntentAI Scope')).toBeVisible()
    expect(screen.getByRole('radio', {
      name: 'Maximize client density - simultaneous connected clients (Default)'
    })).toBeChecked()

    await click(screen.getByRole('radio', { name: 'Lable3' }))
    expect(screen.getByRole('radio', { name: 'Lable3' })).toBeChecked()

    expect(mockedChangeReq).toBeCalledWith('value3')

    const rowToClick = screen.getByText('Full Optimization')
    await userEvent.click(rowToClick)

    expect(mockedOnChange).toHaveBeenCalledWith('value1')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const call = mockedUpdateReq.mock.calls[0]
    expect(call[0]).toStrictEqual({ tradeOff: 'value1' })
  })
})
