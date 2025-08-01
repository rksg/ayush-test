import { rest } from 'msw'

import { CommonUrlsInfo, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import useApGroupsTable from '.'

jest.mock('@acx-ui/rc/components', () => {
  const { forwardRef } = jest.requireActual('react')
  return {
    ...jest.requireActual('@acx-ui/rc/components'),
    ApGroupTable: forwardRef(() => <div data-testid={'ApGroupTable'}></div>)
  }
})

const venues = [{
  id: 'a98653366d2240b9ae370e48fab3a9a1',
  name: 'My-Venue',
  city: 'New York',
  country: 'United States',
  switches: 5,
  operationalSwitches: 5
}, {
  id: 'ca211ea6e80b456d891556690ae9db1c',
  name: 'test-cli',
  city: 'Sunnyvale, California',
  country: 'United States'
}, {
  id: '9f8392862b794b78b9a060d7bcfa87fc',
  name: 'test1',
  city: 'Sunnyvale, California',
  country: 'United States'
}, {
  id: '1cecae1a7fcb4e6384a64e04da856b67',
  name: 'test2',
  city: 'Sunnyvale, California',
  country: 'United States'
}]

describe('AP Groups Table', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render page correctly', async () => {
    const Component = () => {
      const { component } = useApGroupsTable()
      return component
    }

    render(<Component />, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ApGroupTable')).toBeVisible()
  })
})
