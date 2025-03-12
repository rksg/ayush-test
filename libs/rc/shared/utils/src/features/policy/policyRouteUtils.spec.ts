import { PolicyType, PolicyOperation } from '../../types'

import {
  getPolicyRoutePath,
  getPolicyDetailsLink,
  MacRegistrationDetailsTabKey
} from '.'

describe('policyRouteUtils', () => {
  it('getPolicyRoutePath - Returns correct path without activeTab', () => {
    expect(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE }))
      .toBe('policies/aaa/create')
  })

  it('getPolicyRoutePath - Returns correct path with activeTab', () => {
    expect(getPolicyRoutePath({
      type: PolicyType.MAC_REGISTRATION_LIST,
      oper: PolicyOperation.DETAIL
    })).toBe('policies/macRegistrationList/:policyId/detail/:activeTab')
  })

  it('getPolicyDetailsLink - Returns correct link without activeTab', () => {
    expect(getPolicyDetailsLink({
      type: PolicyType.AAA,
      oper: PolicyOperation.EDIT,
      policyId: 'myaaa'
    })).toBe('policies/aaa/myaaa/edit')
  })

  it('getPolicyDetailsLink - Returns correct link with activeTab', () => {
    expect(getPolicyDetailsLink({
      type: PolicyType.MAC_REGISTRATION_LIST,
      oper: PolicyOperation.DETAIL,
      policyId: 'mymac',
      activeTab: MacRegistrationDetailsTabKey.OVERVIEW
    })).toBe('policies/macRegistrationList/mymac/detail/overview')
  })
})
