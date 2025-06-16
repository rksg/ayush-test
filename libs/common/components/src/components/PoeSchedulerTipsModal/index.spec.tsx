import { render, screen } from '@acx-ui/test-utils'

import { PoeSchedulerTipsModal } from '.'

describe('ScheduleTipsModal', () => {
  it('should render correct', async () => {
    render(<PoeSchedulerTipsModal isModalOpen={true} onOK={() => {}} />)

    expect(await screen.findByRole('dialog')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can customize the PoE schedule using the following options:')).toBeVisible()
  })
})