import { useTreatments } from '@splitsoftware/splitio-react'
import _                 from 'lodash'

import { renderHook }                   from '@acx-ui/test-utils'
import { AccountType, AccountVertical } from '@acx-ui/utils'

import { TierFeatures }                     from './features'
import { useIsTierAllowed, useGetBetaList } from './useIsTierAllowed'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useDebugValue: jest.fn().mockReturnValue({}),
  useMemo: jest.fn().mockReturnValue({})
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({})
}))

jest.mock('@splitsoftware/splitio-react', () => ({
  ...jest.requireActual('@splitsoftware/splitio-react'),
  useTreatments: jest.fn().mockReturnValue({ treatment: 'control', config: '' })
}))

const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))
const utils = require('@acx-ui/utils')
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isDelegationMode: jest.fn().mockReturnValue(true)
}))

const useIsSplitOn = require('./useIsSplitOn')
jest.mock('./useIsSplitOn', () => ({
  useIsSplitOn: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn(() => ({ data: { dogfood: 'false' } }))
}))

jest.mock('./useIsTierAllowed', () => ({
  ...jest.requireActual('./useIsTierAllowed'),
  useGetBetaList: jest.fn(() => ['beta1', 'beta2', 'beta3']),
  useFFList: jest.fn(() => ({
    featureDrawerBetaList: ['beta1', 'beta2', 'beta3']
  }))
}))

describe('Test useIsTierAllowed function', () => {
  const tenantType = 'REC'
  const recDefaultVerticals = [AccountVertical.DEFAULT, AccountVertical.GOVERNMENT,
    AccountVertical.UNKNOWN, AccountVertical.NONPROFIT]
  const mspDefaultVerticals = [...recDefaultVerticals, AccountVertical.EDU]
  const defaultVerticals = tenantType === AccountType.REC ? recDefaultVerticals
    : mspDefaultVerticals

  beforeEach(async () => {
    user.useGetBetaStatusQuery = jest.fn().mockImplementation(() => {
      return { data: { enabled: 'true' } }
    })
    user.useGetAccountTierQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
  })
  it('should function correctly for beta flag true and REC tenant type', async () => {
    useIsSplitOn.useIsSplitOn = jest.fn().mockReturnValue(true)
    const enabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
    expect(enabled).toBeFalsy()
  })
  it('should function correctly for beta flag false and VAR tenant type', async () => {
    useIsSplitOn.useIsSplitOn = jest.fn().mockReturnValue(false)
    utils.getJwtTokenPayload = jest.fn().mockImplementation(() => {
      return {
        acx_account_tier: 'Platinum',
        acx_account_vertical: 'Default',
        isBetaFlag: false,
        tenantType: AccountType.VAR
      }
    })
    const enabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
    expect(enabled).toBeFalsy()
  })
  it('should function correctly for beta flag false and MSP tenant type', async () => {
    useIsSplitOn.useIsSplitOn = jest.fn().mockReturnValue(true)
    user.useGetBetaStatusQuery = jest.fn().mockImplementation(() => {
      return { data: { enabled: 'false' } }
    })
    utils.getJwtTokenPayload = jest.fn().mockImplementation(() => {
      return {
        acx_account_tier: 'Platinum',
        acx_account_vertical: 'Default',
        isBetaFlag: false
      }
    })
    const enabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
    expect(enabled).toBeFalsy()
  })

  it('should return DEFAULT if account vertical is in default verticals', () => {
    const jwtPayload = { acx_account_vertical: 'Default' }
    // eslint-disable-next-line max-len
    const accountVertical = defaultVerticals.includes(jwtPayload?.acx_account_vertical as AccountVertical)
      ? AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
    expect(accountVertical).toBe(AccountVertical.DEFAULT)
  })

  it('should return the account vertical if it is not in default verticals', () => {
    const jwtPayload = { acx_account_vertical: 'MSP' }
    // eslint-disable-next-line max-len
    const accountVertical = defaultVerticals.includes(jwtPayload?.acx_account_vertical as AccountVertical)
      ? AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
    expect(accountVertical).toBe('MSP')

    const { result: res1 } = renderHook(() => useTreatments(['TEST-PLM-FF'], {
      tier: 'Gold',
      vertical: accountVertical,
      tenantType: tenantType,
      tenantId: '233444',
      isBetaFlag: true
    }))
    expect(res1.current.treatment).toBe('control')
    expect(res1.current.config).toBe('')
  })

  it('should return default vertical feature Ids also when non-default vertical', () => {
    const jwtPayload = { acx_account_vertical: 'Education' }

    useIsSplitOn.useIsSplitOn = jest.fn().mockReturnValue(true)
    user.useGetBetaStatusQuery = jest.fn().mockImplementation(() => {
      return { data: { enabled: 'false' } }
    })
    utils.getJwtTokenPayload = jest.fn().mockImplementation(() => {
      return {
        acx_account_tier: 'Platinum',
        acx_account_vertical: 'Education',
        isBetaFlag: true
      }
    })
    const enabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
    expect(enabled).toBeFalsy()
    // eslint-disable-next-line max-len
    const accountVertical = defaultVerticals.includes(jwtPayload?.acx_account_vertical as AccountVertical)
      ? AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
    expect(accountVertical).toBe(AccountVertical.EDU)
  })

})

describe('useGetBetaList', () => {
  it('returns the correct beta list', () => {
    const { result } = renderHook(() => useGetBetaList())
    expect(result.current).toEqual(['beta1', 'beta2', 'beta3'])
  })
})

describe('Feature Key Test', () => {
  it('returns the correct feature list', () => {
    const tenantType = AccountType.REC
    const accountVertical = AccountVertical.DEFAULT
    const defaultConfig = {
      'feature-REC-Education': ['feature1', 'feature2'],
      'feature-REC-Default': ['feature3', 'feature4'],
      'betaList': ['beta1', 'beta2'],
      'alphaList': ['alpha1', 'alpha2']
    }
    const userFFConfig = _.cloneDeep(defaultConfig)
    const betaEnabled = true
    const userProfile = { dogfood: true }

    const featureKey = [
      'feature',
      tenantType,
      accountVertical
    ].join('-') as keyof typeof defaultConfig

    const featureDefaultKey = [
      'feature',
      tenantType,
      'Default'
    ].join('-') as keyof typeof defaultConfig
    const result = {
      featureList: (accountVertical === 'Default')?
        userFFConfig[featureKey] :
        _.union(userFFConfig[featureKey], userFFConfig[featureDefaultKey]),
      betaList: betaEnabled? userFFConfig['betaList'] : [],
      featureDrawerBetaList: userFFConfig['betaList'],
      alphaList: (betaEnabled && userProfile?.dogfood) ? userFFConfig['alphaList'] : []
    }
    expect(result.featureList).toEqual(['feature3', 'feature4'])
    expect(result.betaList).toEqual(['beta1', 'beta2'])
    expect(result.featureDrawerBetaList).toEqual(['beta1', 'beta2'])
    expect(result.alphaList).toEqual(['alpha1', 'alpha2'])
  })
})

