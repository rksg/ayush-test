import React from 'react'

import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { IntlProvider }                       from 'react-intl'

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
          hasChanged: true,
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


  it('renders the component without crashing', () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps} />
    </IntlProvider>)
    expect(screen.getByText(/Back/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
  })


  it('calls setCurrentStep when "Back" is clicked', () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps}
        currentStep={1} />
    </IntlProvider>)
    const backButton = screen.getByText(/Back/i)

    fireEvent.click(backButton)
    expect(defaultProps.setCurrentStep).toHaveBeenCalledTimes(1)
  })

  it('calls setStep when "Back" is clicked and currentStep is 0', () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps}
        currentStep={0} />
    </IntlProvider>)
    const backButton = screen.getByText(/Back/i)

    fireEvent.click(backButton)
    expect(defaultProps.setStep).toHaveBeenCalledTimes(1)
  })

  it('submits the form and calls handleOnFinish and clicks Remain Unchanged', async () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps} />
    </IntlProvider>)
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    const unchangedButton = await screen.findByText(/Remain Unchanged/i)
    expect(unchangedButton).toBeInTheDocument()
    fireEvent.click(unchangedButton)

    await waitFor(() => {
      expect(defaultProps.setCurrentStep).toHaveBeenCalledTimes(1)
    })
  })

  it('submits the form and calls handleOnFinish and clicks Regenerate', async () => {
    const mockUnwrap = jest.fn()
      .mockResolvedValueOnce({
        sessionId: 'testSessionId',
        nextStep: 'testNextStep',
        description: 'testDescription',
        hasChanged: true,
        payload: {}
      })
      .mockResolvedValueOnce({
        sessionId: 'testSessionId',
        nextStep: 'newTestNextStep',
        description: 'newTestDescription',
        hasChanged: false,
        payload: {}
      })

    const mockUpdateConversations = jest.fn(() => ({
      unwrap: mockUnwrap
    }))

    jest.mock('@acx-ui/rc/services', () => ({
      useUpdateConversationsMutation: () => [mockUpdateConversations]
    }))

    render(
      <IntlProvider locale='en'>
        <RuckusAiWizard {...defaultProps} />
      </IntlProvider>
    )

    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    const regenerateButton = await screen.findByRole('button', { name: /Regenerate/i })
    expect(regenerateButton).toBeInTheDocument()
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      expect(defaultProps.setCurrentStep).toHaveBeenCalledTimes(1)
    })
  })

  it('displays the correct button label on the last step', async () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps} currentStep={3} />
    </IntlProvider>)
    expect(screen.getByText(/Apply/i)).toBeInTheDocument()

    const applyButton = screen.getByText(/Apply/i)
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(defaultProps.setStep).toHaveBeenCalledTimes(1)
    })

  })

  it('shows "Skip this step" when the step supports skipping', async () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps} currentStep={2} />
    </IntlProvider>)
    expect(screen.getByText(/Skip this step/i)).toBeInTheDocument()
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    const unchangedButton = await screen.findByText(/Remain Unchanged/i)
    expect(unchangedButton).toBeInTheDocument()
    fireEvent.click(unchangedButton)

    await waitFor(() => {
      expect(defaultProps.setCurrentStep).toHaveBeenCalledTimes(1)
    })

  })

  it('clicks "Skip this step" when the step supports skipping', async () => {
    render(<IntlProvider locale='en'>
      <RuckusAiWizard {...defaultProps} currentStep={2} />
    </IntlProvider>)

    expect(screen.getByText(/Skip this step/i)).toBeInTheDocument()
    const skipButton = screen.getByText(/Skip this step/i)
    fireEvent.click(skipButton)

    const unchangedButton = await screen.findByText(/Remain Unchanged/i)
    expect(unchangedButton).toBeInTheDocument()
    fireEvent.click(unchangedButton)

    await waitFor(() => {
      expect(defaultProps.setCurrentStep).toHaveBeenCalledTimes(1)
    })

  })

})
