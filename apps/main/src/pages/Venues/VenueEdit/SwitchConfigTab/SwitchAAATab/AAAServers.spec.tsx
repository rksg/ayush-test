import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { venueApi }                                                               from '@acx-ui/rc/services'
import { AAAServerTypeEnum, SwitchUrlsInfo }                                      from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, waitForElementToBeRemoved, screen, waitFor, within } from '@acx-ui/test-utils'

import { emptyList, localUserList, mockAaaSetting, radiusList, tacacsList } from '../../../__tests__/fixtures'

import { AAAServers } from './AAAServers'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
describe('AAAServers', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
  })
  it('should render empty lists and alert message correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) => res(ctx.json(mockAaaSetting))),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => res(ctx.json(emptyList)))
    )
    const { asFragment } = render(<Provider><AAAServers /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(async () => {
      (await screen.findAllByRole('columnheader', { name: /name/ })).forEach(header => {
        expect(header).toHaveClass('react-resizable')
      })
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render RADIUS list correctly and add data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
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

    await userEvent.click(addButton)
    await userEvent.type(screen.getByLabelText('Name'), 'r2r2r2')
    const ipField = screen.getByLabelText('IP Address')
    await userEvent.type(ipField, '1.1.1.1')
    const authField = screen.getByLabelText('Authentication port')
    await userEvent.type(authField, '10')
    const acctField = screen.getByLabelText('Accounting port')
    await userEvent.type(acctField, '11')
    const secretField = screen.getByLabelText('Shared secret')
    await userEvent.type(secretField, 'gogo')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)
  })

  it('should render RADIUS list correctly and edit row data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
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
    await userEvent.click(sharedSecretElem)
    const row1 = await screen.findByText('r0')
    await userEvent.click(row1)
    const editButton = screen.getByRole('button', { name: /edit/i })
    expect(editButton).toBeVisible()

    await userEvent.click(editButton)
    const nameField = screen.getByLabelText('Name')
    await userEvent.type(nameField, 'r0_edit')
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    await userEvent.click(editButton)
    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render RADIUS list correctly and delete data', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
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
    await userEvent.click(row1)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    await screen.findByText('Delete "r0"?')
    const deleteNetworkButton = await screen.findByText('Delete RADIUS Server')
    await userEvent.click(deleteNetworkButton)
  })

  it('should render RADIUS list correctly and show delete warning', async () => {
    const aaaSettings = {
      ...mockAaaSetting,
      authnFirstPref: AAAServerTypeEnum.RADIUS,
      authzCommonsFirstServer: AAAServerTypeEnum.RADIUS,
      authzExecFirstServer: AAAServerTypeEnum.RADIUS,
      acctCommonsFirstServer: AAAServerTypeEnum.RADIUS,
      acctExecFirstServer: AAAServerTypeEnum.RADIUS,
      authzEnabledCommand: true,
      authzEnabledExec: true,
      acctEnabledCommand: true,
      acctEnabledExec: true
    }
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(aaaSettings))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: AAAServerTypeEnum }
        switch (body.serverType) {
          case 'RADIUS': return res(ctx.json(radiusList))
          case 'TACACS_PLUS': return res(ctx.json(tacacsList))
          case 'LOCAL': return res(ctx.json(localUserList))
          default: return res(ctx.json(emptyList))
        }
      }),
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
    await waitForElementToBeRemoved(
      () => screen.queryAllByRole('img', { name: 'loader' }),
      { timeout: 10000 }
    )
    const row1 = await screen.findByText('r0')
    await userEvent.click(row1)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    const modal = await screen.findByRole('dialog')
    const warningText = await within(modal).findByText(/Log-in Authentication/i)
    expect(warningText).toBeVisible()
  })
})