import { userEvent } from '@storybook/testing-library'
import { Form }      from 'antd'

import { ExternalAntenna }         from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ApExtAntennaForm } from '.'


describe('ApExtAntennaForm', () => {

  it('should render correctly', async () => {
    const selectedApExtAntenna = {
      model: 'E510',
      enable24G: true,
      enable50G: true,
      gain24G: 3,
      gain50G: 3,
      coupled: false,
      supportDisable: true
    } as ExternalAntenna
    const mockExtAntennaChanged = jest.fn()

    render(
      <Provider>
        <Form>
          <ApExtAntennaForm model={selectedApExtAntenna.model}
            apiSelectedApExternalAntenna={selectedApExtAntenna}
            selectedApExternalAntenna={selectedApExtAntenna}
            onExternalAntennaChanged={mockExtAntennaChanged}
          />
        </Form>
      </Provider>
    )

    const enableBtns = await screen.findAllByRole('switch')
    expect(enableBtns.length).toBe(2)

    userEvent.click(enableBtns[0])

    await waitFor(() => {
      expect(mockExtAntennaChanged).toBeCalledWith({
        model: 'E510',
        enable24G: false,
        enable50G: true,
        gain24G: 3,
        gain50G: 3,
        coupled: false,
        supportDisable: true
      })
    })

    const gainSpinBtns = await screen.findAllByRole('spinbutton')
    expect(gainSpinBtns.length).toBe(1)

    userEvent.type(gainSpinBtns[0], '0')

    await waitFor(() => {
      expect(mockExtAntennaChanged).toBeCalledWith({
        model: 'E510',
        enable24G: false,
        enable50G: true,
        gain24G: 3,
        gain50G: 30,
        coupled: false,
        supportDisable: true
      })
    })
  })
})