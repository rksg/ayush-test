import userEvent from '@testing-library/user-event'

import { EdgeFirmwareFixtures }    from '@acx-ui/rc/utils'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { EdgeUpdateNowDialog } from '.'

const { mockAvailableVersions } = EdgeFirmwareFixtures
const mockedCancelFn = jest.fn()
const mockedSubmitFn = jest.fn()

describe('Edge firmware update now dialog', () => {

  it('should render successfully', async () => {
    render(
      <EdgeUpdateNowDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={mockAvailableVersions}
        visible
      />
    )

    expect(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023' }
    )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Run Update' })).toBeVisible()
  })

  it('should cancel successfully', async () => {
    render(
      <EdgeUpdateNowDialog
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
      <EdgeUpdateNowDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={mockAvailableVersions}
        visible
      />
    )

    await userEvent.click(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023' }
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Run Update' }))
    await waitFor(() => expect(mockedSubmitFn).toBeCalledTimes(1))
  })

})