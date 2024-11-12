import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { RadioTab } from '.'


const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Network More settings - Radio Tab', () => {

  it('should visible Hide SSID', async () => {
    render(
      <Provider>
        <Form>
          <RadioTab />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/Hide SSID/i)
    expect(within(view).getByRole('switch')).toBeVisible()
  })

  it('Adjust BBS Min Rate value', async () => {
    render(
      <Provider>
        <Form>
          <RadioTab />
        </Form>
      </Provider>,
      { route: { params } })

    const mgmtTxRateSelect = screen.getByTestId('mgmtTxRateSelect')
    expect(within(mgmtTxRateSelect).getByText(/6 Mbps/i)).toBeVisible()

    const ofdmCheckbox = screen.getByTestId('enableOfdmOnly')

    // disable ofdm
    await userEvent.click(ofdmCheckbox)
    await userEvent.click(screen.getByText(/none/i))
    await userEvent.click(screen.getByText(/5.5 Mbps/i))
    expect(within(mgmtTxRateSelect).getByText(/5.5 Mbps/i)).toBeVisible()

    const bssMinimumPhyRateCombo = await screen.findByRole('combobox', { name: /BSS Min Rate/i })
    await userEvent.click(bssMinimumPhyRateCombo)
    await userEvent.click(await screen.findByTitle(/24 Mbps/i))
    expect(within(mgmtTxRateSelect).getByText(/24 Mbps/i)).toBeVisible()

    await userEvent.click(bssMinimumPhyRateCombo)
    await userEvent.click(await screen.findByTitle(/none/i))
    expect(within(mgmtTxRateSelect).getByText(/2 Mbps/i)).toBeVisible()

    // enable ofdm
    await userEvent.click(ofdmCheckbox)
    await userEvent.click(bssMinimumPhyRateCombo)
    await userEvent.click(await screen.findByTitle(/12 Mbps/i))
    expect(within(mgmtTxRateSelect).getByText(/12 Mbps/i)).toBeVisible()

    await userEvent.click(bssMinimumPhyRateCombo)
    await userEvent.click(await screen.findByTitle(/none/i))
    expect(within(mgmtTxRateSelect).getByText(/6 Mbps/i)).toBeVisible()
  })
})
