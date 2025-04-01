import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { ipSecApi }                                                       from '@acx-ui/rc/services'
import { IpsecUrls }                                                      from '@acx-ui/rc/utils'
import { Path }                                                           from '@acx-ui/react-router-dom'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {  mockIpSecDetail, mockIpSecTable } from './__tests__/fixtures'

import { IpsecForm } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/tenantId',
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: ():Path => mockedTenantPath
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    delete otherProps.dropdownClassName
    return (<select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>)
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

const editViewPath = '/:tenantId/t/policies/ipsec/:policyId/edit'
const createViewPath = '/:tenantId/t/policies/ipsec/create'

const params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

describe('IpsecForm', () => {
  const user = userEvent.setup()
  jest.mocked(useIsSplitOn)
    .mockImplementation(ff => ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  describe('addIpsecForm', () => {
    const addFn = jest.fn()
    beforeEach(() => {
      store.dispatch(ipSecApi.util.resetApiState())
      mockServer.use(
        rest.post(
          IpsecUrls.createIpsec.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
        )
      )
    })

    it('should render breadcrumb correctly', async () => {
      render(
        <Provider>
          <IpsecForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      expect(await screen.findByText('Network Control')).toBeVisible()
      expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
      expect(await screen.findByRole('link', { name: 'IPsec' })).toBeVisible()
    })

    it('should create IPsec successfully and go back to list page', async () => {
      render(
        <Provider>
          <IpsecForm editMode={false}/>
        </Provider>,
        { route: { path: createViewPath, params } }
      )

      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'createIpSec')
      const securityGatewayField = await screen.findByLabelText(/Security Gateway/i)
      await user.type(securityGatewayField, '128.0.0.1')
      await user.selectOptions(
        screen.getByRole('combobox', { name: /authentication/i }),
        await screen.findAllByRole('option', { name: /pre-shared key/i })
      )
      const pskField = await screen.findByLabelText(/Pre-shared Key/i)
      await user.type(pskField, 'testPSK')

      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(addFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(addFn).toHaveBeenCalledWith(expect.objectContaining({
          name: 'createIpSec',
          authType: 'PSK',
          preSharedKey: 'testPSK',
          serverAddress: '128.0.0.1'
        }))
      })
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/ipsec/list`,
        hash: '',
        search: ''
      }))
    })

    it('should click cancel button and go back to list page', async () => {
      render(
        <Provider>
          <IpsecForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/ipsec/list`,
        hash: '',
        search: ''
      }))
    })

    it('should correctly display update error message', async () => {
      const spyLog = jest.spyOn(console, 'log')
      const createFn = jest.fn()
      mockServer.use(
        rest.post(
          IpsecUrls.createIpsec.url,
          (_, res, ctx) => {
            createFn()
            return res(ctx.status(404), ctx.json({}))
          }
        ),
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
        )
      )
      render(
        <Provider>
          <IpsecForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'TestFailedToAddIpSec')
      // eslint-disable-next-line max-len
      const securityGatewayField = await screen.findByLabelText(/Security Gateway/i)
      await user.type(securityGatewayField, '128.0.0.1')
      await user.selectOptions(
        screen.getByRole('combobox', { name: /authentication/i }),
        await screen.findAllByRole('option', { name: /pre-shared key/i })
      )
      const pskField = await screen.findByLabelText(/Pre-shared Key/i)
      await user.type(pskField, 'testPSK')

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

  describe('EditIpSec', () => {
    const updateFn = jest.fn()
    const getListFn = jest.fn()
    const getByIdFn = jest.fn()
    beforeEach(() => {
      store.dispatch(ipSecApi.util.resetApiState())

      mockServer.use(
        rest.post(
          IpsecUrls.createIpsec.url,
          (_, res, ctx) => res(ctx.status(202))
        ),
        rest.put(
          IpsecUrls.updateIpsec.url,
          (req, res, ctx) => {
            updateFn(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => {
            getListFn()
            return res(ctx.json(mockIpSecTable.data))
          }
        ),
        rest.get(
          IpsecUrls.getIpsec.url,
          (_, res, ctx) => {
            getByIdFn()
            return res(ctx.json(mockIpSecDetail))
          }
        )
      )
    })

    // eslint-disable-next-line max-len
    it('should successfully fetch data from the API, edit it, and navigate back to the list page', async () => {
      render(
        <Provider>
          <IpsecForm editMode={true} />
        </Provider>,
        { route: { path: editViewPath,
          params: { ...params, policyId: '0d89c0f5596c4689900fb7f5f53a0859' } }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.clear(profileNameField)
      await user.type(profileNameField, 'testEditIpSec')

      const primaryGatewayField = await screen.findByLabelText(/Security Gateway/i)
      await user.clear(primaryGatewayField)
      await user.type(primaryGatewayField, '128.0.0.99')

      const pskField = await screen.findByLabelText(/Pre-shared Key/i)
      await user.clear(pskField)
      await user.type(pskField, 'updatedTestPSK')

      await user.click(await screen.findByRole('button', { name: 'Apply' }))

      await waitFor(() => expect(updateFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({
          name: 'testEditIpSec',
          preSharedKey: 'updatedTestPSK',
          serverAddress: '128.0.0.99'
        }))
      })
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/ipsec/list`,
        hash: '',
        search: ''
      }))
    })
  })
})

