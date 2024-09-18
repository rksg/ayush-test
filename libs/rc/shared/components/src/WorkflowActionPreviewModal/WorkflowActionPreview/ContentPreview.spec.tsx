import React from 'react'

import { render, screen } from '@acx-ui/test-utils'

import { ContentPreview } from './ContentPreview'

jest.mock('./StepNavigation', () => ({
  StepNavigation: () => <div data-testid={'mockedStepNavigation'}/>
}))

describe('ContentPreview', () => {
  const mockedTitle = <div data-testid={'mockedTitle'}>MockedTitle</div>
  const mockedBody = <div data-testid={'mockedBody'}>MockedBody</div>

  it('should render content correctly', () => {
    render(<ContentPreview
      title={mockedTitle}
      body={mockedBody}
    />)

    expect(screen.getByTestId('mockedTitle')).toBeInTheDocument()
    expect(screen.getByTestId('mockedBody')).toBeInTheDocument()
    expect(screen.getByTestId('mockedStepNavigation')).toBeInTheDocument()
  })

  it('should not render navigation while hideNavigation is true', () => {
    render(<ContentPreview
      hideNavigation={true}
      title={mockedTitle}
      body={mockedBody}
    />)

    expect(screen.queryByTestId('mockedStepNavigation')).not.toBeInTheDocument()
  })
})
