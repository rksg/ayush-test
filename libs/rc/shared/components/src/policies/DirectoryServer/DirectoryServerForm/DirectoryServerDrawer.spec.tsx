import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { directoryServerApi }                              from '@acx-ui/rc/services'
import { DirectoryServerProfileEnum, DirectoryServerUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor }             from '@acx-ui/test-utils'

import {  mockDirectoryServerTable } from './__tests__/fixtures'
import DirectoryServerDrawer         from './DirectoryServerDrawer'


const createViewPath = '/:tenantId/t/policies/directoryServer/create'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: 'a5ac9a7a3be54dba9c8741c67d1c41fa'
}


describe('DirectoryServerDrawer', () => {
  const user = userEvent.setup()
  const mockedCallBack = jest.fn()
  const mockedSetVisible = jest.fn()
  describe('AddDirectoryServerDrawer', () => {
    const addFn = jest.fn()
    beforeEach(() => {
      addFn.mockClear()
      mockedCallBack.mockClear()
      mockedSetVisible.mockClear()
      store.dispatch(directoryServerApi.util.resetApiState())
      mockServer.use(
        rest.post(
          DirectoryServerUrls.createDirectoryServer.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.json({ response: { id: 'createDirectoryServer' } }))
          }
        ),
        rest.post(
          DirectoryServerUrls.getDirectoryServerViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockDirectoryServerTable.data))
        )
      )
    })

    afterEach(() => {
      Modal.destroyAll()
    })

    it('should create DirectoryServer successfully', async () => {
      render(
        <Provider>
          <DirectoryServerDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )

      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'createDirectoryServer')
      const host = await screen.findByLabelText(/FQDN or IP Address/i)
      await user.type(host, 'ldap.test.com')
      const windowsDomainName = await screen.findByLabelText(/Windows Domain Name/i)
      await user.type(windowsDomainName, 'ou=mathematicians,dc=example,dc=com')
      const adminDomainName = await screen.findByLabelText(/Admin Domain Name/i)
      await user.type(adminDomainName, 'cn=read-only-admin,dc=example,dc=com')
      const adminPassword = await screen.findByLabelText(/Admin Password/i)
      await user.type(adminPassword, 'password')

      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(addFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(addFn).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'createDirectoryServer',
            type: DirectoryServerProfileEnum.AD,
            tlsEnabled: true,
            host: 'ldap.test.com',
            port: 636,
            domainName: 'ou=mathematicians,dc=example,dc=com',
            adminDomainName: 'cn=read-only-admin,dc=example,dc=com',
            adminPassword: 'password'
          })
        )
      })
      await waitFor(() => expect(mockedCallBack).toBeCalledTimes(1))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })

    it('should click cancel button and close drawer', async () => {
      render(
        <Provider>
          <DirectoryServerDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })

    it('should correctly display create error message', async () => {
      const spyLog = jest.spyOn(console, 'log')
      const createFn = jest.fn()
      mockServer.use(
        rest.post(
          DirectoryServerUrls.createDirectoryServer.url,
          (_, res, ctx) => {
            createFn()
            return res(ctx.status(404), ctx.json({}))
          }
        ),
        rest.post(
          DirectoryServerUrls.getDirectoryServerViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockDirectoryServerTable.data))
        )
      )
      render(
        <Provider>
          <DirectoryServerDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'TestFailedToAddDirectoryServer')
      const host = await screen.findByLabelText(/FQDN or IP Address/i)
      await user.type(host, 'ldap.test.com')
      const windowsDomainName = await screen.findByLabelText(/Windows Domain Name/i)
      await user.type(windowsDomainName, 'ou=mathematicians,dc=example,dc=com')
      const adminDomainName = await screen.findByLabelText(/Admin Domain Name/i)
      await user.type(adminDomainName, 'cn=read-only-admin,dc=example,dc=com')
      const adminPassword = await screen.findByLabelText(/Admin Password/i)
      await user.type(adminPassword, 'password')

      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(createFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        // catch error log
        expect(spyLog).toHaveBeenLastCalledWith(expect.objectContaining({
          status: 404
        }))
      })
    })
  })
})

