/* eslint-disable no-unreachable, no-throw-literal */
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { ErrorBoundary } from './ErrorBoundary'

describe('ErrorBoundary', () => {
  beforeAll(() => jest
    .spyOn(console, 'error')
    .mockImplementation(() => {}))
  afterAll(() => jest.resetAllMocks())

  it('renders children if no error', () => {
    render (<ErrorBoundary>
      <div data-testid='target'>OK</div>
    </ErrorBoundary>)

    const target = screen.getByTestId('target')
    expect(target).toHaveTextContent('OK')
  })
  it('contain error thrown', async () => {
    const { baseElement } = render(<ErrorBoundary>
      <ErrorThrowingComponent />
    </ErrorBoundary>)
    expect(baseElement).toHaveTextContent('Something went wrong')
    expect(baseElement).toHaveTextContent('{"message":"Error"}')
  })
  it('renders fallback', () => {
    const fallback = 'Custom Error Message'
    const { baseElement } = render(<ErrorBoundary fallback={fallback}>
      <ErrorThrowingComponent />
    </ErrorBoundary>)
    expect(baseElement).toHaveTextContent(fallback)
  })
})

function ErrorThrowingComponent () {
  throw { message: 'Error' }
  return <div />
}
