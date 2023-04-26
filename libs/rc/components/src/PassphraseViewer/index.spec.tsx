import userEvent from '@testing-library/user-event'

import { screen, render } from '@acx-ui/test-utils'

import { PassphraseViewer } from '.'
describe('PassphraseViewer', () => {
  it('should render correctly', async () => {
    render(<PassphraseViewer passphrase={'test1234'} />)

    await userEvent.click(await screen.findByRole('img', { name: /eye-invisible/ }))
    const passwordElem = await screen.findByDisplayValue('test1234')
    expect(passwordElem).toBeInTheDocument()
  })
})
