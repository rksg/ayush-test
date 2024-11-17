import React from 'react'

import { render, fireEvent, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { RuckusAiStepsEnum } from '..'

import RuckusAiWizard from './index'

jest.mock('./Steps/SummaryStep', () => ({
  SummaryStep: () => <div>SummaryStep Component</div>
}))

jest.mock('./Steps/VlanStep', () => ({
  VlanStep: () => <div>VlanStep Component</div>
}))

jest.mock('./Steps/WlanDetailStep', () => ({
  WlanDetailStep: () => <div>WlanDetailStep Component</div>
}))

jest.mock('./Steps/WlanStep', () => ({
  WlanStep: () => <div>WlanStep Component</div>
}))


jest.mock('@acx-ui/rc/services', () => {
  const actualModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...actualModule,
    useUpdateConversationsMutation: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          sessionId: 'testSessionId',
          nextStep: 'testNextStep',
          description: 'testDescription',
          payload: {}
        })
      }))
    ],
    useApplyConversationsMutation: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          sessionId: 'testSessionId',
          nextStep: 'testNextStep',
          description: 'testDescription',
          payload: {}
        })
      }))
    ]
  }
})


describe('RuckusAiWizard', () => {
  const defaultProps = {
    sessionId: 'test-session-id',
    requestId: 'test-request-id',
    actionType: 'test-action-type',
    description: 'test-description',
    payload: 'test-payload',
    currentStep: 0,
    step: RuckusAiStepsEnum.BASIC,
    setCurrentStep: jest.fn(),
    setStep: jest.fn(),
    setConfigResponse: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component and navigates through steps', async () => {
    render(
      <IntlProvider locale='en'>
        <RuckusAiWizard {...defaultProps} />
      </IntlProvider>)

    expect(screen.getByText('WlanStep Component')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText('WlanStep Component')).toBeInTheDocument() //TODO

    fireEvent.click(screen.getByRole('button', { name: /Back/i }))

    expect(screen.getByText('WlanStep Component')).toBeInTheDocument()
  })

})
