
import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import { availableVersions } from '../__tests__/fixtures'

import { UpdateNowDialog } from './UpdateNowDialog'

const mockedCancelFn = jest.fn()
const mockedSubmitFn = jest.fn()

describe('Edge firmware update now dialog', () => {

  it('should render successfully', async () => {
    render(
      <UpdateNowDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )

    expect(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023 09:16 AM' }
    )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Run Update' })).toBeVisible()
  })

  it('should cancel successfully', async () => {
    render(
      <UpdateNowDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedCancelFn).toBeCalledTimes(1))
  })

  it('should submit successfully', async () => {
    render(
      <UpdateNowDialog
        onCancel={mockedCancelFn}
        onSubmit={mockedSubmitFn}
        availableVersions={availableVersions}
        visible
      />
    )

    await userEvent.click(await screen.findByRole('radio',
      { name: '1.0.0.1710 (Release - Recommended) - 02/23/2023 09:16 AM' }
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Run Update' }))
    await waitFor(() => expect(mockedSubmitFn).toBeCalledTimes(1))
  })

})