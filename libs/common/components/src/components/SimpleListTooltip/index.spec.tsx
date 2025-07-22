
import userEvent from '@testing-library/user-event'

import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SimpleListTooltip } from '.'

describe('SimpleListTooltip', () => {
  it('should render correctly', async () => {
    const { rerender } = render(
      <SimpleListTooltip items={['v1', 'v2', 'v3']} displayText={2} maximum={2} />
    )

    const content = await screen.findByText('2')
    expect(content).toBeVisible()

    await userEvent.hover(content)

    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('v2')

    expect(await screen.findByRole('tooltip', { hidden: true }))
      .not.toHaveTextContent('v3')

    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('And 1 More')

    rerender(
      <SimpleListTooltip items={['v1']} displayText={2} maximum={2} title={'Hello'} />
    )
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('Hello')
  })
})
