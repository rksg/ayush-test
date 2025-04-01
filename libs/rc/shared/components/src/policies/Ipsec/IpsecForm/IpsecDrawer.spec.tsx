import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { ipSecApi }                                                       from '@acx-ui/rc/services'
import { IpsecUrls }                                                      from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {  mockIpSecTable } from './__tests__/fixtures'
import IpsecDrawer         from './IpsecDrawer'

const readViewPath = '/:tenantId/t/policies/ipsec/:policyId'
const createViewPath = '/:tenantId/t/policies/ipsec/create'
const policyName = 'ipsecName'

const params = {
  tenantId: 'tenantId',
  policyId: '0d89c0f5596c4689900fb7f5f53a0859'
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    delete otherProps.dropdownClassName
    return (
      <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {children}
      </select>
    )
  }
  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('IpsecDrawer', () => {
  const user = userEvent.setup()
  const mockedCallBack = jest.fn()
  const mockedSetVisible = jest.fn()
  describe('AddIpsecDrawer', () => {
    const addFn = jest.fn()
    beforeEach(() => {
      addFn.mockClear()
      mockedCallBack.mockClear()
      mockedSetVisible.mockClear()
      store.dispatch(ipSecApi.util.resetApiState())
      mockServer.use(
        rest.post(
          IpsecUrls.createIpsec.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.json({ response: { id: 'createIpsec' } }))
          }
        ),
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
        )
      )
    })

    afterEach(() => {
      Modal.destroyAll()
    })

    it('should create IpSec successfully', async () => {
      render(
        <Provider>
          <IpsecDrawer
            visible={true}
            setVisible={mockedSetVisible}
            readMode={false}
            callbackFn={mockedCallBack}
          />
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

      await waitFor(() => expect(mockedCallBack).toBeCalledTimes(1))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })

    it('should click cancel button and close drawer', async () => {
      render(
        <Provider>
          <IpsecDrawer
            visible={true}
            setVisible={mockedSetVisible}
            readMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
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
          <IpsecDrawer
            visible={true}
            setVisible={mockedSetVisible}
            readMode={false}
            callbackFn={mockedCallBack}
          />
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

  describe('ReadIpsecDrawer', () => {
    const updateFn = jest.fn()
    beforeEach(() => {
      updateFn.mockClear()
      mockedSetVisible.mockClear()
      store.dispatch(ipSecApi.util.resetApiState())

      mockServer.use(
        rest.post(
          IpsecUrls.createIpsec.url,
          (_, res, ctx) => res(ctx.status(202))
        ),
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
        )
      )
    })

    afterEach(() => {
      Modal.destroyAll()
    })

    // eslint-disable-next-line max-len
    it('should successfully fetch data from the API, edit it, and navigate back to the list page', async () => {
      render(
        <Provider>
          <IpsecDrawer
            visible={true}
            setVisible={mockedSetVisible}
            readMode={true}
            policyId={params.policyId}
            policyName={policyName}
          />
        </Provider>,
        { route: { path: readViewPath, params } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(await screen.findByText('Profile Details: ipsecName')).toBeVisible()
      expect(await screen.findByText('128.0.0.1')).toBeVisible()

      await user.click(screen.getByLabelText('Close'))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })
  })
})

