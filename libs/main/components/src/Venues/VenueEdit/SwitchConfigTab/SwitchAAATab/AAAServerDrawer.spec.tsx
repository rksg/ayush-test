import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                       from '@acx-ui/rc/services'
import { AAAServerTypeEnum, SwitchUrlsInfo }              from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { AAAServerDrawer } from './AAAServerDrawer'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
describe('AAAServers', () => {
  const requestSpy = jest.fn()

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.addAaaServer.url, (req, res, ctx) => {
        requestSpy()
        return res(ctx.json({}))
      })
    )
  })

  afterEach(() => {
    requestSpy.mockClear()
  })

  it('should add TACACS server correctly', async () => {
    render(<Provider>
      <AAAServerDrawer
        visible={true}
        setVisible={jest.fn()}
        isEditMode={false}
        editData={{}}
        serverType={AAAServerTypeEnum.TACACS}
      />
    </Provider>, { route: { params } }
    )

    await screen.findByText(/Add TACACS\+ Server/i)

    const nameInput = await screen.findByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'test' } })

    const ipInput = await screen.findByLabelText(/IP Address/i)
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })

    const portInput = await screen.findByLabelText(/Authentication port/i)
    fireEvent.change(portInput, { target: { value: '10' } })

    const secretInput = await screen.findByLabelText(/Shared secret/i)
    fireEvent.change(secretInput, { target: { value: 'FTFTHFHGGH' } })

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })

  it('should add local user correctly', async () => {
    render(<Provider>
      <AAAServerDrawer
        visible={true}
        setVisible={jest.fn()}
        isEditMode={false}
        editData={{}}
        serverType={AAAServerTypeEnum.LOCAL_USER}
      />
    </Provider>, { route: { params } }
    )

    await screen.findByText(/Add Local User/i)

    const nameInput = await screen.findByLabelText(/Username/i)
    fireEvent.change(nameInput, { target: { value: 'test' } })

    const pwInput = await screen.findByLabelText(/Password/i)
    fireEvent.change(pwInput, { target: { value: 'fdfdYHGFHGhsdgshjd$f7as' } })

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })

  //TODO: edit

})