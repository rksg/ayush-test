/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import * as CommonComponent from '@acx-ui/components'
import { EdgeUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList, mockedEdgeServiceList } from '../../__tests__/fixtures'

import { EdgeDetailsPageHeader } from '.'

const mockedShowActionModal = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedDeleteApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedResetApi = jest.fn()

describe('Edge Detail Page Header', () => {
  const currentEdge = mockEdgeList.data[0]
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => {
          mockedRebootApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.factoryReset.url,
        (req, res, ctx) => {
          mockedResetApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeServiceList))
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
      pathname: `/${params.tenantId}/t/devices/edge/${currentEdge.serialNumber}/edit/general-settings`,
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

    const deleteDialog = await screen.findByRole('dialog')
    await within(deleteDialog).findByText(`Delete "${currentEdge.name}"?`)
    await userEvent.type(await within(deleteDialog).findByRole('textbox'), 'Delete')
    await userEvent.click(within(deleteDialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/edge`)
    })
  })

  it('should reboot edge correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const rebootBtn = await screen.findByRole('menuitem', { name: 'Reboot' })
    await userEvent.click(rebootBtn)

    const rebootDialog = await screen.findByRole('dialog')
    await within(rebootDialog).findByText(`Reboot "${currentEdge.name}"?`)
    await userEvent.click(within(rebootDialog).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => {
      expect(mockedRebootApi).toBeCalledTimes(1)
    })
  })

  it('should factory rest edge correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsPageHeader />
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const resetBtn = await screen.findByRole('menuitem', { name: 'Reset and Recover' })
    await userEvent.click(resetBtn)

    const resetDialog = await screen.findByRole('dialog')
    await within(resetDialog).findByText(`Reset and recover "${currentEdge.name}"?`)
    await userEvent.click(within(resetDialog).getByRole('button', { name: 'Reset' }))
    await waitFor(() => {
      expect(mockedResetApi).toBeCalledTimes(1)
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