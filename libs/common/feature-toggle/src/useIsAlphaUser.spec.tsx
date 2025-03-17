import { useIsAlphaUser } from './useIsAlphaUser'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { dogfood: 'true' }, betaEnabled: true })
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ isAlphaFlag: 'false' })
}))

describe('Test useIsAlphaUser function', () => {
  it('should be true for beta enabled and dogfood true', async () => {
    const enabled = useIsAlphaUser()
    expect(enabled).toBeTruthy()
  })
})
