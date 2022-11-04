import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { render, screen }    from '@acx-ui/test-utils'

import WifiWidgets from './Widgets'
import '@acx-ui/rc/components'

jest.mock('@acx-ui/rc/components', () => ({
  AlarmWidget: () => <div data-testid='AlarmWidget' />
}))

describe('Wi-Fi Widgets', () => {
  it('should render Alarm widget', async () => {
    render(<WifiWidgets name='alarms' />)
    expect(await screen.findByTestId('AlarmWidget')).toBeVisible()
  })
  it('should render a Card with name, if widget is not defined and FF enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(<WifiWidgets name={'none'}></WifiWidgets>)
    expect(screen.getByText('none')).toBeVisible()
  })
  it('should not render a Card with name, if widget is not defined and FF disabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)
    render(<WifiWidgets name={'none'}></WifiWidgets>)
    expect(screen.getByText('Coming soon...')).toBeVisible()
  })
})
