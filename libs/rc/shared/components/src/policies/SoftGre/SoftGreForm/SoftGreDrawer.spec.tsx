import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { softGreApi }                                                     from '@acx-ui/rc/services'
import { SoftGreUrls }                                                    from '@acx-ui/rc/utils'
import { Path }                                                           from '@acx-ui/react-router-dom'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {  mockSoftGreTable } from './__tests__/fixtures'
import SoftGreDrawer         from './SoftGreDrawer'

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

const readViewPath = '/:tenantId/t/policies/SoftGre/:policyId'
const createViewPath = '/:tenantId/t/policies/SoftGre/create'
const policyName = 'softGreName'

const params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

describe('SoftGreDrawer', () => {
  const user = userEvent.setup()
  const mockedCallBack = jest.fn()
  const mockedSetVisible = jest.fn()
  describe('AddSoftGreDrawer', () => {
    const addFn = jest.fn()
    beforeEach(() => {
      addFn.mockClear()
      mockedCallBack.mockClear()
      mockedSetVisible.mockClear()
      store.dispatch(softGreApi.util.resetApiState())
      mockServer.use(
        rest.post(
          SoftGreUrls.createSoftGre.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.json({ response: { id: 'createSoftGre' } }))
          }
        ),
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
        )
      )
    })

    afterEach(() => {
      Modal.destroyAll()
    })

    it('should create SoftGre successfully', async () => {
      render(
        <Provider>
          <SoftGreDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            readMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )

      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'createSoftGre')
      const primaryGatewayField = await screen.findByLabelText(/Tunnel Primary Gateway Address/i)
      await user.type(primaryGatewayField, '128.0.0.1')

      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() => expect(addFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(addFn).toHaveBeenCalledWith(expect.objectContaining({
          name: 'createSoftGre',
          description: '',
          mtuType: 'AUTO',
          keepAliveInterval: 10,
          keepAliveRetryTimes: 5,
          disassociateClientEnabled: false,
          primaryGatewayAddress: '128.0.0.1'
        }))
      })
      await waitFor(() => expect(mockedCallBack).toBeCalledTimes(1))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })

    it('should click cancel button and close drawer', async () => {
      render(
        <Provider>
          <SoftGreDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
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
          SoftGreUrls.createSoftGre.url,
          (_, res, ctx) => {
            createFn()
            return res(ctx.status(404), ctx.json({}))
          }
        ),
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
        )
      )
      render(
        <Provider>
          <SoftGreDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            readMode={false}
            callbackFn={mockedCallBack}
          />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      const profileNameField = await screen.findByLabelText(/Profile Name/i)
      await user.type(profileNameField, 'TestFailedToAddSoftGre')
      // eslint-disable-next-line max-len
      const primaryGatewayField = await screen.findByLabelText(/Tunnel Primary Gateway Address/i)
      await user.type(primaryGatewayField,'128.0.0.1')

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

  describe('ReadSoftGreDrawer', () => {
    const updateFn = jest.fn()
    beforeEach(() => {
      updateFn.mockClear()
      mockedSetVisible.mockClear()
      store.dispatch(softGreApi.util.resetApiState())

      mockServer.use(
        rest.post(
          SoftGreUrls.createSoftGre.url,
          (_, res, ctx) => res(ctx.status(202))
        ),
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
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
          <SoftGreDrawer
            visible={true}
            setVisible={mockedSetVisible}
            editMode={false}
            readMode={true}
            policyId={params.policyId}
            policyName={policyName}
          />
        </Provider>,
        { route: { path: readViewPath, params } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(await screen.findByText('Profile Details: softGreName')).toBeVisible()
      expect(await screen.findByText('128.0.0.1')).toBeVisible()
      expect(await screen.findByText('128.0.0.0')).toBeVisible()

      await user.click(screen.getByLabelText('Close'))
      await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
    })
  })
})

