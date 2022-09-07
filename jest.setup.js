require('whatwg-fetch')
require('@testing-library/jest-dom')

const { registerTsProject } = require('nx/src/utils/register')
const cleanupRegisteredPaths = registerTsProject('.', 'tsconfig.base.json')

const { mockServer, mockLightTheme } = require('@acx-ui/test-utils')
const config = require('@acx-ui/config')
const { mockInstances } = require('@googlemaps/jest-mocks')
const { Loader } = require('@googlemaps/js-api-loader')
const { rest } = require('msw')

beforeAll(() => mockServer.listen())
beforeEach(async () => {
  const env = require('./apps/main/src/env.json')
  mockServer.use(rest.get('/env.json', (_, res, ctx) => res(ctx.json(env))))
  await config.initialize()
})
afterEach(() => {
  mockServer.resetHandlers()
  Loader['instance']?.reset()
  mockInstances.clearAll()
})
afterAll(() => mockServer.close())

cleanupRegisteredPaths()

// from: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

jest.mock('libs/common/components/src/theme/helper', () => ({
  __esModule: true,
  cssStr: jest.fn(property => mockLightTheme[property]),
  cssNumber: jest.fn(property => parseInt(mockLightTheme[property], 10))
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  SplitProvider: ({ children }) =>
    require('react').createElement('div', null, children),
  useSplitTreatment: jest.fn(),
  useFFList: jest.fn(),
  useEvaluateFeature: jest.fn()
}), { virtual: true })

// For Error: Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)
HTMLCanvasElement.prototype.getContext = () => null

jest.setTimeout(10000)
