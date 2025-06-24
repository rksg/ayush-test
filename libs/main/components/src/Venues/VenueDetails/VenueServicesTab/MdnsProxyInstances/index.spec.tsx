import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { CommonRbacUrlsInfo, CommonUrlsInfo, MdnsProxyUrls } from '@acx-ui/rc/utils'
import { Path, To }                                          from '@acx-ui/react-router-dom'
import { Provider }                                          from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockedVenueApList,
  mockedTenantId,
  mockedVenueId,
  mockedMdnsProxyList,
  mockedApList,
  mockedMdnsProxyQueryResult,
  mockedMdnsProxyQueryResultWithoutActivation
} from './__tests__/fixtures'

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

  it('should render table with the giving data via RBAC api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const queryFn = jest.fn()
    const apQueryFn = jest.fn()

    mockServer.use(
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => {
          queryFn()
          return res(ctx.json(mockedMdnsProxyQueryResult))
        }
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          apQueryFn()
          return res(ctx.json(mockedApList))
        }
      )
    )

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await waitFor(() => expect(queryFn).toBeCalled())
    await waitFor(() => expect(apQueryFn).toBeCalled())

    const targetAp = mockedApList.data[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(targetAp.name) })

    expect(targetRow).toBeInTheDocument()

    jest.mocked(useIsSplitOn).mockReset()
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

  it('should remove the AP instance from mDNS Proxy service via RBAC api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const queryFn = jest.fn()
    const apQueryFn = jest.fn()
    const deactivateProfileFn = jest.fn()

    mockServer.use(
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => {
          queryFn()
          return res(ctx.json(mockedMdnsProxyQueryResult))
        }
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          apQueryFn()
          return res(ctx.json(mockedApList))
        }
      ),
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxyApsRbac.url,
        (_, res, ctx) => {
          deactivateProfileFn()
          return res(ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetAp = mockedApList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetAp.name) })

    await userEvent.click(within(targetRow).getByRole('radio'))


    expect(await screen.findByText(/remove/i)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /remove/i }))

    expect(await screen.findByText('Delete "' + targetAp.name + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Instance/i }))
    await waitFor(() => expect(deactivateProfileFn).toHaveBeenCalledTimes(1))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    jest.mocked(useIsSplitOn).mockReset()
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

  it('should add instance via RBAC api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const queryFn = jest.fn()
    const apQueryFn = jest.fn()
    const activateFn = jest.fn()

    mockServer.use(
      rest.put(
        MdnsProxyUrls.addMdnsProxyApsRbac.url,
        (req, res, ctx) => {
          activateFn(req.body)
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => {
          queryFn()
          return res(ctx.json(mockedMdnsProxyQueryResultWithoutActivation))
        }
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          apQueryFn()
          return res(ctx.json(mockedApList))
        }
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          apQueryFn()
          return res(ctx.json(mockedApList))
        }
      )
    )

    render(
      <Provider>
        <MdnsProxyInstances />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetMdnsProxyService = mockedMdnsProxyQueryResultWithoutActivation.data[0]
    const targetAp = mockedApList.data[0]

    await userEvent.click(await screen.findByRole('button', { name: 'Add Instance' }))

    await waitFor(() => expect(apQueryFn).toBeCalled())
    await waitFor(() => expect(queryFn).toBeCalled())

    await userEvent.click(await screen.findByRole('combobox', { name: /AP/i }))
    await userEvent.click(await screen.findByText(targetAp.name))

    await userEvent.click(await screen.findByRole('combobox', { name: /mDNS Proxy Service/i }))
    await userEvent.click(await screen.findByText(targetMdnsProxyService.name))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(activateFn).toHaveBeenCalled()
    })

    // Assert the drawer closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    jest.mocked(useIsSplitOn).mockReset()
  })
})
