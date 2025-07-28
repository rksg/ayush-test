import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IntlProvider }              from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'

import RuckusAiButton from '.'


jest.mock('../AICanvas', () => () => <div>AICanvas</div>)
jest.mock('../OnboardingAssistant', () => () => <div>OnboardingAssistant</div>)

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

  it('renders the button and opens Onboarding Assistant modal on click', () => {
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('OnboardingAssistant')).toBeInTheDocument()
  })

  it('renders the button and opens DSE modal on click', () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CANVAS || ff === Features.CANVAS_Q3)
    renderWithIntl(
      <Provider>
        <RuckusAiButton />
      </Provider>
    )

    const button = screen.getByTestId('RuckusAiDog')
    fireEvent.click(button)

    expect(screen.getByText('AICanvas')).toBeInTheDocument()
  })
})
