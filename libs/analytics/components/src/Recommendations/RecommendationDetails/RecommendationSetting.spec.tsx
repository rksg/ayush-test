import userEvent from '@testing-library/user-event'

import { showToast }      from '@acx-ui/components'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useMuteRecommendationMutation, useDeleteRecommendationMutation } from '../services'

import { mockedRecommendationFirmware, mockedRecommendationCRRM } from './__tests__/fixtures'
import { RecommendationSetting }                                  from './RecommendationSetting'
import { EnhancedRecommendation }                                 from './services'

const mockUseMuteRecommendationMutation = useMuteRecommendationMutation as jest.Mock
const mockUseDeleteRecommendationMutation = useDeleteRecommendationMutation as jest.Mock
const mockedMuteRecommendation = jest.fn()
const mockedDeleteRecommendation = jest.fn()

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  useMuteRecommendationMutation: jest.fn(),
  useDeleteRecommendationMutation: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('RecommendationSetting', () => {
  const params = { recommendationId: 'fake-id', tenantId: 'tenant-id' }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockUseMuteRecommendationMutation.mockImplementation(() =>[mockedMuteRecommendation])
    mockUseDeleteRecommendationMutation.mockImplementation(() => [mockedDeleteRecommendation])
  })
  afterEach(() => {
    mockUseMuteRecommendationMutation.mockClear()
    mockUseDeleteRecommendationMutation.mockClear()
  })
  it('should render correctly for aiOps', async () => {
    render(
      <Provider>
        <RecommendationSetting recommendationDetails={{
          ...mockedRecommendationFirmware, status: 'applyfailed' } as EnhancedRecommendation}/>
      </Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    expect(configButton).toBeVisible()
    await userEvent.click(configButton)

    expect(screen.getByText('Actions')).toBeInTheDocument()

    expect(screen.getByText('Mute Recommendation')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByText(/While this recommendation is muted, it will be hidden in the UI/))
      .toBeInTheDocument()
    expect(screen.getByText('AI Operations table'))
      .toBeInTheDocument()

    expect(screen.queryByText('Delete Recommendation')).not.toBeInTheDocument()
  })
  it('should render correctly for crrm', async () => {
    render(
      <Provider>
        <RecommendationSetting
          recommendationDetails={mockedRecommendationCRRM as EnhancedRecommendation}/>
      </Provider>,
      { route: { params } }
    )
    const configButton = screen.getByTestId('ConfigurationOutlined')
    expect(configButton).toBeVisible()
    await userEvent.click(configButton)

    expect(screen.getByText('Actions')).toBeInTheDocument()

    expect(screen.getByText('Mute Recommendation')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByText(/While this recommendation is muted, it will be hidden in the UI/))
      .toBeInTheDocument()
    expect(screen.getByText('AI-Driven RRM table'))
      .toBeInTheDocument()
    expect(screen.queryByText('Delete Recommendation')).not.toBeInTheDocument()
  })
  it('should mute and unmute recommendation correctly', async () => {
    mockUseMuteRecommendationMutation.mockImplementation(() => [() => ({
      unwrap: () => Promise.resolve({ toggleMute: { success: true, errorCode: '', errorMsg: '' } })
    })])
    render(
      <Provider><RecommendationSetting
        recommendationDetails={mockedRecommendationFirmware as EnhancedRecommendation}/>
      </Provider>,
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
  it('should handle mute error correctly', async () => {
    mockUseMuteRecommendationMutation.mockImplementation(() => [() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: false, errorCode: '1', errorMsg: 'error' } })
    })])
    render(
      <Provider><RecommendationSetting
        recommendationDetails={mockedRecommendationFirmware as EnhancedRecommendation}/>
      </Provider>,
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
  it('should handle delete recommendation correctly', async () => {
    mockUseDeleteRecommendationMutation.mockImplementation(() => [() => ({
      unwrap: () => Promise.resolve({ deleteRecommendation: {
        success: true, errorCode: '', errorMsg: '' } }) })])
    render(
      <Provider>
        <RecommendationSetting recommendationDetails={{
          ...mockedRecommendationCRRM, status: 'applyfailed' } as EnhancedRecommendation}/>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByTestId('ConfigurationOutlined'))
    await userEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'Recommendation was deleted successfully'
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/recommendations/crrm',
      hash: '',
      search: ''
    })
  })
  it('should handle delete error correctly', async () => {
    mockUseDeleteRecommendationMutation.mockImplementation(() => [() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: false, errorCode: '1', errorMsg: 'error' } })
    })])
    render(
      <Provider>
        <RecommendationSetting recommendationDetails={{
          ...mockedRecommendationCRRM, status: 'applyfailed' } as EnhancedRecommendation}/>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByTestId('ConfigurationOutlined'))
    await userEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'error'
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/recommendations/crrm',
      hash: '',
      search: ''
    })
  })
  it('should hide delete when Features.RECOMMENDATION_DELETE disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockUseDeleteRecommendationMutation.mockImplementation(() => [() => ({
      unwrap: () => Promise.resolve({
        setDeldeleteRecommendationeted: { success: false, errorCode: '1', errorMsg: 'error' } })
    })])
    render(
      <Provider>
        <RecommendationSetting recommendationDetails={{
          ...mockedRecommendationCRRM, status: 'applyfailed' } as EnhancedRecommendation}/>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByTestId('ConfigurationOutlined'))
    expect(screen.queryByText('Delete Recommendation')).not.toBeInTheDocument()
  })
})