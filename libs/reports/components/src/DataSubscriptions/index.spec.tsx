import React from 'react'

import { render } from '@testing-library/react'

import {
  DataSubscriptionsAuditLog,
  DataSubscriptionsContent,
  DataSubscriptionsForm,
  DataSubscriptionsCloudStorage
} from '.'

describe('Lazy-Loaded DataSubscriptions Components', () => {
  it('should render DataSubscriptionsAuditLog correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsAuditLog />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataSubscriptionsContent correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsContent />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataSubscriptionsForm correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsForm />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
  it('should render DataSubscriptionsCloudStorage correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsCloudStorage />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

})