import userEvent from '@testing-library/user-event'

import { showToast }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useMuteRecommendationMutation } from '../services'

import MuteRecommendation from './MuteRecommendation'

const mockedUseRecommendationMutation = useMuteRecommendationMutation as jest.Mock
const mockedMuteRecommendation = jest.fn()
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  useMuteRecommendationMutation: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('Mute Recommendation', () => {
  const params = { recommendationId: 'fake-id' }
  const props = {
    id: 'id',
    isMuted: false,
    link: 'link',
    type: 'type'
  }
  beforeEach(() => {
    mockedUseRecommendationMutation.mockImplementation(() => [mockedMuteRecommendation])
  })
  afterEach(() => {
    mockedUseRecommendationMutation.mockClear()
  })
  it('should render correctly', async () => {
    render(
      <Provider><MuteRecommendation {...props}/></Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    expect(configButton).toBeVisible()
    await userEvent.click(configButton)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
  it('should mute and unmute Recommendation correctly', async () => {
    mockedMuteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(
      <Provider><MuteRecommendation {...props} /></Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    await userEvent.click(configButton)
    await userEvent.click(screen.getByRole('switch'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'Recommendation muted successfully'
    })
    await userEvent.click(screen.getByRole('switch'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'Recommendation unmuted successfully'
    })
  })
  it('should handle error correctly', async () => {
    mockedMuteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: false, errorCode: '1', errorMsg: 'error' }
      })
    }))
    render(
      <Provider><MuteRecommendation {...props} /></Provider>,
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