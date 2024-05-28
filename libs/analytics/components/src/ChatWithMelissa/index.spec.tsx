/* eslint-disable testing-library/no-unnecessary-act */
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { act, fireEvent, render, screen } from '@acx-ui/test-utils'

import { ChatWithMelissa } from '.'

describe('ChatWithMelissa', () => {
  const route = {
    path: '/:page',
    params: { page: 'dashboard' },
    wrapRoutes: false
  }
  const originalFetch = global.fetch
  beforeEach(()=>{
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ summary: 'summary' })
      })
    )
  })
  afterEach(()=>{
    jest.clearAllMocks()
    global.fetch = originalFetch
  })
  it('renders properly when chatbot enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    await act(async ()=>{
      render(<ChatWithMelissa />, { route })
    })
    expect(screen.getByText('Ask Anything')).toBeVisible()
  })
  it('renders incident summary for recurring user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.spyOn(localStorage, 'getItem').mockReturnValue('true')
    await act(async ()=>{
      render(<ChatWithMelissa />, { route })
    })
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Discover which ones')).toBeVisible()
  })
  it('should show coming soon when chatbot enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    await act(async ()=>{
      render(<ChatWithMelissa />, { route })
    })
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Coming Soon')).toBeVisible()
  })
  it('should not set recurring user if incident summary disabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((key) => {
      // eslint-disable-next-line no-console
      console.log({ key })
      if(key === Features.RUCKUS_AI_INCIDENT_SUMMARY_TOGGLE) {
        return false
      }
      return true
    })
    await act(async ()=>{
      render(<ChatWithMelissa />, { route })
    })
    expect(screen.getByText('Ask Anything')).toBeVisible()
    fireEvent.click(await screen.findByRole('button'))
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('should handle error when incident summary call', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Some Error.'))
    )
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.spyOn(localStorage, 'getItem').mockReturnValue('true')
    await act(async ()=>{
      render(<ChatWithMelissa />, { route })
    })
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Discover which ones')).toBeVisible()
  })
})
