import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { directoryServerApi } from '@acx-ui/rc/services'
import {
  DirectoryServerProfileEnum,
  DirectoryServerUrls
} from '@acx-ui/rc/utils'
import { Path }                from '@acx-ui/react-router-dom'
import { Provider, store }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockDirectoryServer,
  mockDirectoryServerTable
} from './__tests__/fixtures'

import { DirectoryServerForm } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/tenantId',
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

const editViewPath = '/:tenantId/t/policies/directoryServer/:policyId/edit'
const createViewPath = '/:tenantId/t/policies/directoryServer/create'

const params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

describe('DirectoryServerForm', () => {
  const user = userEvent.setup()
  describe('addDirectoryServerForm', () => {
    const addFn = jest.fn()
    const getListFn = jest.fn()
    beforeEach(() => {
      store.dispatch(directoryServerApi.util.resetApiState())
      mockServer.use(
        rest.post(
          DirectoryServerUrls.createDirectoryServer.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          DirectoryServerUrls.getDirectoryServerViewDataList.url,
          (_, res, ctx) => {
            getListFn()
            return res(ctx.json(mockDirectoryServerTable.data))
          }
        )
      )
    })

    it('should render breadcrumb correctly', async () => {
      render(
        <Provider>
          <DirectoryServerForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      expect(await screen.findByText('Network Control')).toBeVisible()
      expect(
        await screen.findByRole('link', { name: 'Policies & Profiles' })
      ).toBeVisible()
      expect(
        await screen.findByRole('link', { name: 'Directory Server' })
      ).toBeVisible()
    })

    it('should create DirectoryServer successfully and go back to list page', async () => {
      render(
        <Provider>
          <DirectoryServerForm editMode={false} />
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
      await waitFor(() =>
        expect(mockedUseNavigate).toHaveBeenCalledWith({
          pathname: `/${params.tenantId}/t/policies/directoryServer/list`,
          hash: '',
          search: ''
        })
      )
    })

    it('should click cancel button and go back to list page', async () => {
      render(
        <Provider>
          <DirectoryServerForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() =>
        expect(mockedUseNavigate).toHaveBeenCalledWith({
          pathname: `/${params.tenantId}/t/policies/directoryServer/list`,
          hash: '',
          search: ''
        })
      )
    })

    it('should correctly display update error message', async () => {
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
          <DirectoryServerForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'TestFailedToAddDirectoryServer')
      const host = await screen.findByLabelText(/FQDN or IP Address/i)
      await user.type(host, 'ldap.test.com')
      const windowsDomainName = await screen.findByLabelText(
        /Windows Domain Name/i
      )
      await user.type(windowsDomainName, 'ou=mathematicians,dc=example,dc=com')
      const adminDomainName = await screen.findByLabelText(
        /Admin Domain Name/i
      )
      await user.type(adminDomainName, 'cn=read-only-admin,dc=example,dc=com')
      const adminPassword = await screen.findByLabelText(/Admin Password/i)
      await user.type(adminPassword, 'password')

      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(createFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        // catch error log
        expect(spyLog).toHaveBeenLastCalledWith(
          expect.objectContaining({
            status: 404
          })
        )
      })
    })
  })

  describe('EditDirectoryServerGre', () => {
    const updateFn = jest.fn()
    const getListFn = jest.fn()
    beforeEach(() => {
      store.dispatch(directoryServerApi.util.resetApiState())

      mockServer.use(
        rest.post(DirectoryServerUrls.createDirectoryServer.url, (_, res, ctx) =>
          res(ctx.status(202))
        ),
        rest.put(DirectoryServerUrls.updateDirectoryServer.url, (req, res, ctx) => {
          updateFn(req.body)
          return res(ctx.status(202))
        }),
        rest.post(
          DirectoryServerUrls.getDirectoryServerViewDataList.url,
          (_, res, ctx) => {
            getListFn()
            return res(ctx.json(mockDirectoryServerTable.data))
          }
        ),
        rest.get(DirectoryServerUrls.getDirectoryServer.url, (_, res, ctx) =>
          res(ctx.json(mockDirectoryServer))
        )
      )
    })

    // eslint-disable-next-line max-len
    it('should successfully fetch data from the API, edit it, and navigate back to the list page', async () => {
      render(
        <Provider>
          <DirectoryServerForm editMode={true} />
        </Provider>,
        {
          route: {
            path: editViewPath,
            params: { ...params, policyId: 'a5ac9a7a3be54dba9c8741c67d1c41fa' }
          }
        }
      )
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      const host = await screen.findByLabelText(/FQDN or IP Address/i)
      await user.clear(host)
      await user.type(host, 'ldap.test.com')
      const windowsDomainName = await screen.findByLabelText(/Windows Domain Name/i)
      await user.clear(windowsDomainName)
      await user.type(windowsDomainName, 'ou=scientists,dc=example,dc=com')
      const adminDomainName = await screen.findByLabelText(/Admin Domain Name/i)
      await user.clear(adminDomainName)
      await user.type(adminDomainName, 'cn=read-only-admin,dc=scientists,dc=com')
      const adminPassword = await screen.findByLabelText(/Admin Password/i)
      await user.clear(adminPassword)
      await user.type(adminPassword, 'password1')

      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.clear(profileNameField)
      await user.type(profileNameField, 'updateDirectoryServer')



      await user.click(await screen.findByRole('button', { name: 'Apply' }))

      await waitFor(() => expect(updateFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(updateFn).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'updateDirectoryServer',
            type: DirectoryServerProfileEnum.AD,
            tlsEnabled: false,
            host: 'ldap.test.com',
            port: 636,
            domainName: 'ou=scientists,dc=example,dc=com',
            adminDomainName: 'cn=read-only-admin,dc=scientists,dc=com',
            adminPassword: 'password1'
          })
        )
      })
      await waitFor(() =>
        expect(mockedUseNavigate).toHaveBeenCalledWith({
          pathname: `/${params.tenantId}/t/policies/directoryServer/list`,
          hash: '',
          search: ''
        })
      )
    })
  })
})
