import { useTreatments } from '@splitsoftware/splitio-react'
import { union }         from 'lodash'

import { renderHook }                                                    from '@acx-ui/test-utils'
import { UserProfileContextProps, useUserProfileContext }                from '@acx-ui/user'
import { AccountTier, AccountType, AccountVertical, getJwtTokenPayload } from '@acx-ui/utils'

import { Features }                                                   from './features'
import { defaultConfig, useFFList, useGetBetaList, useIsTierAllowed } from './useIsTierAllowed'

jest.mock('@splitsoftware/splitio-react', () => ({
  ...jest.requireActual('@splitsoftware/splitio-react'),
  useTreatments: jest.fn()
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn()
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: jest.fn()
}))

jest.mock('./useIsBetaEnabled', () => ({
  useIsBetaEnabled: jest.fn().mockReturnValue(true)
}))

const mockConfig = {
  'alphaList': ['alpha1', 'alpha2'],
  'betaList': ['beta1', 'beta2'],
  'alphaList-MSP': ['alpha1-MSP', 'alpha2-MSP'],
  'betaList-MSP': ['beta1-MSP', 'beta2-MSP'],
  'feature-MSP-Default': ['default-MSP1', 'default-MSP2'],
  'feature-REC-Default': ['default-REC1', 'default-REC2']
}

describe('Test useIsTierAllowed function', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('REC Default alpha/beta on', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify(mockConfig)
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.REC
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: true,
      isAlphaUser: true,
      isMspUser: false
    } as UserProfileContextProps)
    const { result: defaultFeature } = renderHook(() => useIsTierAllowed('default-REC1'))
    expect(defaultFeature.current).toBeTruthy()
    const { result: alphaFeature } = renderHook(() => useIsTierAllowed('alpha1'))
    expect(alphaFeature.current).toBeTruthy()
    const { result: betaFeature } = renderHook(() => useIsTierAllowed('beta1'))
    expect(betaFeature.current).toBeTruthy()
    const { result: mspFeature } = renderHook(() => useIsTierAllowed('default-MSP1'))
    expect(mspFeature.current).toBeFalsy()
    const { result: mspAlphaFeature } = renderHook(() => useIsTierAllowed('alpha1-MSP'))
    expect(mspAlphaFeature.current).toBeFalsy()
    const { result: mspBetaFeature } = renderHook(() => useIsTierAllowed('beta1-MSP'))
    expect(mspBetaFeature.current).toBeFalsy()
  })

  it('MSP Default alpha/beta on', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify(mockConfig)
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.MSP
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: true,
      isAlphaUser: true,
      isMspUser: true
    } as UserProfileContextProps)
    const { result: defaultFeature } = renderHook(() => useIsTierAllowed('default-MSP1'))
    expect(defaultFeature.current).toBeTruthy()
    const { result: alphaFeature } = renderHook(() => useIsTierAllowed('alpha1'))
    expect(alphaFeature.current).toBeTruthy()
    const { result: betaFeature } = renderHook(() => useIsTierAllowed('beta1'))
    expect(betaFeature.current).toBeTruthy()
    const { result: mspAlphaFeature } = renderHook(() => useIsTierAllowed('alpha1-MSP'))
    expect(mspAlphaFeature.current).toBeTruthy()
    const { result: mspBetaFeature } = renderHook(() => useIsTierAllowed('beta1-MSP'))
    expect(mspBetaFeature.current).toBeTruthy()
  })

  it('REC Default alpha/beta off', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify(mockConfig)
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.REC
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: false,
      isAlphaUser: false,
      isMspUser: false
    } as UserProfileContextProps)
    const { result: defaultFeature } = renderHook(() => useIsTierAllowed('default-REC1'))
    expect(defaultFeature.current).toBeTruthy()
    const { result: alphaFeature } = renderHook(() => useIsTierAllowed('alpha1'))
    expect(alphaFeature.current).toBeFalsy()
    const { result: betaFeature } = renderHook(() => useIsTierAllowed('beta1'))
    expect(betaFeature.current).toBeFalsy()
  })

  it('MSP Default alpha/beta off', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify(mockConfig)
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.MSP
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: false,
      isAlphaUser: false,
      isMspUser: true
    } as UserProfileContextProps)
    const { result: defaultFeature } = renderHook(() => useIsTierAllowed('default-MSP1'))
    expect(defaultFeature.current).toBeTruthy()
    const { result: alphaFeature } = renderHook(() => useIsTierAllowed('alpha1'))
    expect(alphaFeature.current).toBeFalsy()
    const { result: betaFeature } = renderHook(() => useIsTierAllowed('beta1'))
    expect(betaFeature.current).toBeFalsy()
    const { result: mspAlphaFeature } = renderHook(() => useIsTierAllowed('alpha1-MSP'))
    expect(mspAlphaFeature.current).toBeFalsy()
    const { result: mspBetaFeature } = renderHook(() => useIsTierAllowed('beta1-MSP'))
    expect(mspBetaFeature.current).toBeFalsy()
  })
})

describe('useFFList Test', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('treatment is control get default feature list', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'control', config: ''
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.HOSPITALITY,
      tenantType: AccountType.REC
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: true,
      isAlphaUser: true,
      isMspUser: false
    } as UserProfileContextProps)
    const { result } = renderHook(() => useFFList())
    expect(result.current.featureList).toEqual(union(
      defaultConfig['feature-REC-Default'],
      defaultConfig['feature-REC-Hospitality']
    ))
    expect(result.current.betaList).toEqual(defaultConfig['betaList'])
    expect(result.current.featureDrawerBetaList).toEqual(defaultConfig['betaList'])
    expect(result.current.alphaList).toEqual([])
  })

  it('MSP user should also get alphalist-MSP betaList-MSP feature set', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify(mockConfig)
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.MSP
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: true,
      isAlphaUser: true,
      isMspUser: true
    } as UserProfileContextProps)
    const { result } = renderHook(() => useFFList())
    expect(result.current.featureList).toEqual(mockConfig['feature-MSP-Default'])
    // eslint-disable-next-line max-len
    expect(result.current.betaList).toEqual(union(mockConfig['betaList'], mockConfig['betaList-MSP']))
    expect(result.current.featureDrawerBetaList).toEqual(mockConfig['betaList'])
    // eslint-disable-next-line max-len
    expect(result.current.alphaList).toEqual(union(mockConfig['alphaList'], mockConfig['alphaList-MSP']))
  })
})

describe('useGetBetaList', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should return an empty array when featureDrawerBetaList is undefined', () => {
    jest.mocked(useTreatments).mockReturnValue({
      [Features.PLM_FF]: {
        treatment: 'test', config: JSON.stringify({})
      }
    })
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      acx_account_tier: AccountTier.PLATINUM,
      acx_account_vertical: AccountVertical.DEFAULT,
      tenantType: AccountType.MSP
    })
    jest.mocked(useUserProfileContext).mockReturnValue({
      accountTier: AccountTier.PLATINUM,
      betaEnabled: true,
      isAlphaUser: true,
      isMspUser: true
    } as UserProfileContextProps)

    const { result } = renderHook(() => useGetBetaList())
    expect(result.current).toEqual([])
  })
})

