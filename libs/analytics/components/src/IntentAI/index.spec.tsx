import React from 'react'

import { render } from '@testing-library/react'

import { defaultNetworkPath } from '@acx-ui/analytics/utils'
import { DateRange }          from '@acx-ui/utils'

import { IntentAIDetails, IntentAIForm, IntentAITabContent, IntentAIWidget } from '.'

describe('Lazy-Loaded Components', () => {
  it('should render IntentAIDetails correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <IntentAIDetails />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render IntentAIForm correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <IntentAIForm />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render IntentAITabContent correctly', async () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <IntentAITabContent />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render IntentAIWidget correctly', async () => {
    const mockPathFilter = {
      startDate: '2022-01-01T00:00:00+08:00',
      endDate: '2022-01-02T00:00:00+08:00',
      range: DateRange.last24Hours,
      path: defaultNetworkPath
    }
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <IntentAIWidget pathFilters={mockPathFilter} />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
})
