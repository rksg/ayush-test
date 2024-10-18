import { rest } from 'msw'

import { get }                             from '@acx-ui/config'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { DOCS_HOME_URL, getDocsMappingURL, getDocsURL, getRaiDocsMappingURL, getRaiDocsURL, replaceIntentCode, useHelpPageLink, useHelpPageLinkBasePath, useRaiR1HelpPageLink } from './helpDoc.utils'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)

const mockedUrlMappingData = {
  'dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
  'administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
  'venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html',
  'services/mdnsProxy/create': 'GUID-20E6C35F-37B8-4224-B621-EBF712C3A734.html',
  'analytics/intentAI': 'GUID-CAAC695C-6740-499D-8C42-AB521CEE65F6.html'
}

const expectedR1DefaultVal = DOCS_HOME_URL+'/ruckusone/userguide/index.html'

describe('HelpPage URL', () => {
  it('should correctly return corresponding link URL', async () => {
    mockServer.use(
      rest.get(getDocsMappingURL(false), (_, res, ctx) =>
        res(ctx.json(mockedUrlMappingData))
      ))
    const { result } = renderHook(() => {
      return useHelpPageLink()
    }, {
      route: {
        path: '/a5804cffcefd408c8d36aca5bd112838/t/dashboard',
        wrapRoutes: false
      }
    })

    await waitFor(() =>
      // eslint-disable-next-line max-len
      expect(result.current).toBe(DOCS_HOME_URL+'/ruckusone/userguide/'+mockedUrlMappingData.dashboard)
    )
  })

  it('should correctly return corresponding link URL corresponding to given target', async () => {
    mockServer.use(
      rest.get(getDocsMappingURL(false), (_, res, ctx) =>
        res(ctx.json(mockedUrlMappingData))
      ))

    const addMdnsPagePath = 'services/mdnsProxy/create'
    const { result } = renderHook(() => {
      return useHelpPageLink(addMdnsPagePath)
    }, {
      route: {
        path: '/a5804cffcefd408c8d36aca5bd112838/t/dashboard',
        wrapRoutes: false
      }
    })

    await waitFor(() =>
      // eslint-disable-next-line max-len
      expect(result.current).toBe(DOCS_HOME_URL+'/ruckusone/userguide/'+mockedUrlMappingData['services/mdnsProxy/create'])
    )
  })

  describe('Default with index.html page', () => {
    it('should use default when mapping not found', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false), (_, res, ctx) =>
          res(ctx.json({
            empty: ''
          }))
        ))

      const { result } = renderHook(() => {
        return useHelpPageLink()
      }, {
        route: {
          path: '/dashboard',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedR1DefaultVal))
    })

    it('should use default when fetch mapping file failed', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false), (_, res, ctx) =>
          res(
            ctx.status(404),
            ctx.json({
              errorMessage: 'File not found'
            })
          )
        ))

      const { result } = renderHook(() => {
        return useHelpPageLink()
      }, {
        route: {
          path: '/dashboard',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedR1DefaultVal))
    })
  })

  describe('MSP case', () => {
    const mockedMspUrlMappingData = {
      'dashboard': 'GUID-3BAE8069-5D1E-4211-A946-8A0F83148A5F.html',
      'dashboard/mspCustomers': 'GUID-3B9730CB-8CDB-43E3-95F7-A32E89662216.html',
      'mspLicenses': 'GUID-94200DF2-117C-49AC-BB74-3A87C854ABE6.html'
    }

    const expectedMspDefaultVal = DOCS_HOME_URL+'/ruckusone/mspguide/index.html'

    it('should correctly return corresponding link URL', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(true), (_, res, ctx) =>
          res(ctx.json(mockedMspUrlMappingData))
        ))
      const { result } = renderHook(() => {
        return useHelpPageLink()
      }, {
        route: {
          path: '/a5804cffcefd408c8d36aca5bd112830/v/dashboard',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/ruckusone/mspguide/'+mockedMspUrlMappingData.dashboard)
      )
    })

    it('should use default when mapping not found', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(true), (_, res, ctx) =>
          res(ctx.json({
            empty: ''
          }))
        ))

      const { result } = renderHook(() => {
        return useHelpPageLink()
      }, {
        route: {
          path: '/a5804cffcefd408c8d36aca5bd112830/v/not-found',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedMspDefaultVal))
    })
  })

  describe('RAI component', () => {

    beforeEach(() => {
      mockGet.mockReturnValue('') // get('IS_MLISA_SA')
      mockServer.use(
        rest.get(getDocsMappingURL(false), (_, res, ctx) =>
          res(ctx.json(mockedUrlMappingData))
        ),
        rest.get(getRaiDocsMappingURL(), (_, res, ctx) =>
          res(ctx.json(mockedRaiUrlMappingData))
        )
      )
    })
    afterEach(() => {
      mockServer.resetHandlers()
    })

    const mockedRaiUrlMappingData = {
      'ai/intentAI': 'GUID-CAAC695C-6740-499D-8C42-AB521CEE65F6.html'
    }

    const expectedRaiDefaultVal = DOCS_HOME_URL+'/RUCKUS-AI/userguide/index.html'

    it('should correctly return corresponding link URL in RAI', async () => {
      mockGet.mockReturnValue('true')

      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/ai/intentAI',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/RUCKUS-AI/userguide/'+mockedRaiUrlMappingData['ai/intentAI'])
      )
    })

    it('should correctly return corresponding link URL in R1', async () => {
      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/a5804cffcefd408c8d36aca5bd112838/t/analytics/intentAI',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/ruckusone/userguide/'+mockedUrlMappingData['analytics/intentAI'])
      )
    })

    // eslint-disable-next-line max-len
    it('should correctly return corresponding link URL corresponding to given target in RAI', async () => {
      mockGet.mockReturnValue('true')

      const intentAIPagePath = 'ai/intentAI'
      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink(intentAIPagePath)
      }, {
        route: {
          path: '/ai/incidents',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/RUCKUS-AI/userguide/'+mockedRaiUrlMappingData['ai/intentAI'])
      )
    })

    // eslint-disable-next-line max-len
    it('should correctly return corresponding link URL corresponding to given target in R1', async () => {
      const intentAIPagePath = 'analytics/intentAI'
      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink(intentAIPagePath)
      }, {
        route: {
          path: '/a5804cffcefd408c8d36aca5bd112838/t/dashboard',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/ruckusone/userguide/'+mockedUrlMappingData['analytics/intentAI'])
      )
    })

    it('should use default when mapping not found in RAI', async () => {
      mockGet.mockReturnValue('true')
      mockServer.use(
        rest.get(getRaiDocsMappingURL(), (_, res, ctx) =>
          res(ctx.json({
            empty: ''
          }))
        ))

      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedRaiDefaultVal))
    })

    it('should use default when mapping not found in R1', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false), (_, res, ctx) =>
          res(ctx.json({
            empty: ''
          }))
        ))

      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedR1DefaultVal))
    })

    it('should use default when fetch mapping file failed in RAI', async () => {
      mockGet.mockReturnValue('true')
      mockServer.use(
        rest.get(getRaiDocsMappingURL(), (_, res, ctx) =>
          res(
            ctx.status(404),
            ctx.json({
              errorMessage: 'File not found'
            })
          )
        ))

      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/ai/intentAI',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedRaiDefaultVal))
    })

    it('should use default when fetch mapping file failed in R1', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false), (_, res, ctx) =>
          res(
            ctx.status(404),
            ctx.json({
              errorMessage: 'File not found'
            })
          )
        ))

      const { result } = renderHook(() => {
        return useRaiR1HelpPageLink()
      }, {
        route: {
          path: '/a5804cffcefd408c8d36aca5bd112838/t/analytics/intentAI',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedR1DefaultVal))
    })

  })
})

const originalEnv = process.env
describe('HelpPage Component URLs', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development'
    }
  })
  afterEach(() => {
    process.env = originalEnv
  })
  it('should return correct URL for REC', async () => {
    const isMspPage = false
    const mappingURL = getDocsMappingURL(isMspPage)
    expect(mappingURL).not.toBeNull()
    expect(mappingURL).toBe('/docs/ruckusone/userguide/mapfile/doc-mapper.json')
    const docURL = getDocsURL(isMspPage)
    expect(docURL).not.toBeNull()
    expect(docURL).toBe('/docs/ruckusone/userguide/')
  })

  it('should return correct URL for MSP', async () => {
    const isMspPage = true
    const mappingURL = getDocsMappingURL(isMspPage)
    expect(mappingURL).not.toBeNull()
    expect(mappingURL).toBe('/docs/ruckusone/mspguide/mapfile/doc-mapper.json')
    const docURL = getDocsURL(isMspPage)
    expect(docURL).not.toBeNull()
    expect(docURL).toBe('/docs/ruckusone/mspguide/')
  })

  it('should return correct URL for RAI', async () => {
    const mappingURL = getRaiDocsMappingURL()
    expect(mappingURL).not.toBeNull()
    expect(mappingURL).toBe('/docs/RUCKUS-AI/userguide/mapfile/doc-mapper.json')
    const docURL = getRaiDocsURL()
    expect(docURL).not.toBeNull()
    expect(docURL).toBe('/docs/RUCKUS-AI/userguide/')
  })
})

describe('verify intent code replacement with *', () => {
  it.each([
    {
      intentCode: 'c-bgscan24g-enable'
    },
    {
      intentCode: 'c-dfschannels-enable'
    },
    {
      intentCode: 'c-bandbalancing-enable-below-61'
    },
    {
      intentCode: 'i-zonefirmware-upgrade'
    },
    {
      intentCode: 'i-ecoflex'
    }
  ])('should replace with * when intentCode is $intentCode', ({ intentCode }) => {
    expect(replaceIntentCode(intentCode)).toEqual('*')
  })
})

describe('verify replacement with * in R1', () => {
  it('should replace correctly in R1 for non intentAI path', () => {
    const { result } = renderHook(() => {
      return useHelpPageLinkBasePath()
    }, {
      route: {
        path: '/a5804cffcefd408c8d36aca5bd112838/t/dashboard',
        wrapRoutes: false
      }
    })
    expect(result.current).toEqual({
      isMspUser: false,
      basePath: 'dashboard'
    })
  })
  it('should replace correctly in R1 for intentAI detail page with intentCode', () => {
    const { result } = renderHook(() => {
      return useHelpPageLinkBasePath()
    }, {
      route: {
        // eslint-disable-next-line max-len
        path: '/a5804cffcefd408c8d36aca5bd112838/t/analytics/intentAI/1844726260b54553be67f64a5b7bcfe4/c-bandbalancing-enable-below-61',
        wrapRoutes: false
      }
    })
    expect(result.current).toEqual({
      isMspUser: false,
      basePath: 'analytics/intentAI/*/*'
    })
  })
  it('should replace correctly in R1 for intentAI page without intentCode', () => {
    const { result } = renderHook(() => {
      return useHelpPageLinkBasePath()
    }, {
      route: {
        path: '/a5804cffcefd408c8d36aca5bd112838/t/analytics/intentAI',
        wrapRoutes: false
      }
    })
    expect(result.current).toEqual({
      isMspUser: false,
      basePath: 'analytics/intentAI'
    })
  })

})
