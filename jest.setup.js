require('whatwg-fetch')
require('@testing-library/jest-dom')

const { registerTsProject } = require('nx/src/utils/register')
const cleanupRegisteredPaths = registerTsProject('.', 'tsconfig.base.json')

const { mockServer, mockDOMSize, mockLightTheme } = require('@acx-ui/test-utils')
const config = require('@acx-ui/config')
const { setUpIntl } = require('@acx-ui/utils')
const { mockInstances } = require('@googlemaps/jest-mocks')
const { Loader } = require('@googlemaps/js-api-loader')
const { rest } = require('msw')
const nodeCrypto = require('crypto')
const { configure } = require('@testing-library/dom')

configure({ asyncUtilTimeout: 3000 })

// turn off warning from async-validator
global.ASYNC_VALIDATOR_NO_WARNING = 1

jest.mock('socket.io-client', () => ({
  connect: jest.fn().mockImplementation(() => ({
    hasListeners: jest.fn().mockReturnValue(true),
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
  }))
}))

var localStorageMock = (function() {
  var store = {}
  return {
    getItem: function(key) {
      return store[key]
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()

const cleanStylesFromDOM = function() {
  const head = document.getElementsByTagName('head')[0];
  const styles = head.getElementsByTagName('style');

  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeAll(() => {
  mockServer.listen()
  setUpIntl({ locale: 'en-US', messages: {} })
})
beforeEach(async () => {
  mockDOMSize(1280, 800)
  const env = require('./apps/main/src/env.json')
  mockServer.use(
    rest.get(`${document.baseURI}env.json`, (_, res, ctx) => res(ctx.json(env))),
    rest.get('/mfa/tenant/:tenantId', (_req, res, ctx) =>
      res(
        ctx.json({
          tenantStatus: 'DISABLED',
          mfaMethods: [],
          userId: 'userId',
        })
      )
    )
  )
  await config.initialize()

  require('@acx-ui/user').setUserProfile({
    allowedOperations: [],
    profile: {
      region: '[NA]',
      allowedRegions: [
        {
          name: 'US',
          description: 'United States of America',
          link: 'https://dev.ruckus.cloud',
          current: true
        }
      ],
      externalId: '001234567890Abcdef',
      pver: 'acx-hybrid',
      companyName: 'Dog Company 1234',
      firstName: 'FisrtName 1234',
      lastName: 'LastName 1234',
      username: 'dog1234@email.com',
      role: 'PRIME_ADMIN',
      roles: ['PRIME_ADMIN'],
      detailLevel: 'debug',
      dateFormat: 'mm/dd/yyyy',
      email: 'dog1551@email.com',
      var: false,
      tenantId: '1234567890abcdefghijklmnopqrstuv',
      varTenantId: '1234567890abcdefghijklmnopqrstuv',
      adminId: 'abcdefghijklmnopqrstuv1234567890',
      support: false,
      dogfood: false
    }
  })
})
afterEach(() => {
  localStorageMock.clear()
  mockServer.resetHandlers()
  Loader['instance']?.reset()
  mockInstances.clearAll()
})

afterAll(() => {
  mockServer.close()
  cleanStylesFromDOM()
})

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

window.crypto = {
  getRandomValues: function (buffer) {
    return nodeCrypto.randomFillSync(buffer)
  }
}

window.open = jest.fn()

jest.mock('libs/common/components/src/theme/helper', () => ({
  __esModule: true,
  cssStr: jest.fn(property => mockLightTheme[property]),
  cssNumber: jest.fn(property => parseInt(mockLightTheme[property], 10))
}))

jest.mock('merge-view-codemirror', () => ({
  init: () => jest.fn()
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  SplitProvider: ({ children }) =>
    require('react').createElement('div', null, children),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  useFFList: jest.fn(),
  Features: require('libs/common/feature-toggle/src/features').Features,
  TierFeatures:require('libs/common/feature-toggle/src/features').TierFeatures
}), { virtual: true })

jest.mock('@acx-ui/icons', ()=> {
  const React = jest.requireActual('react')
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [
    key,
    React.forwardRef((props, ref) =>
      React.createElement('svg', { 'data-testid': key, ...props, ref }))
  ])
  return Object.fromEntries(keys)
}, { virtual: true })

// For Error: Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)
HTMLCanvasElement.prototype.getContext = () => null

jest.setTimeout(20000)

// Mock module because the xarrow component will get the error: '_c.getTotalLength is not a function' when testing
jest.mock('react-xarrows', () => {
  const React = jest.requireActual('react')
  return {
    __esModule: true,
    default: () => React.createElement('span'),
    useXarrow: () => null
  }
})
