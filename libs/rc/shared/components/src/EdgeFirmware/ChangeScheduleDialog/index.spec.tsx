
import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'

import { EdgeFirmwareFixtures }            from '@acx-ui/rc/utils'
import { render, screen, waitFor, within } from '@acx-ui/test-utils'

import { EdgeChangeScheduleDialog } from './'

const { mockAvailableVersions } = EdgeFirmwareFixtures
const mockedCancelFn = jest.fn()
const mockedSubmitFn = jest.fn()

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-20T12:33:37.101+00:00').getTime()
})

describe('Edge firmware schedule update dialog', () => {

  it('should render successfully', async () => {
    render(
      <EdgeChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={mockAvailableVersions}
        visible
      />
    )

    expect(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023' }
    )).toBeVisible()
    expect(screen.getByRole('textbox')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  it('should cancel successfully', async () => {
    render(
      <EdgeChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={mockAvailableVersions}
        visible
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedCancelFn).toBeCalledTimes(1))
  })

  it('should submit successfully', async () => {
    render(
      <EdgeChangeScheduleDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={mockAvailableVersions}
        visible
      />
    )

    const nowDateStr = moment().add(2, 'days').format('YYYY-MM-DD')
    const nowDayStr = nowDateStr.split('-')[2]
    await userEvent.click(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023' }
    ))
    await userEvent.click(screen.getByPlaceholderText('Select date'))
    const cell = await screen.findByRole('cell', { name: new RegExp(nowDateStr) })
    await userEvent.click(within(cell).getByText(new RegExp(nowDayStr)))
    await userEvent.click(await screen.findByRole('radio', { name: /12 am \- 02 am/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mockedSubmitFn).toBeCalledTimes(1))
  })

})