import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  websocketServerUrl,
  ClientIsolationUrls,
  ClientUrlsInfo,
  ClientIsolationSaveData,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import{
  createPath,
  mockedClientIsolationList,
  mockedTenantId,
  mockedClientList,
  editPath,
  mockedPolicyId,
  mockedClientIsolation
} from './__tests__/fixtures'
import ClientIsolationForm from './ClientIsolationForm'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))


export const clientMeta = {
  data: [
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:97:c7:ef',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:c9:ab:2d',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: 'aa:5c:7a:99:38:a2',
      apName: 'UI team AP'
    }
  ]
}


describe.skip('ClientIsolationForm', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        ClientIsolationUrls.getClientIsolationList.url,
        (req, res, ctx) => res(ctx.json([ ...mockedClientIsolationList ]))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(ClientUrlsInfo.getClientMeta.url,
        (_, res, ctx) => res(ctx.json(clientMeta))
      )
    )
  })

  it('should create a Client Isolation policy', async () => {

    // Prepare testing data
    const saveFn = jest.fn()

    const entityToCreate: ClientIsolationSaveData = {
      name: 'Client Isolation testing',
      description: 'Here is the description',
      allowlist: [
        {
          mac: 'AA:BB:CC:DD:EE:11',
          description: 'Client 1'
        }
      ]
    }
    const clientToAdd = entityToCreate.allowlist[0]

    // Mock create policy API
    mockServer.use(
      rest.post(
        ClientIsolationUrls.addClientIsolation.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )

    render(
      <Provider>
        <ClientIsolationForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Set Policy Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Policy Name/ }),
      entityToCreate.name
    )

    // Set description
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Description/ }),
      entityToCreate.description!
    )

    // Set client by Add New Client
    await userEvent.click(await screen.findByRole('button', { name: 'Add New Client' }))

    const drawer = await screen.findByRole('dialog')

    // Verify if the drawer is open correctly
    expect(await within(drawer).findByText('Add Client')).toBeVisible()

    // Set client MAC Address
    await userEvent.type(
      await within(drawer).findByRole('textbox', { name: /MAC Address/ }),
      clientToAdd.mac
    )

    // Set client Description
    await userEvent.type(
      await within(drawer).findByRole('textbox', { name: /Description/ }),
      clientToAdd.description!
    )

    await userEvent.click(await within(drawer).findByRole('button', { name: 'Add' }))

    // Verify the client has been added to the allow list
    expect(await screen.findByRole('row', { name: new RegExp(clientToAdd.mac) })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(entityToCreate)
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <ClientIsolationForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Client Isolation'
    })).toBeVisible()
  })

  it('should create a Client Isolation policy with connected client', async () => {

    // Prepare testing data
    const saveFn = jest.fn()

    const clientList = [...mockedClientList]
    const clientToAdd = clientList[0]
    const entityToCreate: ClientIsolationSaveData = {
      name: 'Client Isolation testing',
      description: 'Here is the description',
      allowlist: [{
        mac: clientToAdd.clientMac,
        ipAddress: clientToAdd.ipAddress
      }]
    }

    // Mock create policy & client list APIs
    mockServer.use(
      rest.post(
        ClientIsolationUrls.addClientIsolation.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: clientList }))
      )
    )


    render(
      <Provider>
        <ClientIsolationForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Set Policy Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Policy Name/ }),
      entityToCreate.name
    )

    // Set description
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Description/ }),
      entityToCreate.description!
    )

    // Set client by Select from Connected Clients
    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: 'Select from Connected Clients' }))

    const drawer = await screen.findByRole('dialog')

    // Verify if the drawer is open correctly
    expect(await within(drawer).findByText('Select Connected Clients')).toBeVisible()

    // Select the client
    // eslint-disable-next-line max-len
    const targetRow = await within(drawer).findByRole('row', { name: new RegExp(clientToAdd.clientMac) })
    await userEvent.click(await within(targetRow).findByRole('checkbox'))
    await userEvent.click(await within(drawer).findByRole('button', { name: 'Add' }))

    // Verify the client has been added to the allow list
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(clientToAdd.clientMac) })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(entityToCreate)
    })
  })

  it('should render Edit form', async () => {
    mockServer.use(
      rest.get(
        ClientIsolationUrls.getClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ ...mockedClientIsolation }))
      )
    )

    render(
      <Provider>
        <ClientIsolationForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, policyId: mockedPolicyId },
          path: editPath
        }
      }
    )

    // Verify Policy Name
    const nameInput = await screen.findByDisplayValue(mockedClientIsolation.name)
    expect(nameInput).toBeInTheDocument()

    // Verify clients
    const targetClient = mockedClientIsolation.allowlist[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetClient.mac) })
    expect(targetRow).toBeVisible()
  })

  it('should show toast when edit policy failed', async () => {
    mockServer.use(
      rest.get(
        ClientIsolationUrls.getClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ ...mockedClientIsolation }))
      ),
      rest.put(
        ClientIsolationUrls.updateClientIsolation.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )

    render(
      <Provider>
        <ClientIsolationForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, policyId: mockedPolicyId },
          path: editPath
        }
      }
    )

    // Verify Policy Name
    const nameInput = await screen.findByDisplayValue(mockedClientIsolation.name)
    expect(nameInput).toBeInTheDocument()


    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    // TODO
    // const errorMsgElem = await screen.findByText('Server Error')
    // expect(errorMsgElem).toBeInTheDocument()
  })

  it('should navigate to the list page when clicking Cancel button', async () => {
    const { result: policyListPath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink(getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST }))
    })

    render(
      <Provider>
        <ClientIsolationForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(policyListPath.current)
  })
})
