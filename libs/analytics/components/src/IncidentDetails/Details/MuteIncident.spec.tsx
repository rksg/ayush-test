import userEvent from '@testing-library/user-event'

import { fakeIncident1 }  from '@acx-ui/analytics/utils'
import { showToast }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useMuteIncidentsMutation } from '../../IncidentTable/services'

import MuteIncident from './MuteIncident'

const mockedUseMuteIncidentsMutation = useMuteIncidentsMutation as jest.Mock
const mockedMuteIncident = jest.fn()
jest.mock('../../IncidentTable/services', () => ({
  ...jest.requireActual('../../IncidentTable/services'),
  useMuteIncidentsMutation: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('Mute Incident', () => {
  const params = { incidentId: fakeIncident1.id }
  beforeEach(() => {
    mockedUseMuteIncidentsMutation.mockImplementation(() => [mockedMuteIncident])
  })
  afterEach(() => {
    mockedUseMuteIncidentsMutation.mockClear()
  })
  it('should render correctly', async () => {
    render(
      <Provider><MuteIncident incident={fakeIncident1}/></Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    expect(configButton).toBeVisible()
    await userEvent.click(configButton)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
  it('should mute and unmute incident correctly', async () => {
    mockedMuteIncident.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(
      <Provider><MuteIncident incident={fakeIncident1}/></Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    await userEvent.click(configButton)
    await userEvent.click(screen.getByRole('switch'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'Incident muted successfully'
    })
    await userEvent.click(screen.getByRole('switch'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'Incident unmuted successfully'
    })
  })
  it('should handle error correctly', async () => {
    mockedMuteIncident.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: false, errorCode: '1', errorMsg: 'error' }
      })
    }))
    render(
      <Provider><MuteIncident incident={fakeIncident1}/></Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    await userEvent.click(configButton)
    await userEvent.click(screen.getByRole('switch'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'error'
    })
  })
})