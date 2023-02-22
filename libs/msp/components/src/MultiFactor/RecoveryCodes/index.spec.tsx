/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { MFAStatus } from '@acx-ui/rc/utils'
import { Provider }  from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { RecoveryCodes } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

export const fakeMFATenantDetail = {
  tenantStatus: MFAStatus.DISABLED,
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
}

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
          recoveryCode={fakeMFATenantDetail.recoveryCodes}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Recovery Codes')
    const copyBtn = await screen.findByText( 'Copy Codes' )
    fireEvent.click(copyBtn)
    expect(mockedNavigatorWriteText).toBeCalledWith('678490\n287605\n230202\n791760\n169187')
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })
})