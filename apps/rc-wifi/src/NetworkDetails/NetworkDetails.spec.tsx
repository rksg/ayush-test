import '@testing-library/jest-dom'
import { render, screen }          from '@testing-library/react'
import { rest }                    from 'msw'
import { setupServer }             from 'msw/node'
import { BrowserRouter as Router } from 'react-router-dom'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'

import { NetworkDetails } from './NetworkDetails'


const network = {
  type: 'aaa',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  name: 'testNetwork',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const server = setupServer(
  rest.post(CommonUrlsInfo.getNetwork.url, (req, res, ctx) => {
    return res(ctx.json({ data: network }))
  })
)
describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    server.use(
      rest.post(CommonUrlsInfo.getNetwork.url, (req, res, ctx) => {
        return res(ctx.json({ data: network }))
      })
    )
    const { asFragment } = render(
      <Provider><Router><NetworkDetails></NetworkDetails></Router></Provider>
    )

    // await screen.findByText('testNetwork')
    expect(asFragment()).toMatchSnapshot()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(6)
  })
})