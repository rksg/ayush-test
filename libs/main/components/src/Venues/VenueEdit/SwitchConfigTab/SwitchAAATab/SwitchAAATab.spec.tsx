import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi, switchApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { emptyList, mockAaaSetting, mockAaaSettingWithOrder, radiusList } from '../../../__tests__/fixtures'

import { SwitchAAATab } from './SwitchAAATab'


const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id'
}

const venueSwitchSetting = {
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchAAATab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    const requestSpy = jest.fn()
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
      rest.put(SwitchUrlsInfo.updateAaaSetting.url, (req, res, ctx) => {
        requestSpy()
        return res(ctx.json({}))
      }),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting))
      )
    )
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByRole('link', { name: 'Settings' }))
    expect(await screen.findByTestId('ssh-authentication')).toBeChecked()

    fireEvent.click(await screen.findByLabelText('SSH Authentication'))
    fireEvent.click(await screen.findByRole('button', { name: 'Save AAA' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
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
      }),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting))
      )
    )
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    const settingsBtn = screen.getByRole('link', { name: 'Settings' })
    fireEvent.click(settingsBtn)

    expect(await screen.findByText(/Log-in Authentication/i)).toBeInTheDocument()
    expect(await screen.findByTestId('command-authorization')).toBeChecked()
    expect(await screen.findByTestId('executive-accounting')).toBeChecked()

    const saveBtn = screen.getByRole('button', { name: 'Save AAA' })
    fireEvent.click(saveBtn)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/venues',
      hash: '',
      search: ''
    })

  })

  it('should not allowed to configure AAA in CLI mode', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json({
          ...venueSwitchSetting,
          cliApplied: true
        }))
      )
    )
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    expect(await screen.findByTestId('ssh-authentication')).toBeChecked()
    await screen.findByText(
      /These settings cannot be changed, since a CLI profile is applied on the venue./i
    )

    expect(await screen.findByRole('button', { name: 'Add RADIUS Server' })).toBeDisabled()
    expect(await screen.findByRole('button', { name: 'Add TACACS+ Server' })).toBeDisabled()
    expect(await screen.findByRole('button', { name: 'Add Local User' })).toBeDisabled()
  })
})
