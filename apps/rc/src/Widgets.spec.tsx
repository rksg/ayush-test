import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import WifiWidgets from './Widgets'

jest.mock('./components/AlarmWidget', () => ({
  __esModule: true,
  default: () => <div>Alarms Widget</div>
}))
jest.mock('./components/VenuesDonut', () => ({
  __esModule: true,
  default: () => <div>Venues Widget</div>
}))
jest.mock('./components/DevicesDonut/DashboardWidget', () => ({
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
jest.mock('./components/AlarmWidget/VenueAlarmDonut', () => ({
  __esModule: true,
  default: () => <div>Venue Overview Alarm Widget</div>
}))
jest.mock('./components/DevicesDonut/VenueWidget', () => ({
  __esModule: true,
  default: () => <div>Venue Overview Devices Widget</div>
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
  it('should render Venue Overview Alarm widget', async () => {
    render(<WifiWidgets name={'venueAlarmDonut'}></WifiWidgets>)
    expect(screen.getByText('Venue Overview Alarm Widget')).toBeTruthy()
  })
  it('should render Venue Overview Devices widget', async () => {
    render(<WifiWidgets name={'venueDevices'}></WifiWidgets>)
    expect(screen.getByText('Venue Overview Devices Widget')).toBeTruthy()
  })
})
