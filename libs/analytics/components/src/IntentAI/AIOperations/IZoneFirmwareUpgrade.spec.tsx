import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { useIntentContext } from '../IntentContext'
import { Statuses }         from '../states'
import { Intent }           from '../useIntentDetailsQuery'

import { mocked }                                             from './__tests__/mockedIZoneFirmwareUpgrade'
import { configuration, kpis, IntentAIDetails, IntentAIForm } from './IZoneFirmwareUpgrade'

jest.mock('../IntentContext')

const mockIntentContextWith = (data: Partial<Intent> = {}) => {
  let intent = mocked
  intent = _.merge({}, intent, data) as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, configuration, kpis })
  return {
    params: { code: mocked.code, root: mocked.root, sliceId: mocked.sliceId }
  }
}

describe('IntentAIDetails', () => {
  it('should handle when status is paused/na', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.paused })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('When activated, this AIOps Intent takes over the automatic upgrade of Zone firmware in the network.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    expect(await screen.findByTestId('KPI')).toBeVisible()
    expect(await screen.findByTestId('Why is this intent?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
  it('should show different tooltip based on return value of compareVersion', async () => {
    const { params } = mockIntentContextWith({ currentValue: '7.0.0' })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    await userEvent.hover(await screen.findByTestId('InformationSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('Zone was upgraded manually to recommended AP firmware version. Manually check whether this intent is still valid.')
  })
  it('should render', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Venue: weiguo-mesh is running with older AP firmware version . It is recommended to upgrade zone to the latest available AP firmware version.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    expect(await screen.findByTestId('KPI')).toBeVisible()
    expect(await screen.findByTestId('Why is this intent?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()

    await userEvent.hover(await screen.findByTestId('InformationSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('Latest available AP firmware version will be used when this intent is applied.')
  })
})

describe('IntentAIForm', () => {
  it('should render when apply', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the intent?')).length).toEqual(2)
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Yes, apply the intent' })
    await userEvent.click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(await screen.findByText('Recommended Configuration: 7.0.0')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Apply' }))
  })
  it('should render when not apply', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the intent?')).length).toEqual(2)
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole('radio', { name: 'No, do not apply the intent' })
    await userEvent.click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(await screen.findByText('Recommended Configuration: 7.0.0')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Apply' }))
  })
})