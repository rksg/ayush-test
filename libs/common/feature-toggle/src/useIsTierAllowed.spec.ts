import { AccountType } from '@acx-ui/utils'

import { Features }         from './features'
import { useIsTierAllowed } from './useIsTierAllowed'

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

describe('Test useIsTierAllowed function', () => {
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
    const enabled = useIsTierAllowed(Features.EDGES)
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
    const enabled = useIsTierAllowed(Features.EDGES)
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
    const enabled = useIsTierAllowed(Features.EDGES)
    expect(enabled).toBeFalsy()
  })
})