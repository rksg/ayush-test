import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockNetworkSaveData, mockDeepNetworkList } from '../__tests__/fixtures'

import { EdgeSdLanActivatedNetworksTable } from '.'

const mockedSetFieldValue = jest.fn()
const mockedOnChangeFn = jest.fn()
const mockedGetNetworkDeepList = jest.fn()
const { click } = userEvent

describe('Edge SD-LAN ActivatedNetworksTable', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedOnChangeFn.mockReset()
    mockedGetNetworkDeepList.mockReset()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (_req, res, ctx) => {
          mockedGetNetworkDeepList()
          return res(ctx.json(mockDeepNetworkList))
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeSdLanActivatedNetworksTable
          venueId='mocked-venue'
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })
  it('should correctly deactivate by switch', async () => {
    render(
      <Provider>
        <EdgeSdLanActivatedNetworksTable
          venueId='mocked-venue'
          activated={['network_2', 'network_3']}
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const switchBtn1 = within(await screen.findByRole('row', { name: /MockedNetwork 1/i }))
      .getByRole('switch')
    expect(switchBtn1).not.toBeChecked()
    const switchBtn3 = within(await screen.findByRole('row', { name: /MockedNetwork 3/i }))
      .getByRole('switch')
    expect(switchBtn3).toBeChecked()
    await click(switchBtn3)
    expect(mockedOnChangeFn).toBeCalledWith({
      id: 'network_3',
      name: 'MockedNetwork 3',
      type: 'open' },
    false,
    [{
      id: 'network_2',
      name: 'MockedNetwork 2',
      type: 'psk'
    }])
  })
  it('should correctly activate by switcher', async () => {
    render(
      <Provider>
        <EdgeSdLanActivatedNetworksTable
          venueId='mocked-venue'
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    await click(
      within(await screen.findByRole('row', { name: /MockedNetwork 2/i })).getByRole('switch'))
    expect(mockedOnChangeFn).toBeCalledWith({
      id: 'network_2',
      name: 'MockedNetwork 2',
      type: 'psk'
    },
    true,
    [{
      id: 'network_2',
      name: 'MockedNetwork 2',
      type: 'psk'
    }])
  })
})

const checkPageLoaded = async (): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(4)
  return rows
}
