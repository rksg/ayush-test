// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
const { registerTsProject } = require('nx/src/utils/register')
const cleanupRegisteredPaths = registerTsProject('.', 'tsconfig.base.json')

const { mockServer } = require('@acx-ui/test-utils')

beforeAll(() => mockServer.listen())
afterEach(() => mockServer.resetHandlers())
afterAll(() => mockServer.close())

cleanupRegisteredPaths()
