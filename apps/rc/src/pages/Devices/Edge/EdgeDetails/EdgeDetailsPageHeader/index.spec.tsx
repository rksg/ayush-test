/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import * as CommonComponent from '@acx-ui/components'
import { EdgeUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }        from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'


import { mockEdgeData as currentEdge } from '../../__tests__/fixtures'

import { EdgeDetailsPageHeader } from '.'

const mockedShowActionModal = jest.fn()
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
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => res(ctx.status(200))
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

  it('should redirect to edge list after deleted edge', async () => {
    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const deleteBtn = await screen.findByRole('menuitem', { name: 'Delete SmartEdge' })
    await userEvent.click(deleteBtn)

    await screen.findByText(`Delete "${currentEdge.name}"?`)
    await userEvent.click(screen.getByRole('button', { name: 'Delete Edge' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/t/${params.tenantId}/devices/edge/list`)
    })
  })

  it('should do nothing if serialNumber in URL is "undefined"', async () => {
    let invalidParams: { tenantId: string, serialNumber: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: 'undefined' }

    jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
      mockedShowActionModal
    )

    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params: invalidParams }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const deleteBtn = await screen.findByRole('menuitem', { name: 'Delete SmartEdge' })
    await userEvent.click(deleteBtn)

    expect(mockedShowActionModal).toBeCalledTimes(0)
  })

})