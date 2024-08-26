import userEvent from '@testing-library/user-event'

import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { useIntentContext } from '../IntentContext'

import { mockedIZoneFirmwareUpgrade as mockedIntent } from './__tests__/fixtures'
import { kpis, IntentAIDetails, IntentAIForm }        from './IZoneFirmwareUpgrade'

jest.mock('../IntentContext')

describe('IntentAIDetails', () => {
  it('should render', async () => {
    jest.mocked(useIntentContext).mockReturnValue({ intent: mockedIntent, kpis })
    render(<IntentAIDetails />, {
      route: { params: { code: mockedIntent.code, recommendationId: mockedIntent.id } },
      wrapper: Provider
    })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Why this recommendation?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
})

describe('IntentAIForm', () => {
  it('should render when apply', async () => {
    jest.mocked(useIntentContext).mockReturnValue({ intent: mockedIntent, kpis })
    render(<IntentAIForm />, {
      route: { params: { code: mockedIntent.code, recommendationId: mockedIntent.id } },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the recommendation?')).length).toEqual(2)
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Yes, apply the recommendation' })
    await userEvent.click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Apply' }))
  })
  it('should render when not apply', async () => {
    jest.mocked(useIntentContext).mockReturnValue({ intent: mockedIntent, kpis })
    render(<IntentAIForm />, {
      route: { params: { code: mockedIntent.code, recommendationId: mockedIntent.id } },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the recommendation?')).length).toEqual(2)
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole('radio', { name: 'No, do not apply the recommendation' })
    await userEvent.click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Apply' }))
  })
})