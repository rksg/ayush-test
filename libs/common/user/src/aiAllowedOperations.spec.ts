import { getAIAllowedOperations, opsApis } from './aiAllowedOperations'
import { hasRoles }                        from './userProfile'

import type { UserProfile } from './types'

jest.mock('./userProfile', () => ({
  ...jest.requireActual('./userProfile'),
  hasRoles: jest.fn()
}))

const mockProfile = (scopes: string[] = []) => ({
  scopes
} as UserProfile)

describe('getAIAllowedOperations', () => {
  it('should allow all operations for PRIME_ADMIN and ADMINISTRATOR role', () => {
    jest.mocked(hasRoles).mockReturnValue(true)
    const result = getAIAllowedOperations(mockProfile())
    expect(result.flatMap(op => op.uri).sort()).toEqual(Object.values(opsApis).sort())
  })

  it('should allow operations based on user scope', () => {
    jest.mocked(hasRoles).mockReturnValue(false)
    const profile = mockProfile(['ai.incidents-u'])
    const expectedUris = [
      opsApis.updateIncident,
      opsApis.updateIntentAI
    ]
    const result = getAIAllowedOperations(profile)
    expect(result.flatMap(op => op.uri).sort()).toEqual(expectedUris.sort())
  })

  it('should not allow operations if the user has no matching roles or scopes', () => {
    jest.mocked(hasRoles).mockReturnValue(false)
    const profile = mockProfile([])
    const result = getAIAllowedOperations(profile)
    expect(result.flatMap(op => op.uri)).toEqual([])
  })

  it('should not allow operations if the profile is undefined', () => {
    jest.mocked(hasRoles).mockReturnValue(false)
    const result = getAIAllowedOperations(undefined)
    expect(result.flatMap(op => op.uri)).toEqual([])
  })
})
