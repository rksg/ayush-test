
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { loadImageWithJWT } from '@acx-ui/utils'

import {
  portalListWithPhoto
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import PortalInstance from '.'
jest.mock('@acx-ui/utils')
const mockedData = loadImageWithJWT as jest.MockedFunction<typeof loadImageWithJWT>
describe.skip('Portal Instance Page', () => {
  beforeEach(async () => {
    mockedData.mockReturnValue(Promise.resolve('testId'))
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ content: portalListWithPhoto }))
      ),
      rest.post(
        PortalUrlsInfo.getPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (req, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  it('should render instance page', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {
          facebook: {}, google: {}, twitter: {}, linkedin: {} } }, portalServiceProfileId: '2' }
    }}><Form><PortalInstance />
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test2'))[0])
  })
})
