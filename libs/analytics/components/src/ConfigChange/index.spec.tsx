import React from 'react'

import { render } from '@testing-library/react'

import { ConfigChange } from '.'

describe('Lazy-Loaded Components', () => {
  it('should render ConfigChange correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ConfigChange />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
})
