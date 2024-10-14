
import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { BasicTipsModal } from './stories'

describe('ScheduleTipsModal', () => {
  it('should render correct', async () => {
    render(<BasicTipsModal />)

    await userEvent.click(await screen.findByText('Open'))
    expect(await screen.findByRole('dialog')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can set custom schedule using the following options:')).toBeVisible()
    await userEvent.click(await screen.findByText('OK'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})