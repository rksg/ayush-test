import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { softGreApi }                                     from '@acx-ui/rc/services'
import { SoftGreUrls }                                    from '@acx-ui/rc/utils'
import { Path }                                           from '@acx-ui/react-router-dom'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {  mockSoftGreTable } from './__tests__/fixtures'
import { SoftGreForm }       from './SoftGreForm'

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

const editViewPath = '/:tenantId/t/policies/SoftGre/:policyId/edit'
const createViewPath = '/:tenantId/t/policies/SoftGre/create'

const params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

describe('SoftGreForm', () => {
  const user = userEvent.setup()
  describe('addSoftGreForm', () => {
    const addFn = jest.fn()
    beforeEach(() => {
      store.dispatch(softGreApi.util.resetApiState())
      mockServer.use(
        rest.post(
          SoftGreUrls.createSoftGre.url,
          (req, res, ctx) => {
            addFn(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
        )
      )
    })

    it('should render breadcrumb correctly', async () => {
      render(
        <Provider>
          <SoftGreForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      expect(await screen.findByText('Network Control')).toBeVisible()
      expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
      expect(await screen.findByRole('link', { name: 'SoftGRE' })).toBeVisible()
    })


    it('should create SoftGre successfully and go back to list page', async () => {
      render(
        <Provider>
          <SoftGreForm editMode={false}/>
        </Provider>,
        { route: { path: createViewPath, params } }
      )

      const policyNameField = await screen.findByLabelText(/Profile Name/i)
      fireEvent.change(policyNameField, { target: { value: 'createSoftGre' } })
      const primaryGatewayField = await screen.findByLabelText(/Tunnel Primary Gateway Address/i)
      fireEvent.change(primaryGatewayField, { target: { value: '128.0.0.1' } })

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
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/softGre/list`,
        hash: '',
        search: ''
      }))
    })

    it('should click cancel button and go back to list page', async () => {
      render(
        <Provider>
          <SoftGreForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/softGre/list`,
        hash: '',
        search: ''
      }))
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
          <SoftGreForm editMode={false} />
        </Provider>,
        { route: { path: createViewPath, params } }
      )
      const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
      await user.type(profileNameField, 'TestFailedToAddSoftGre')
      // eslint-disable-next-line max-len
      const primaryGatewayField = screen.getByRole('textbox', { name: 'Tunnel Primary Gateway Address' })
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

  describe('EditSoftGre', () => {
    const updateFn = jest.fn()
    beforeEach(() => {
      store.dispatch(softGreApi.util.resetApiState())

      mockServer.use(
        rest.post(
          SoftGreUrls.createSoftGre.url,
          (_, res, ctx) => res(ctx.status(202))
        ),
        rest.put(
          SoftGreUrls.updateSoftGre.url,
          (req, res, ctx) => {
            updateFn(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
        )
      )
    })

    // eslint-disable-next-line max-len
    it('should successfully fetch data from the API, edit it, and navigate back to the list page', async () => {
      render(
        <Provider>
          <SoftGreForm editMode={true} />
        </Provider>,
        { route: { path: editViewPath, params } }
      )

      const profileNameField = await screen.findByRole('textbox', { name: 'Profile Name' })
      fireEvent.change(profileNameField, { target: { value: 'testSoftGre' } })
      // eslint-disable-next-line max-len
      const primaryGatewayAddress = await screen.findByRole('textbox', { name: 'Tunnel Primary Gateway Address' })
      fireEvent.change(primaryGatewayAddress, { target: { value: '128.0.0.1' } })

      await user.click(await screen.findByRole('button', { name: 'Apply' }))
      await waitFor(() => expect(updateFn).toHaveBeenCalledTimes(1))
      await waitFor(() => {
        expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({
          name: 'testSoftGre',
          description: '',
          mtuType: 'AUTO',
          keepAliveInterval: 10,
          keepAliveRetryTimes: 5,
          disassociateClientEnabled: false,
          primaryGatewayAddress: '128.0.0.1'
        }))
      })
      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/policies/softGre/list`,
        hash: '',
        search: ''
      }))
    })
  })
})

