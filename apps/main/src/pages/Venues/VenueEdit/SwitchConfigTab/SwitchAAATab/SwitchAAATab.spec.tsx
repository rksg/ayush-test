import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { emptyList, mockAaaSetting, radiusList } from '../../../__tests__/fixtures'

import { SwitchAAATab } from './SwitchAAATab'


const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('SwitchAAATab', () => {
  beforeEach(() => {
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
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    await waitForElementToBeRemoved(
      () => screen.queryAllByRole('img', { name: 'loader' }),
      { timeout: 10000 }
    )

    expect(asFragment()).toMatchSnapshot()
  })


  it('should Save AAA correctly', async () => {
    render(<Provider><SwitchAAATab /></Provider>, { route: { params } })

    const requestSpy = jest.fn()

    mockServer.use(
      rest.put(SwitchUrlsInfo.updateAaaSetting.url, (req, res, ctx) => {
        requestSpy()
        return res(ctx.json({}))
      })
    )
    const saveBtn = screen.getByRole('button', { name: 'Save AAA' })
    fireEvent.click(saveBtn)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })
})
