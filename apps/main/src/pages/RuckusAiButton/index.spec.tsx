import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent                     from '@testing-library/user-event'
import { IntlProvider }              from 'react-intl'

import { Provider } from '@acx-ui/store'

import RuckusAiButton from '.'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'


jest.mock('./BasicInformationPage', () => () => <div>BasicInformationPage Component</div>)
jest.mock('./Congratulations', () => () => <div>Congratulations Component</div>)
jest.mock('./VerticalPage', () => () => <div>VerticalPage Component</div>)
jest.mock('./WelcomePage', () => () => <div>WelcomePage Component</div>)
jest.mock('./RuckusAiWizard', () => {
  return (props: { setStep: (step: string) => void }) => {
    const { setStep } = props
    return (
      <div>
        <h2>RuckusAiWizard Component</h2>
        <button onClick={() => setStep('FINISHED')}>Finish Configuration</button>
      </div>
    )
  }
})

jest.mock('@acx-ui/rc/services', () => {
  const actualModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...actualModule,
    useStartConversationsMutation: () => [
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

jest.mock('@acx-ui/react-router-dom', () => ({
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))


describe('RuckusAiButton', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderWithIntl = (component: JSX.Element) => {
    return render(
      <IntlProvider locale='en'>
        {component}
      </IntlProvider>
    )
  }

  it('renders the button and opens modal on click', () => {
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('WelcomePage Component')).toBeInTheDocument()
  })

  it('navigates through steps and validates form actions', async () => {
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const startButton = screen.getByRole('button', { name: 'Start' })
    fireEvent.click(startButton)
    await screen.findByText('VerticalPage Component')

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    await screen.findByText('BasicInformationPage Component')

    await userEvent.click(nextButton)
    await screen.findByText('RuckusAiWizard Component')
  })

  it('displays Congratulations page on finishing', async () => {
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const startButton = screen.getByRole('button', { name: 'Start' })
    fireEvent.click(startButton)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    await screen.findByText('VerticalPage Component')

    fireEvent.click(nextButton)
    await screen.findByText('BasicInformationPage Component')

    await userEvent.click(nextButton)
    await screen.findByText('RuckusAiWizard Component')

    fireEvent.click(screen.getByText('Finish Configuration'))
    await screen.findByText('Congratulations Component')

  })

  it('closes modal on Finish button click', async () => {
    renderWithIntl(<Provider>
      <RuckusAiButton />
    </Provider>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const startButton = screen.getByRole('button', { name: 'Start' })
    fireEvent.click(startButton)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    await screen.findByText('VerticalPage Component')

    fireEvent.click(nextButton)
    await screen.findByText('BasicInformationPage Component')

    await userEvent.click(nextButton)
    await screen.findByText('RuckusAiWizard Component')
    fireEvent.click(screen.getByText('Finish Configuration'))

    await screen.findByText('Congratulations Component')
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('renders the new welcome page', () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CANVAS)
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )
 
    const button = screen.getByTestId('RuckusAiDog')
    fireEvent.click(button)

    expect(screen.getByText('AI-Powered by')).toBeInTheDocument()
    expect(screen.getByText('WelcomePage Component')).toBeInTheDocument()
  })
})
