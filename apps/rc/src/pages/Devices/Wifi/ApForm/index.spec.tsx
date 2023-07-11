import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'

import { useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  aplist,
  apGrouplist,
  successResponse,
  apDetailsList
} from '../../__tests__/fixtures'

import { ApForm } from '.'

const validCoordinates = [
  '40.769141, -101.629519',
  '51.508506, -0.124915',
  '40.769141, -73.9429713'
]
// TODO
// const invalidCoordinates = '51.508506, -0.12xxxx'
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

async function fillInForm () {
  fireEvent.change(screen.getByLabelText(/AP Name/), { target: { value: 'apname' } })
  fireEvent.blur(screen.getByLabelText(/AP Name/))
  await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

  fireEvent.change(screen.getByLabelText(/Serial Number/), { target: { value: '123456789000' } })
  fireEvent.blur(screen.getByLabelText(/Serial Number/))
  await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))
}

async function changeVenue () {
  await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  expect(screen.getByLabelText('AP Group')).toBeDisabled()
  expect(await screen.findByText('GPS Coordinates')).toBeInTheDocument()

  fireEvent.mouseDown(screen.getByLabelText(/Venue/))
  await userEvent.click(await screen.getAllByText('My-Venue')[0])
  await waitFor(() => screen.findByText('No group (inherit from Venue)'))
  expect(screen.getByLabelText('AP Group')).not.toBeDisabled()
}

async function changeCoordinates (data, applyData) {
  await userEvent.click(await screen.findByRole('button', { name: 'Change' }))
  const dialog = await screen.findByRole('dialog')
  await within(dialog).findByText('GPS Coordinates')
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    fireEvent.change(
      await within(dialog).findByTestId('coordinates-input'), { target: { value: data } }
    )
  })

  if (!validCoordinates.includes(data)) {
    expect(await screen.findByText('Please enter valid GPS coordinates')).toBeVisible()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.change(
        await within(dialog).findByTestId('coordinates-input'),
        { target: { value: validCoordinates[1] } }
      )
    })
  }
  if (applyData) {
    await fireEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
  }
}

describe('AP Form - Add', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(aplist))),
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(WifiUrlsInfo.addAp.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.split(':serialNumber')[0],
        (_, res, ctx) => res(ctx.json(apDetailsList))),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      )
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    render(<Provider><ApForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    expect(await screen.findByText('Add AP')).toBeVisible()
    expect(screen.queryByText('GPS Coordinates')).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices`,
      hash: '',
      search: ''
    })
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><ApForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByRole('link', {
      name: /access points/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><ApForm /></Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Access Points')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /ap list/i
    })).toBeTruthy()
  })

  describe('handle Add AP and Coordinates Modal', () => {
    beforeEach(async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })

    it('should handle Add AP', async () => {
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await fillInForm()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    })

    it('should handle Add AP with custom coordinates', async () => {
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await fillInForm()
      await changeCoordinates(validCoordinates[1], true)

      expect(await screen.findByText('Please confirm that...')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Drop It' }))

      await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    })

    it('should handle discard coordinates input', async () => {
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await changeCoordinates(validCoordinates[0], false)
    })

    it('should handle valid coordinates input', async () => {
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await changeCoordinates(validCoordinates[1], true)

      expect(await screen.findByText('Please confirm that...')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Drop It' }))

      await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
      await userEvent.click(await screen.findByRole('button', { name: 'Same as Venue' }))
      expect(await screen.findByText('40.769141, -73.942971 (As venue)')).toBeVisible()

      await changeCoordinates(validCoordinates[2], true)
      expect(await screen.findByText('40.769141, -73.942971 (As venue)')).toBeVisible()
    })

    // TODO
    // it('should handle invalid coordinates input', async () => {
    //   render(<Provider><ApForm /></Provider>, {
    //     route: { params, path: '/:tenantId/devices/wifi/:action' }
    //   })
    //   await changeVenue()
    //   await changeCoordinates(invalidCoordinates, true)

    //   expect(await screen.findByText('Please confirm that...')).toBeVisible()
    //   const dialogs = await screen.findAllByRole('dialog')
    //   await userEvent.click(await within(dialogs[1]).findByRole('button', { name: 'Cancel' }))

    //   await userEvent.click(await screen.findByRole('button', { name: 'Change' }))
    //   await userEvent.click(await within(dialogs[0]).findByRole('button', { name: 'Cancel' }))
    //   expect(await screen.findByText('40.769141, -73.9429713 (As venue)')).toBeVisible()
    // })
  })

  describe('handle error occurred', () => {
    it('should handle error occurred', async () => {
      mockServer.use(
        rest.post(WifiUrlsInfo.addAp.url,
          (_, res, ctx) => {
            return res(ctx.status(400), ctx.json({ errors: [{ code: 'WIFI-xxxx' }] }))
          })
      )
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await fillInForm()

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      await screen.findByText('Error occurred while creating AP')
    })
    it('should handle request locking error', async () => {
      mockServer.use(
        rest.post(WifiUrlsInfo.addAp.url,
          (_, res, ctx) => {
            return res(ctx.status(423), ctx.json({ errors: [{ code: 'WIFI-xxxx' }] }))
          })
      )
      render(<Provider><ApForm /></Provider>, {
        route: { params, path: '/:tenantId/t/devices/wifi/:action' }
      })
      await changeVenue()
      await fillInForm()

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      await screen.findByText(/A configuration request is currently being executed/)
    })
  })
})
