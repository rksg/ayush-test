/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo, AdministrationUrlsInfo, Administrator, RolesEnum } from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { fakeMSPECAdmin } from '../../__tests__/fixtures'

import EditAdministratorDialog from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedEditAdmin = {
  id: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  email: 'dog1551@email.com',
  name: 'FisrtName 1551',
  lastName: 'LastName 1551',
  role: RolesEnum.PRIME_ADMIN,
  delegateToAllECs: true,
  detailLevel: 'debug',
  newEmail: ''
} as Administrator

const mockedCloseDialog = jest.fn()
const mockedUpdateMspEcAdminFn = jest.fn()
const mockedUpdateAdminFn = jest.fn()
describe('Edit administrator dialog component', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcAdmin.url,
        (req, res, ctx) => {
          return res(ctx.json(fakeMSPECAdmin))
        }
      ),
      rest.put(
        MspUrlsInfo.updateMspEcAdmin.url,
        (req, res, ctx) => {
          mockedUpdateMspEcAdminFn(req.body)
          return res(ctx.json({}))
        }
      ),
      rest.put(
        AdministrationUrlsInfo.updateAdmin.url,
        (req, res, ctx) => {
          mockedUpdateAdminFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should submit correctly', async () => {
    render(
      <Provider>
        <EditAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedEditAdmin}
          editNameOnly={false}
          isMspEc={false}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Name')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByText('OK'))
    await waitFor(() => {
      expect(mockedUpdateAdminFn).toBeCalledWith({
        email: 'c123@email.com',
        role: 'ADMIN',
        detailLevel: 'debug',
        delegateToAllECs: true
      })
    })
  })

  it('should MSP EC submit correctly', async () => {
    const mockedMSPECAdmin = { ...fakeMSPECAdmin } as Administrator

    render(
      <Provider>
        <EditAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedMSPECAdmin}
          editNameOnly={false}
          isMspEc={true}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Last Name')
    await userEvent.type(await screen.findByText('Last Name'), '{delete}EFG')
    await userEvent.click(await screen.findByText('OK'))
    await waitFor(() => {
      expect(mockedUpdateAdminFn).toBeCalledWith({
        email: 'c123@email.com',
        role: 'ADMIN',
        detailLevel: 'debug',
        delegateToAllECs: true
      })
    })

    await waitFor(() => {
      expect(mockedUpdateMspEcAdminFn).toBeCalledWith({
        email: 'aaa.chengi@gmail.com',
        user_name: 'aaa.cheng@gmail.com',
        first_name: 'Hey',
        last_name: 'ABEFG'
      })
    })
  })

  it('should not role clickable', async () => {
    render(
      <Provider>
        <EditAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedEditAdmin}
          editNameOnly={true}
          isMspEc={false}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

  })
})