/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                           from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, Administrator } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
  // within
} from '@acx-ui/test-utils'
import { DetailLevel } from '@acx-ui/user'

import { fakedAdminLsit, fakeMSPECAdminList, fakeMSPECAdmin, fakedPrivilegeGroupList } from '../__tests__/fixtures'

import EditUserDrawer from './EditUserDrawer'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedEditAdmin = {
  ...fakedAdminLsit[0],
  newEmail: ''
} as Administrator

const mockedCloseDialog = jest.fn()
const mockedUpdateMspEcAdminFn = jest.fn()
const mockedUpdateAdminFn = jest.fn()
const mockReqAdminsData = jest.fn()
const services = require('@acx-ui/rc/services')

describe('Edit user drawer component', () => {
  beforeEach(() => {
    mockReqAdminsData.mockReset()
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      mockReqAdminsData()
      return { data: fakedPrivilegeGroupList }
    })
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
        <EditUserDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedEditAdmin}
          editNameOnly={false}
          isMspEc={false}
          currentUserDetailLevel={DetailLevel.DEBUGGING}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Name')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Privilege Group' }))
    await userEvent.click(await screen.findByText( 'wi-fi privilege group' ))
    await userEvent.click(await screen.findByText('Apply'))
    await waitFor(() => {
      expect(mockedUpdateAdminFn).toBeCalledWith({
        ...mockedEditAdmin,
        role: 'wi-fi privilege group',
        detailLevel: 'debug'
      })
    })
  })

  it('should not role clickable', async () => {
    render(
      <Provider>
        <EditUserDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedEditAdmin}
          editNameOnly={true}
          isMspEc={false}
          currentUserDetailLevel={DetailLevel.DEBUGGING}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Privilege Group')
    expect(await screen.findByRole('combobox', { name: 'Privilege Group' })).toBeDisabled()
  })

  it('should MSP EC submit correctly', async () => {
    const mockedMSPECAdmin = { ...fakeMSPECAdminList[1], newEmail: '' } as Administrator

    render(
      <Provider>
        <EditUserDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedMSPECAdmin}
          editNameOnly={false}
          isMspEc={true}
          currentUserDetailLevel={DetailLevel.DEBUGGING}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Last Name')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Last Name' }), '{backspace}EFG')
    await userEvent.click(await screen.findByText('Apply'))
    await waitFor(() => {
      expect(mockedUpdateAdminFn).toBeCalledWith({
        ...mockedMSPECAdmin,
        role: 'PRIME_ADMIN',
        detailLevel: 'debug'
      })
    })

    await waitFor(() => {
      expect(mockedUpdateMspEcAdminFn).toBeCalledWith({
        email: 'aaa.chengi@gmail.com',
        user_name: 'aaa.cheng@gmail.com',
        first_name: 'Hi',
        last_name: 'ABEFG'
      })
    })
  })

  it('should correctly display error message', async () => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateAdmin.url,
        (req, res, ctx) => {
          mockedUpdateAdminFn(req.body)
          return res(ctx.status(400), ctx.json({}))
        }
      )
    )
    const mockedMSPECAdmin = { ...fakeMSPECAdminList[1], newEmail: '' } as Administrator

    render(
      <Provider>
        <EditUserDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedMSPECAdmin}
          editNameOnly={false}
          isMspEc={true}
          currentUserDetailLevel={DetailLevel.DEBUGGING}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Last Name')
    await userEvent.click(await screen.findByText('Apply'))
    // TODO
    // await waitFor(async () => {
    //   expect(await screen.findByText('Update User Failed')).toBeVisible()
    // })
    // const errorDialog = await (await screen.findAllByRole('dialog'))
    //   .filter(o => o.classList.contains('ant-modal-confirm-error'))[0]
    // await userEvent.click(await within(errorDialog).findByText('OK'))
  })

  it('should correctly display update name error message', async () => {
    mockServer.use(
      rest.put(
        MspUrlsInfo.updateMspEcAdmin.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({}))
        }
      )
    )
    const mockedMSPECAdmin = { ...fakeMSPECAdminList[1], newEmail: '' } as Administrator

    render(
      <Provider>
        <EditUserDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          editData={mockedMSPECAdmin}
          editNameOnly={false}
          isMspEc={true}
          currentUserDetailLevel={DetailLevel.DEBUGGING}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Last Name')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Last Name' }), '{backspace}EFG')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    // TODO
    // await waitFor(async () => {
    //   expect(await screen.findByText('Update User Name Failed')).toBeVisible()
    // })
  })
})
