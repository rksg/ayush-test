import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { FrontViewTooltip } from './FrontViewTooltip'

const params = { tenantId: 'tenantId' }
describe('FrontViewTooltip', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <FrontViewTooltip />
    </Provider>, { route: { params } })
    const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(icon).toBeVisible()
    await userEvent.hover(icon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('Switch is not operational')
  })

})