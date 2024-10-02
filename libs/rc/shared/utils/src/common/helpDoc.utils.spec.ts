import { rest } from 'msw'

import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { DOCS_HOME_URL, getDocsMappingURL, getDocsURL, useHelpPageLink } from './helpDoc.utils'

const mockedUrlMappingData = {
  'dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
  'administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
  'venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html',
  'services/mdnsProxy/create': 'GUID-20E6C35F-37B8-4224-B621-EBF712C3A734.html'
}

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
    const expectedDefaultVal = DOCS_HOME_URL+'/ruckusone/userguide/index.html'

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

      await waitFor(() => expect(result.current).toBe(expectedDefaultVal))
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

      await waitFor(() => expect(result.current).toBe(expectedDefaultVal))
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

  describe('RAI case', () => {
    const mockedRAIUrlMappingData = {
      'analytics/intentAI': 'GUID-CAAC695C-6740-499D-8C42-AB521CEE65F6.html'
    }

    const expectedRAIDefaultVal = DOCS_HOME_URL+'/RUCKUS-AI/userguide/index.html'

    it('should correctly return corresponding link URL', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false, true), (_, res, ctx) =>
          res(ctx.json(mockedRAIUrlMappingData))
        ))
      const { result } = renderHook(() => {
        return useHelpPageLink(undefined, true)
      }, {
        route: {
          path: '/1d4c01e03b9540f29a3ebac62d56c8fb/t/analytics/intentAI',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
        // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/RUCKUS-AI/userguide/'+mockedRAIUrlMappingData['analytics/intentAI'])
      )
    })

    it('should correctly return corresponding link URL corresponding to given target', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false, true), (_, res, ctx) =>
          res(ctx.json(mockedRAIUrlMappingData))
        ))

      const intentAIPagePath = 'analytics/intentAI'
      const { result } = renderHook(() => {
        return useHelpPageLink(intentAIPagePath, true)
      }, {
        route: {
          path: '/1d4c01e03b9540f29a3ebac62d56c8fb/t/dashboard',
          wrapRoutes: false
        }
      })

      await waitFor(() =>
      // eslint-disable-next-line max-len
        expect(result.current).toBe(DOCS_HOME_URL+'/RUCKUS-AI/userguide/'+mockedRAIUrlMappingData['analytics/intentAI'])
      )
    })

    it('should use default when mapping not found', async () => {
      mockServer.use(
        rest.get(getDocsMappingURL(false, true), (_, res, ctx) =>
          res(ctx.json({
            empty: ''
          }))
        ))

      const { result } = renderHook(() => {
        return useHelpPageLink(undefined, true)
      }, {
        route: {
          path: '/1d4c01e03b9540f29a3ebac62d56c8fb/t/not-found',
          wrapRoutes: false
        }
      })

      await waitFor(() => expect(result.current).toBe(expectedRAIDefaultVal))
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
    const isMspPage = false, isRAI = true
    const mappingURL = getDocsMappingURL(isMspPage, isRAI)
    expect(mappingURL).not.toBeNull()
    expect(mappingURL).toBe('/docs/RUCKUS-AI/userguide/mapfile/doc-mapper.json')
    const docURL = getDocsURL(isMspPage, isRAI)
    expect(docURL).not.toBeNull()
    expect(docURL).toBe('/docs/RUCKUS-AI/userguide/')
  })
})