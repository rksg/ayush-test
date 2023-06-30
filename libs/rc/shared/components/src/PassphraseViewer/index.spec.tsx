import userEvent from '@testing-library/user-event'

import { screen, render } from '@acx-ui/test-utils'

import { PassphraseViewer } from '.'
describe('PassphraseViewer', () => {
  it('should render correctly', async () => {
    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })

    render(<PassphraseViewer passphrase={'test1234'} />)

    await userEvent.click(await screen.findByTestId('EyeOpenSolid'))
    expect(await screen.findByDisplayValue('test1234')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button'))
    expect(await screen.findByRole('tooltip', { name: /Passphrase Copied/ } )).toBeInTheDocument()

    expect(copyFn).toHaveBeenCalledWith('test1234')
  })
})
