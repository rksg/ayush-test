require('whatwg-fetch')
require('@testing-library/jest-dom')

const { registerTsProject } = require('nx/src/utils/register')
const cleanupRegisteredPaths = registerTsProject('.', 'tsconfig.base.json')

const { mockServer } = require('@acx-ui/test-utils')

beforeAll(() => mockServer.listen())
afterEach(() => mockServer.resetHandlers())
afterAll(() => mockServer.close())

cleanupRegisteredPaths()
