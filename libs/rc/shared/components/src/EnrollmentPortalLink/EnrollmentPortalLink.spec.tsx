import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EnrollmentPortalLink } from '.'





describe('Enrollment Portal Link', () => {
  it('should render correctly', async () => {
    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })
    render(<Provider>
      <EnrollmentPortalLink url='test'/>
    </Provider>)

    await screen.findByRole('link', { name: 'test' })
    await userEvent.click(await screen.findByRole('button'))
    expect(await screen.findByRole('tooltip', { name: /URL Copied/ } )).toBeInTheDocument()
    expect(copyFn).toHaveBeenCalledWith('test')
  })
})
