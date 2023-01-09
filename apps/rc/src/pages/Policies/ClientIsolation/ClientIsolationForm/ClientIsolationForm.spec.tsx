import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  websocketServerUrl,
  ClientIsolationUrls,
  ClientUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, To } from '@acx-ui/react-router-dom'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import{
  createPath,
  mockedClientIsolationList,
  mockedTenantId,
  clientList
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


describe('ClientIsolationForm', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        ClientIsolationUrls.addClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      ),
      rest.get(
        ClientIsolationUrls.getClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ ...mockedClientIsolationList[0] }))
      ),
      rest.get(
        ClientIsolationUrls.getClientIsolationList.url,
        (req, res, ctx) => res(ctx.json([ ...mockedClientIsolationList ]))
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: clientList }))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should create a Client Isolation policy', async () => {
    const saveFn = jest.fn()

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

    const entityToCreate = {
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

    // Set Policy Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Policy Name/ }),
      entityToCreate.name
    )

    // Set description
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Description/ }),
      entityToCreate.description
    )

    // Set client by Add New Client
    await userEvent.click(await screen.findByRole('button', { name: 'Add New Client' }))

    const drawer = await screen.findByRole('dialog')

    // Verify if the drawer is open or not
    expect(await within(drawer).findByText('Add Client')).toBeVisible()

    // Set client MAC Address
    await userEvent.type(
      await within(drawer).findByRole('textbox', { name: /MAC Address/ }),
      clientToAdd.mac
    )

    // Set client Description
    await userEvent.type(
      await within(drawer).findByRole('textbox', { name: /Description/ }),
      clientToAdd.description
    )

    await userEvent.click(await within(drawer).findByRole('button', { name: 'Add' }))

    // Verify the client has been added to the allow list
    expect(await screen.findByRole('row', { name: new RegExp(clientToAdd.mac) })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(entityToCreate)
    })
  })

  // it('should render Edit form', async () => {
  //   render(
  //     <Provider>
  //       <DpskForm editMode={true} />
  //     </Provider>, {
  //       route: {
  //         params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
  //         path: editPath
  //       }
  //     }
  //   )

  //   // Verify service name
  //   const nameInput = await screen.findByDisplayValue(mockedEditFormData.name)
  //   expect(nameInput).toBeInTheDocument()
  // })

  // it('should show toast when edit service profile failed', async () => {
  //   mockServer.use(
  //     rest.patch(
  //       DpskUrls.updateDpsk.url,
  //       (req, res, ctx) => res(ctx.status(404), ctx.json({}))
  //     )
  //   )

  //   render(
  //     <Provider>
  //       <DpskForm editMode={true} />
  //     </Provider>, {
  //       route: {
  //         params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
  //         path: editPath
  //       }
  //     }
  //   )

  //   await screen.findByDisplayValue(mockedEditFormData.name)
  //   await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))

  //   const errorMsgElem = await screen.findByText('An error occurred')
  //   expect(errorMsgElem).toBeInTheDocument()
  // })

  // it('should navigate to the Select service page when clicking Cancel button', async () => {
  //   const { result: selectServicePath } = renderHook(() => {
  //     return useTenantLink(getServiceListRoutePath(true))
  //   })

  //   render(
  //     <Provider>
  //       <DpskForm />
  //     </Provider>, {
  //       route: { params: { tenantId: mockedTenantId }, path: createPath }
  //     }
  //   )

  //   await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

  //   expect(mockedUseNavigate).toHaveBeenCalledWith(selectServicePath.current)
  // })
})
