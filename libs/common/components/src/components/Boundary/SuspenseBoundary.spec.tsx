import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

import { SuspenseBoundary } from './SuspenseBoundary'

describe('SuspenseBoundary', () => {
  it('renders fallback until promise resolved', async () => {
    const LazyComponent = React.lazy(() => import('../../__mocks__/LazyComponent'))
    render(<SuspenseBoundary>
      <LazyComponent />
    </SuspenseBoundary>)

    const loader = screen.getByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()
    const element = await waitFor(() => screen.findByText('Lazy Component'))
    expect(element).toBeVisible()
  })
  it('renders custom fallback', async () => {
    const fallback = 'loading'
    const LazyComponent = React.lazy(() => import('../../__mocks__/LazyComponent'))
    render(<SuspenseBoundary fallback={fallback}>
      <LazyComponent />
    </SuspenseBoundary>)

    const loader = screen.getByText(fallback)
    expect(loader).toBeVisible()
    const element = await waitFor(() => screen.findByText('Lazy Component'))
    expect(element).toBeVisible()
  })
})
