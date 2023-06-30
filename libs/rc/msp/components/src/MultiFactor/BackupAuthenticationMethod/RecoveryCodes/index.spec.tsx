/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

// import { MFAStatus } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { fakeRecoveryCodes } from '../../__tests__/fixtures'

import { RecoveryCodes } from '.'
const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedNavigatorWriteText = jest.fn()
const mockedCloseDrawer = jest.fn()
describe('Recovery Codes Drawer', () => {
  Object.assign(window.navigator, {
    clipboard: {
      writeText: mockedNavigatorWriteText
    }
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <RecoveryCodes
          visible={true}
          setVisible={mockedCloseDrawer}
          recoveryCode={fakeRecoveryCodes}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Recovery Codes')
    const copyBtn = await screen.findByText( 'Copy Codes' )
    fireEvent.click(copyBtn)
    expect(mockedNavigatorWriteText).toBeCalledWith('123456\n287600\n230200\n791660\n169111')
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })
})