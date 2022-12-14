/* eslint-disable max-len */
import { rest } from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer
} from '@acx-ui/test-utils'


import { mockEdgeData as currentEdge } from '../../__tests__/fixtures'

import { EdgeDetailsPageHeader } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Detail Page Header', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({ data: [currentEdge] }))
      )
    )
  })

  it('should more actions to be clickable', async () => {
    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByText('More Actions'))
  })
  it('should redirect to edge general setting page after clicked configure', async () => {
    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByText('Configure'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${currentEdge.serialNumber}/edit/general-settings`,
      hash: '',
      search: ''
    })
  })
})