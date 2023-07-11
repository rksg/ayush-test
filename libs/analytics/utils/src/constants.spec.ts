const mockTrue = { get: () => true }
const mockFalse = { get: () => false }

describe('Incident Codes', () => {
  beforeEach(() => {
    jest.resetModules()
  })
  it('Should return incident codes for R1', () => {
    jest.mock('@acx-ui/config', () => mockFalse)
    const codes = require('./constants').incidentCodes
    expect(codes.some((code: string) => code.startsWith('p-channeldist-'))).toBeFalsy()
  })
  it('Should return incident codes for SA', () => {
    jest.mock('@acx-ui/config', () => mockTrue)
    const codes = require('./constants').incidentCodes
    expect(codes.some((code: string) => code.startsWith('p-channeldist-'))).toBeTruthy()
  })
})
