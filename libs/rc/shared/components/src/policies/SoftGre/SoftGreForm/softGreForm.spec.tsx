import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { softGreApi }                          from '@acx-ui/rc/services'
import { SoftGreUrls, TunnelProfileUrls }      from '@acx-ui/rc/utils'
import { Path }                                from '@acx-ui/react-router-dom'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockSoftGreData, mockSoftGreDataWithAaaAffinityEnabled, mockSoftGreNamesByQuery } from './__tests__/fixtures'
import { SoftGreForm }                                                                     from './softGreForm'

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

let params: { tenantId: string, policyId: string, id: string }
params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId',
  id: 'tenantId'
}

describe('addSoftGreForm', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())

    mockServer.use(
      rest.post(
        SoftGreUrls.createSoftGre.url,
        (req, res, ctx) => {
          return res(ctx.status(202))
        }
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockSoftGreNamesByQuery))
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
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SoftGRE' })).toBeVisible()
  })


  it('should create SoftGre successfully and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SoftGreForm editMode={false}/>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(profileNameField, 'TestSoftGre')
    // eslint-disable-next-line max-len
    const primaryGatewayField = screen.getByRole('textbox', { name: 'Tunnel Primary Gateway Address' })
    await user.type(primaryGatewayField,'128.0.0.1')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/softGre/list`,
      hash: '',
      search: ''
    }))
  })

  it('should click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    mockServer.use(
      rest.post(
        SoftGreUrls.createSoftGre.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({}))
        }
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockSoftGreNamesByQuery))
      )
    )
    render(
      <Provider>
        <SoftGreForm editMode={false} />
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(profileNameField, 'TestSoftGre')
    // eslint-disable-next-line max-len
    const primaryGatewayField = screen.getByRole('textbox', { name: 'Tunnel Primary Gateway Address' })
    await user.type(primaryGatewayField,'128.0.0.1')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      // catch error log
      expect(spyLog).toHaveBeenLastCalledWith(expect.objectContaining({
        status: 404
      }))
    })
  })
})

describe('EditSoftGre', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())

    mockServer.use(
      rest.get(
        SoftGreUrls.getSoftGre.url,
        (_req, res, ctx) => res(ctx.json(mockSoftGreData))
      ),
      rest.put(
        SoftGreUrls.updateSoftGre.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockSoftGreNamesByQuery))
      )
    )
  })

  it('should update SoftGre successfully and go back to list page', async () => {
    render(
      <Provider>
        <SoftGreForm editMode={true} />
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/softGre/list`,
      hash: '',
      search: ''
    }))
  })
})

describe('EditSoftGre with AAA affinity enabled', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())

    mockServer.use(
      rest.get(
        SoftGreUrls.getSoftGre.url,
        (_req, res, ctx) => res(ctx.json(mockSoftGreDataWithAaaAffinityEnabled))
      ),
      rest.put(
        SoftGreUrls.updateSoftGre.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockSoftGreNamesByQuery))
      )
    )
  })
  it('should disassociateClients be switched on & disabled when AaaAffinity enabled', async () => {
    render(
      <Provider>
        <SoftGreForm editMode={true} />
      </Provider>,
      { route: { path: editViewPath, params } }
    )
    const switchBtn = screen.getByRole('switch')
    await expect(switchBtn).toBeDisabled()
    await expect(switchBtn).toBeChecked()
  })
})

