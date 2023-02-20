import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }        from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { emptyList, mockAaaSetting, mockAaaSettingWithOrder, radiusList } from '../../../__tests__/fixtures'

import { SwitchAAATab } from './SwitchAAATab'


const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('SwitchAAATab', () => {
  afterEach(() =>
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })
  )

  it('should render correctly', async () => {
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
      ),
      rest.put(SwitchUrlsInfo.updateAaaSetting.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByRole('link', { name: 'Settings' }))

    const sshCbx = screen.getByLabelText('SSH Authentication')
    fireEvent.click(sshCbx)

    const saveBtn = screen.getByRole('button', { name: 'Save AAA' })
    fireEvent.click(saveBtn)
  })


  it('should Save AAA correctly', async () => {
    const requestSpy = jest.fn()

    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSettingWithOrder))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
      rest.put(SwitchUrlsInfo.updateAaaSetting.url, (req, res, ctx) => {
        requestSpy()
        return res(ctx.json({}))
      })
    )
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    const settingsBtn = screen.getByRole('link', { name: 'Settings' })
    fireEvent.click(settingsBtn)

    const saveBtn = screen.getByRole('button', { name: 'Save AAA' })
    fireEvent.click(saveBtn)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)
  })
})
