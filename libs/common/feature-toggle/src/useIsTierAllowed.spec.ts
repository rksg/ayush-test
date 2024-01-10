import { renderHook }                   from '@acx-ui/test-utils'
import { AccountType, AccountVertical } from '@acx-ui/utils'

import { TierFeatures }                                        from './features'
import { useIsTierAllowed, defaultConfig, getSplitIoBetaList } from './useIsTierAllowed'

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
  useTreatments: jest.fn().mockReturnValue({})
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
  getSplitIoBetaList: jest.fn(() => ['beta1', 'beta2', 'beta3'])
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
    const treatment = { treatment: 'control', config: null }
    const jwtPayload = { acx_account_vertical: 'MSP' }
    // eslint-disable-next-line max-len
    const accountVertical = defaultVerticals.includes(jwtPayload?.acx_account_vertical as AccountVertical)
      ? AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
    expect(accountVertical).toBe('MSP')

    const config = (treatment?.treatment === 'control')? defaultConfig : treatment?.config
    expect(config).toBe(defaultConfig)
  })

})

describe('getSplitIoBetaList', () => {
  it('returns the correct beta list', () => {
    const useFFList = jest.fn(() => JSON.stringify({
      betaList: ['beta1', 'beta2', 'beta3']
    }))

    const { result: res1 } = renderHook(() => useFFList())
    const { result: res2 } = renderHook(() => getSplitIoBetaList())
    expect(JSON.parse(res1.current)?.betaList).toEqual(res2.current)
    expect(res2.current).toEqual(['beta1', 'beta2', 'beta3'])
  })
})

