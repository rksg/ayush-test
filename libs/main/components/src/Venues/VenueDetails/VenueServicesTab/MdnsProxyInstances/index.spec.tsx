import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, MdnsProxyUrls } from '@acx-ui/rc/utils'
import { Path, To }                      from '@acx-ui/react-router-dom'
import { Provider }                      from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { mockedVenueApList, mockedTenantId, mockedVenueId, mockedMdnsProxyList, mockedApList } from './__tests__/fixtures'

import MdnsProxyInstances from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('MdnsProxyInstances', () => {
  const params = {
    tenantId: mockedTenantId,
    venueId: mockedVenueId
  }

  const path = '/:tenantId/t/venues/:venueId/venue-details/services'
  const removeMdnsProxyFn = jest.fn()
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxyApsByVenue.url,
        (req, res, ctx) => res(ctx.json(mockedVenueApList))
      ),
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxyAps.url,
        (req, res, ctx) => {
          removeMdnsProxyFn()
          return res(ctx.status(404), ctx.json({ requestId: '__REQUEST_ID__' }))
        }
      )
    )
  })
  afterEach(() => {
    removeMdnsProxyFn.mockClear()
  })


  it('should render table with the giving data', async () => {
    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetAp = mockedVenueApList[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(targetAp.apName) })

    expect(targetRow).toBeInTheDocument()
  })

  it('should remove the AP instance from mDNS Proxy service', async () => {
    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetAp = mockedVenueApList[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetAp.apName) })

    await userEvent.click(within(targetRow).getByRole('radio'))


    expect(await screen.findByText(/remove/i)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /remove/i }))

    expect(await screen.findByText('Delete "' + targetAp.apName + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Instance/i }))
    await waitFor(() => expect(removeMdnsProxyFn).toHaveBeenCalledTimes(1))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should deactivate the AP instance from mDNS Proxy service', async () => {
    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetAp = mockedVenueApList[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetAp.apName) })

    await userEvent.click(within(targetRow).getByRole('switch'))

    expect(await screen.findByText('Delete "' + targetAp.apName + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Instance/i }))
    await waitFor(() => expect(removeMdnsProxyFn).toHaveBeenCalledTimes(1))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should change the mDNS Proxy service', async () => {
    const saveFn = jest.fn()

    mockServer.use(
      rest.post(
        MdnsProxyUrls.addMdnsProxyAps.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([...mockedMdnsProxyList]))
      )
    )

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetVenueAp = mockedVenueApList[0]
    const targetMdnsProxyService = mockedMdnsProxyList[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetVenueAp.apName) })

    await userEvent.click(within(targetRow).getByRole('radio'))
    expect(await screen.findByText(/change/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Change' }))

    await userEvent.click(await screen.findByRole('combobox', { name: /mDNS Proxy Service/i }))

    await userEvent.click(await screen.findByText(targetMdnsProxyService.serviceName))

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith([targetVenueAp.serialNumber])
    })

    // Assert the drawer closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should add instance', async () => {
    const saveFn = jest.fn()

    mockServer.use(
      rest.post(
        MdnsProxyUrls.addMdnsProxyAps.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([...mockedMdnsProxyList]))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedApList }))
      )
    )

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetMdnsProxyService = mockedMdnsProxyList[0]
    const targetAp = mockedApList.data[0]

    await userEvent.click(await screen.findByRole('button', { name: 'Add Instance' }))

    await userEvent.click(await screen.findByRole('combobox', { name: /AP/i }))
    await userEvent.click(await screen.findByText(targetAp.name))

    await userEvent.click(await screen.findByRole('combobox', { name: /mDNS Proxy Service/i }))

    await userEvent.click(await screen.findByText(targetMdnsProxyService.serviceName))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith([targetAp.serialNumber])
    })

    // Assert the drawer closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
