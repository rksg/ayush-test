/* eslint-disable testing-library/no-unnecessary-act */
import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
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
