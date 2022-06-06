import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Loader } from '.'

describe('Loader', () => {
  beforeAll(() => jest
    .spyOn(console, 'error')
    .mockImplementation(() => {}))
  afterAll(() => jest.resetAllMocks())

  it('renders children if no states given', async () => {
    render(<Loader>
      <div data-testid='target'>OK</div>
    </Loader>)
    expect(screen.getByTestId('target')).toBeVisible()
  })
  it('renders fallback but not children when isLoading=true', async () => {
    const states = [{ isLoading: true }]
    render(<Loader states={states}>
      <div data-testid='target'>OK</div>
    </Loader>)

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByTestId('target')).toBeNull()
  })
  it('renders fallback & children when isFetching=true', async () => {
    const states = [{ isLoading: false, isFetching: true }]
    render(<Loader states={states}>
      <div data-testid='target'>OK</div>
    </Loader>)

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.getByTestId('target')).toBeVisible()
  })
  it('renders error when error is not null', async () => {
    const states = [{ isLoading: false, error: { message: 'Error' } }]
    const { baseElement } = render(<Loader states={states}>
      <div data-testid='target'>OK</div>
    </Loader>)

    expect(baseElement).toHaveTextContent('Something went wrong')
    expect(baseElement).toHaveTextContent('{"message":"Error"}')
  })
  it('renders fallback for error', async () => {
    const fallback = 'Error!!!'
    const states = [{ isLoading: false, error: { message: 'Error' } }]
    const { baseElement } = render(<Loader states={states} errorFallback={fallback}>
      <div data-testid='target'>OK</div>
    </Loader>)

    expect(baseElement).toHaveTextContent(fallback)
  })
})
