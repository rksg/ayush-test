
import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'

import { render, screen, waitFor, within } from '@acx-ui/test-utils'

import { availableVersions } from '../__tests__/fixtures'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'

const mockedCancelFn = jest.fn()
const mockedSubmitFn = jest.fn()

describe('Edge firmware update now dialog', () => {

  it('should render successfully', async () => {
    render(
      <ChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )

    expect(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023 09:16 AM' }
    )).toBeVisible()
    expect(screen.getByRole('textbox')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  it('should cancel successfully', async () => {
    render(
      <ChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedCancelFn).toBeCalledTimes(1))
  })

  it.skip('should submit successfully', async () => {
    render(
      <ChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )

    const nowDateStr = moment().add(2, 'days').format('YYYY-MM-DD')
    const nowDayStr = nowDateStr.split('-')[2]
    await userEvent.click(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023 09:16 AM' }
    ))
    await userEvent.click(screen.getByPlaceholderText('Select date'))
    const cell = await screen.findByRole('cell', { name: new RegExp(nowDateStr) })
    await userEvent.click(within(cell).getByText(new RegExp(nowDayStr)))
    await userEvent.click(await screen.findByRole('radio', { name: /12 am \- 02 am/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mockedSubmitFn).toBeCalledTimes(1))
  })

})