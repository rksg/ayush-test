
import userEvent from '@testing-library/user-event'

import { ActionType }     from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import ActionCard from './ActionCard'


describe('ActionCard', () => {
  const spyOnClickFn = jest.fn()

  beforeEach(() => {
    spyOnClickFn.mockClear()
  })

  it('Should render Action Card correctly', async () => {
    render(
      <ActionCard
        actionType={ActionType.AUP}
        handleClick={spyOnClickFn}
      />
    )

    const expectedIcon = screen.getByTestId('AupActionTypeIcon')
    expect(expectedIcon).toBeVisible()
    await userEvent.click(expectedIcon)
    expect(spyOnClickFn).toHaveBeenCalledTimes(1)
  })

  it('Should render Action Card with disable state correctly', async () => {

    render(<ActionCard
      actionType={ActionType.DISPLAY_MESSAGE}
      handleClick={spyOnClickFn}
      disabled={true}
    />)

    const expectedIcon = screen.getByTestId('DisplayMessageActionTypeIcon')
    expect(expectedIcon).toBeVisible()
    expect(await screen.findByRole('button', { name: /Add/i })).toBeDisabled()
    await userEvent.click(expectedIcon)
    expect(spyOnClickFn).toHaveBeenCalledTimes(0)
  })
})
