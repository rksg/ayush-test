import { rest } from 'msw'

import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { DOCS_HOME_URL, getDocsMappingURL, getDocsURL, useHelpPageLink } from './helpDoc.utils'

const mockedUrlMappingData = {
  'dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
  'administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
  'venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html'
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
})
