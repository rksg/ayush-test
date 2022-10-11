import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                                              from '@acx-ui/rc/services'
import { AAAServerTypeEnum, SwitchUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider, store }                                                       from '@acx-ui/store'
import { mockServer, render, waitForElementToBeRemoved, screen, fireEvent, act } from '@acx-ui/test-utils'

import { AAAServers } from './AAAServers'

const settings = {
  authnEnabledSsh: true,
  authnEnableTelnet: false,
  authnFirstPref: 'LOCAL',
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  id: '3d0e71c087e743feaaf6f6a19ea955f2'
}

const emptyList = {
  data: [],
  totalCount: 0
}

const radiusList = {
  data: [
    {
      id: '40aa7da509ee48bb97e423d5f5d41ec0',
      name: 'r0',
      serverType: 'RADIUS',
      secret: 'dg',
      ip: '3.3.3.3',
      acctPort: 45,
      authPort: 45
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

const tacacsList = {
  data: [
    {
      id: '4bd01f10e31a4d6c835d1785121bacd1',
      name: 't1',
      purpose: 'AUTHENTICATION_ONLY',
      serverType: 'TACACS_PLUS',
      secret: 'password-1',
      ip: '4.3.3.3',
      authPort: 56
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

const localUserList = {
  data: [
    { id: '7829365a824e477d81332cfacfe29b95',
      name: 'admin',
      username: 'admin',
      password: '@cVp14FH_v',
      purpose: 'DEFAULT',
      level: 'READ_WRITE',
      serverType: 'LOCAL',
      authPort: 0
    },
    {
      id: '6c4aea92d32e4875a5b736db83875eb6',
      name: 'yguo1',
      username: 'yguo1',
      password: '12dC@jkfjk',
      level: 'READ_WRITE',
      serverType: 'LOCAL'
    }],
  totalCount: 2,
  totalPages: 1,
  page: 1
}

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
describe('AAAServers', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })
  })
  it('should render empty lists and alert message correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(settings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      )
    )
    const { asFragment } = render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render RADIUS list correctly and add data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(settings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(radiusList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.addAaaServer.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const addButton = screen.getByRole('button', { name: 'Add RADIUS Server' })
    expect(addButton).toBeVisible()

    fireEvent.click(addButton)
    const nameField = screen.getByLabelText('Name')
    fireEvent.change(nameField, { target: { value: 'r2' } })
    const ipField = screen.getByLabelText('IP Address')
    fireEvent.change(ipField, { target: { value: '1.1.1.1' } })
    const authField = screen.getByLabelText('Authentication port')
    fireEvent.change(authField, { target: { value: '10' } })
    const acctField = screen.getByLabelText('Accounting port')
    fireEvent.change(acctField, { target: { value: '11' } })
    const secretField = screen.getByLabelText('Shared secret')
    fireEvent.change(secretField, { target: { value: 'gogo' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)
  })

  it('should render RADIUS list correctly and edit row data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(settings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(radiusList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.put(SwitchUrlsInfo.updateAaaServer.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    const { asFragment } = render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sharedSecretElem = await screen.findByDisplayValue('dg')
    fireEvent.click(sharedSecretElem)
    const row1 = await screen.findByText('r0')
    fireEvent.click(row1)
    const editButton = screen.getByRole('button', { name: /edit/i })
    expect(editButton).toBeVisible()

    fireEvent.click(editButton)
    const nameField = screen.getByLabelText('Name')
    fireEvent.change(nameField, { target: { value: 'r0_edit' } })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    fireEvent.click(editButton)
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render RADIUS list correctly and delete data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(settings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(radiusList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(emptyList))
      ),
      rest.delete(SwitchUrlsInfo.deleteAaaServer.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row1 = await screen.findByText('r0')
    fireEvent.click(row1)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "r0"?')
    const deleteNetworkButton = await screen.findByText('Delete RADIUS Server')
    fireEvent.click(deleteNetworkButton)
  })

  it('should render RADIUS list correctly and show delete warning', async () => {
    const aaaSettings = {
      ...settings,
      authnFirstPref: AAAServerTypeEnum.RADIUS
    }
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(aaaSettings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(radiusList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(tacacsList))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(localUserList))
      ),
      rest.delete(SwitchUrlsInfo.deleteAaaServer.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    const { asFragment } = render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row1 = await screen.findByText('r0')
    fireEvent.click(row1)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(/prioritized/i)
    expect(asFragment()).toMatchSnapshot()
  })

})
