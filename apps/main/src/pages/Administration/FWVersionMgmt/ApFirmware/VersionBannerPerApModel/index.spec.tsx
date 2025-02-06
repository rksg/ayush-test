import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { firmwareApi }                        from '@acx-ui/rc/services'
import { FirmwareCategory, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { ApFirmwareContext } from '../index'

import { mockedApModelFirmwares } from './__tests__/fixtures'

import { VersionBannerPerApModel } from '.'

const generateApModelFirmwares = jest.fn()

describe('VersionBannerPerApModel', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())

    generateApModelFirmwares.mockReturnValue(mockedApModelFirmwares)

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (req, res, ctx) => {
          const result = generateApModelFirmwares()
          return res(ctx.json(result))
        }
      )
    )
  })

  it('should render the banner with the "Show More" link', async () => {
    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText(/For devices/i)).toBeVisible()

    expect(screen.queryByText('6.2.4.103.244')).toBeNull()

    await userEvent.click(screen.getByText('Show more'))
    expect(screen.getByText('6.2.4.103.244')).toBeVisible()
  })

  it('should render the banner without the "Show More" link', async () => {
    generateApModelFirmwares.mockReturnValue(mockedApModelFirmwares.slice(0, 1))

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText(/For devices/i)).toBeVisible()
    await waitFor(() => expect(screen.queryByText('Show more')).toBeNull())
  })

  it('should render the banner when there is no AP in the tenant', async () => {
    generateApModelFirmwares.mockReturnValue([{
      id: '7.0.0.104.1242',
      name: '7.0.0.104.1242',
      releaseDate: '2024-02-27T07:27:53.405+00:00',
      onboardDate: '2024-02-21T05:18:57.254+0000',
      category: FirmwareCategory.RECOMMENDED
    }])

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText('For devices --')).toBeVisible()
  })

  it('should render the banner with the latest version group', async () => {
    generateApModelFirmwares.mockReturnValue([{
      id: '7.0.0.104.1242',
      name: '7.0.0.104.1242',
      supportedApModels: [],
      releaseDate: '2024-02-27T07:27:53.405+00:00',
      onboardDate: '2024-02-21T05:18:57.254+0000',
      category: FirmwareCategory.RECOMMENDED
    }, {
      id: '6.2.2.103.143',
      name: '6.2.2.103.143',
      supportedApModels: ['R550', 'R720'],
      releaseDate: '2023-11-16T09:13:48.863+00:00',
      onboardDate: '2023-07-22T05:49:47.774+0000',
      category: FirmwareCategory.RECOMMENDED
    }])

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText('For devices --')).toBeVisible()
  })

  it('should render the banner with the latest ga and ea/iea version group', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    generateApModelFirmwares.mockReturnValue([
      {
        id: '7.1.1.400.24',
        name: '7.1.1.400.24',
        supportedApModels: [],
        onboardDate: '2024-10-10T20:56:27.59+0000',
        category: 'RECOMMENDED',
        labels: [
          'beta'
        ]
      },
      {
        id: '7.1.0.400.794',
        name: '7.1.0.400.794',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.922+00:00',
        onboardDate: '2024-09-11T05:41:18.829+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.1.0.400.792',
        name: '7.1.0.400.792',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.918+00:00',
        onboardDate: '2024-09-10T05:44:32.246+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.255',
        name: '6.2.4.103.255',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.920+00:00',
        onboardDate: '2024-03-28T09:06:06.554+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.0.103.553',
        name: '6.2.0.103.553',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.916+00:00',
        onboardDate: '2023-09-13T06:25:17.671+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      }
    ])

    render(
      <Provider>
        <ApFirmwareContext.Provider value={{
          isAlphaFlag: true,
          isBetaFlag: true
        }}>
          <VersionBannerPerApModel />
        </ApFirmwareContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.1.1.400.24 (Early Access)')).toBeVisible()
    expect(screen.getByText('For devices --')).toBeVisible()

    await userEvent.click(screen.getByText('Show more'))

    expect(await screen.findByText('7.1.0.400.794')).toBeVisible()
    expect(screen.getAllByText('For devices --').length).toBe(2)
  })

  // eslint-disable-next-line max-len
  it('should render the banner with the latest ga and ea/iea version group (ea is lower than ga)', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    generateApModelFirmwares.mockReturnValue([
      {
        id: '7.1.1.400.24',
        name: '7.1.1.400.24',
        supportedApModels: [],
        onboardDate: '2024-10-10T20:56:27.59+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.1.0.400.794',
        name: '7.1.0.400.794',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.922+00:00',
        onboardDate: '2024-09-11T05:41:18.829+0000',
        category: 'RECOMMENDED',
        labels: [
          'beta'
        ]
      },
      {
        id: '7.1.0.400.792',
        name: '7.1.0.400.792',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.918+00:00',
        onboardDate: '2024-09-10T05:44:32.246+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.255',
        name: '6.2.4.103.255',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.920+00:00',
        onboardDate: '2024-03-28T09:06:06.554+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.0.103.553',
        name: '6.2.0.103.553',
        supportedApModels: [],
        releaseDate: '2024-11-28T07:19:54.916+00:00',
        onboardDate: '2023-09-13T06:25:17.671+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      }
    ])

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.1.1.400.24')).toBeVisible()
    expect(screen.getByText('For devices --')).toBeVisible()

    await waitFor(() => expect(screen.queryByText('Show more')).toBeNull())
  })

  it('should render the banner with the early access version', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    generateApModelFirmwares.mockReturnValue([
      {
        id: '7.1.1.400.24',
        name: '7.1.1.400.24',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-07T06:15:06.054+00:00',
        onboardDate: '2024-10-10T08:56:27.059+0000',
        category: 'RECOMMENDED',
        labels: [
          'beta'
        ]
      },
      {
        id: '7.1.0.400.618',
        name: '7.1.0.400.618',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-07T06:14:09.858+00:00',
        onboardDate: '2024-07-18T10:46:20.883+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6398',
        name: '7.0.0.200.6398',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T07:23:46.902+00:00',
        onboardDate: '2024-09-07T10:32:19.199+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6394',
        name: '7.0.0.200.6394',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T07:23:18.757+00:00',
        onboardDate: '2024-09-05T11:19:02.765+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6390',
        name: '7.0.0.200.6390',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T06:44:38.547+00:00',
        onboardDate: '2024-09-03T07:57:47.280+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6385',
        name: '7.0.0.200.6385',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T06:43:54.561+00:00',
        onboardDate: '2024-09-02T03:24:49.876+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6365',
        name: '7.0.0.200.6365',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2024-10-23T08:56:39.366+00:00',
        onboardDate: '2024-08-24T09:31:56.077+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.255',
        name: '6.2.4.103.255',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2025-01-02T07:24:42.107+00:00',
        onboardDate: '2024-03-28T09:06:06.554+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.248',
        name: '6.2.4.103.248',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2024-10-23T08:56:39.372+00:00',
        onboardDate: '2024-02-04T03:16:04.631+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.3.103.249',
        name: '6.2.3.103.249',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2025-01-02T07:24:14.275+00:00',
        onboardDate: '2024-02-05T08:10:35.886+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.0.103.552',
        name: '6.2.0.103.552',
        supportedApModels: [
          'R600',
          'R500',
          'T301N',
          'T301S',
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750'
        ],
        releaseDate: '2024-10-23T08:56:39.371+00:00',
        onboardDate: '2023-08-25T04:42:47.258+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      }
    ])

    render(
      <Provider>
        <ApFirmwareContext.Provider value={{
          isAlphaFlag: false,
          isBetaFlag: false
        }}>
          <VersionBannerPerApModel />
        </ApFirmwareContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.1.0.400.618')).toBeVisible()
    expect(screen.getByText('For devices R750, R760, R770...')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should render the banner with the early access version and is alpha or beta user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    generateApModelFirmwares.mockReturnValue([
      {
        id: '7.1.1.400.24',
        name: '7.1.1.400.24',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-07T06:15:06.054+00:00',
        onboardDate: '2024-10-10T08:56:27.059+0000',
        category: 'RECOMMENDED',
        labels: [
          'beta'
        ]
      },
      {
        id: '7.1.0.400.618',
        name: '7.1.0.400.618',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-07T06:14:09.858+00:00',
        onboardDate: '2024-07-18T10:46:20.883+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6398',
        name: '7.0.0.200.6398',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T07:23:46.902+00:00',
        onboardDate: '2024-09-07T10:32:19.199+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6394',
        name: '7.0.0.200.6394',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T07:23:18.757+00:00',
        onboardDate: '2024-09-05T11:19:02.765+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6390',
        name: '7.0.0.200.6390',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T06:44:38.547+00:00',
        onboardDate: '2024-09-03T07:57:47.280+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6385',
        name: '7.0.0.200.6385',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2025-01-02T06:43:54.561+00:00',
        onboardDate: '2024-09-02T03:24:49.876+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '7.0.0.200.6365',
        name: '7.0.0.200.6365',
        supportedApModels: [
          'R750',
          'R760',
          'R770',
          'T670'
        ],
        releaseDate: '2024-10-23T08:56:39.366+00:00',
        onboardDate: '2024-08-24T09:31:56.077+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.255',
        name: '6.2.4.103.255',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2025-01-02T07:24:42.107+00:00',
        onboardDate: '2024-03-28T09:06:06.554+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.4.103.248',
        name: '6.2.4.103.248',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2024-10-23T08:56:39.372+00:00',
        onboardDate: '2024-02-04T03:16:04.631+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.3.103.249',
        name: '6.2.3.103.249',
        supportedApModels: [
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750',
          'R760'
        ],
        releaseDate: '2025-01-02T07:24:14.275+00:00',
        onboardDate: '2024-02-05T08:10:35.886+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      },
      {
        id: '6.2.0.103.552',
        name: '6.2.0.103.552',
        supportedApModels: [
          'R600',
          'R500',
          'T301N',
          'T301S',
          'R720',
          'R610',
          'R510',
          'T310D',
          'R750'
        ],
        releaseDate: '2024-10-23T08:56:39.371+00:00',
        onboardDate: '2023-08-25T04:42:47.258+0000',
        category: 'RECOMMENDED',
        labels: [
          'ga'
        ]
      }
    ])

    render(
      <Provider>
        <ApFirmwareContext.Provider value={{
          isAlphaFlag: true,
          isBetaFlag: true
        }}>
          <VersionBannerPerApModel />
        </ApFirmwareContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.1.1.400.24 (Early Access)')).toBeVisible()
    expect(screen.getByText('For devices R750, R760, R770...')).toBeVisible()
  })
})
