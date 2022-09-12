import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { render, screen }    from '@acx-ui/test-utils'

import WifiWidgets from './Widgets'

jest.mock('./components/AlarmWidget', () => ({
  __esModule: true,
  default: () => <div>Alarms Widget</div>
}))
jest.mock('./components/VenuesDonut', () => ({
  __esModule: true,
  default: () => <div>Venues Widget</div>
}))
jest.mock('./components/DevicesDonut', () => ({
  __esModule: true,
  default: () => <div>Devices Widget</div>
}))
jest.mock('./components/ClientsDonut', () => ({
  __esModule: true,
  default: () => <div>Clients Widget</div>
}))
jest.mock('./components/Map', () => ({
  __esModule: true,
  default: () => <div>Map Widget</div>
}))

describe('Wi-Fi Widgets', () => {
  it('should render Alarm widget', async () => {
    render(<WifiWidgets name={'alarms'}></WifiWidgets>)
    expect(screen.getByText('Alarms Widget')).toBeTruthy()
  })
  it('should render Venues widget', async () => {
    render(<WifiWidgets name={'venues'}></WifiWidgets>)
    expect(screen.getByText('Venues Widget')).toBeTruthy()
  })
  it('should render Devices widget', async () => {
    render(<WifiWidgets name={'devices'}></WifiWidgets>)
    expect(screen.getByText('Devices Widget')).toBeTruthy()
  })
  it('should render Clients widget', async () => {
    render(<WifiWidgets name={'clients'}></WifiWidgets>)
    expect(screen.getByText('Clients Widget')).toBeTruthy()
  })
  it('should render Map widget', async () => {
    render(<WifiWidgets name={'map'}></WifiWidgets>)
    expect(screen.getByText('Map Widget')).toBeTruthy()
  })
  it('should render a Card with name, if widget is not defined and FF enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(<WifiWidgets name={'none'}></WifiWidgets>)
    expect(screen.getByText('none')).toBeTruthy()
  })
  it('should not render a Card with name, if widget is not defined and FF disabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)
    render(<WifiWidgets name={'none'}></WifiWidgets>)
    expect(screen.getByText('Coming soon...')).toBeTruthy()
  })
})
