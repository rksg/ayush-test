import {
  IdentityProvider,
  IdentityProviderActionPayload,
  IdentityProviderActionType,
  NaiRealmAuthInfoEnum,
  NaiRealmAuthTypeTunneledEnum,
  NaiRealmEapMethodEnum,
  NaiRealmEcodingEnum
} from '@acx-ui/rc/utils'

import { IdentityProviderFormReducer } from './IdentityProviderFormReducer'



describe('IdentityProviderFormReducer test', () => {
  it('should update the policy name when NAME action is dispatched', () => {
    const initState = {} as IdentityProvider

    const action: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.NAME,
      payload: {
        name: 'policyNameId1'
      }
    }

    const updatedState = IdentityProviderFormReducer(initState, action )

    expect(updatedState).toEqual({
      ...initState,
      name: 'policyNameId1'
    })
  })

  it('should add the NaiRealms/Plmns/ROIs without initData when is dispatched', () => {
    const initState = {} as IdentityProvider

    // add REALM
    const AddRealmPayload = {
      name: 'realm1',
      encoding: NaiRealmEcodingEnum.UTF8,
      eaps: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Tunneled,
          tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
        }],
        rowId: 0
      }],
      rowId: 0
    }
    const addRealmAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_REALM,
      payload: AddRealmPayload
    }
    const addRealmState = IdentityProviderFormReducer(initState, addRealmAction )
    expect(addRealmState).toEqual({
      ...initState,
      naiRealms: [ AddRealmPayload ]
    })

    // Add PLMN
    const addPlmnPayload = { mcc: '333', mnc: '33', rowId: 2 }
    const addPlmnAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_PLMN,
      payload: addPlmnPayload
    }
    const addPlmnState = IdentityProviderFormReducer(initState, addPlmnAction)
    expect(addPlmnState).toEqual({
      ...initState,
      plmns: [ addPlmnPayload ]
    })

    // add ROI
    const addRoiPayload = { name: 'roi3', organizationId: '333333', rowId: 2 }
    const addRoiAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_ROI,
      payload: addRoiPayload
    }
    const addRoiState = IdentityProviderFormReducer(initState, addRoiAction)
    expect(addRoiState).toEqual({
      ...initState,
      roamConsortiumOIs: [addRoiPayload]
    })

  })

  it('should delete the NaiRealms/Plmns/ROIs without initData when is dispatched', () => {
    const initState = {} as IdentityProvider

    // delete REALM
    const delRealmAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_REALM,
      payload: { rowIds: [0] }
    }
    const delRealmState = IdentityProviderFormReducer(initState, delRealmAction )
    expect(delRealmState).toEqual({
      ...initState
    })

    // delete PLMN
    const delPlmnAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_PLMN,
      payload: { rowIds: [0] }
    }
    const delPlmnState = IdentityProviderFormReducer(initState, delPlmnAction)
    expect(delPlmnState).toEqual({
      ...initState
    })

    // delete ROI
    const delRoiAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_ROI,
      payload: { rowIds: [0] }
    }
    const delRoiState = IdentityProviderFormReducer(initState, delRoiAction)
    expect(delRoiState).toEqual({
      ...initState
    })
  })

  it('should add/update/delete the NaiRealms with data when is dispatched', () => {
    const initRealm1 = {
      name: 'ream11',
      encoding: NaiRealmEcodingEnum.UTF8,
      rowId: 0
    }

    const initRealm2 = {
      name: 'ream12',
      encoding: NaiRealmEcodingEnum.RFC4282,
      rowId: 1
    }

    const initState = {
      name: 'test1',
      naiRealms: [initRealm1, initRealm2]
    } as IdentityProvider

    // Add REALM
    const addRealmPayload = {
      name: 'realm1',
      encoding: NaiRealmEcodingEnum.UTF8,
      eaps: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Tunneled,
          tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
        }],
        rowId: 0
      }],
      rowId: 2
    }
    const addAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_REALM,
      payload: addRealmPayload
    }
    const addRealmState = IdentityProviderFormReducer(initState, addAction)
    expect(addRealmState).toEqual({
      ...initState,
      naiRealms: [initRealm1, initRealm2, addRealmPayload]
    })

    // Edit REALM
    const editNaiRealmPayload = {
      name: 'realm1-edit',
      encoding: NaiRealmEcodingEnum.RFC4282,
      eaps: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Tunneled,
          tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
        }],
        rowId: 0
      }],
      rowId: 0
    }
    const editAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.UPDATE_REALM,
      payload: editNaiRealmPayload
    }
    const updatedRealmState = IdentityProviderFormReducer(initState, editAction)
    expect(updatedRealmState).toEqual({
      ...initState,
      naiRealms: [ editNaiRealmPayload, initRealm2 ]
    })

    // Delete REALM
    const deleteAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_REALM,
      payload: {
        rowIds: [0, 1]
      }
    }
    const deleteRealmState = IdentityProviderFormReducer(initState, deleteAction)
    expect(deleteRealmState).toEqual({
      ...initState,
      naiRealms: []
    })

  })

  it('should add/update/delete the Plmns with data when is dispatched', () => {
    const initPlmn1 = { mcc: '000', mnc: '001', rowId: 0 }
    const initPlmn2 = { mcc: '002', mnc: '002', rowId: 1 }
    const initState = {
      name: 'test1',
      naiRealms: [{
        name: 'realm1',
        encoding: NaiRealmEcodingEnum.UTF8,
        rowId: 0
      }],
      plmns: [ initPlmn1, initPlmn2 ]
    } as IdentityProvider

    // Add PLMN
    const addPayload = { mcc: '333', mnc: '33', rowId: 2 }
    const addAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_PLMN,
      payload: addPayload
    }
    const addState = IdentityProviderFormReducer(initState, addAction)
    expect(addState).toEqual({
      ...initState,
      plmns: [initPlmn1, initPlmn2, addPayload]
    })

    // Edit PLMN
    const editPayload = { mcc: '005', mnc: '005', rowId: 0 }
    const editAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.UPDATE_PLMN,
      payload: editPayload
    }
    const updatedState = IdentityProviderFormReducer(initState, editAction)
    expect(updatedState).toEqual({
      ...initState,
      plmns: [ editPayload, initPlmn2 ]
    })

    // Delete PLMN
    const deleteAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_PLMN,
      payload: {
        rowIds: [0, 1]
      }
    }
    const deleteState = IdentityProviderFormReducer(initState, deleteAction)
    expect(deleteState).toEqual({
      ...initState,
      plmns: []
    })
  })

  it('should add/update/delete the ROIs with data when is dispatched', () => {
    const initRoi1 = { name: 'roi1', organizationId: '000011', rowId: 0 }
    const initRoi2 = { name: 'roi2', organizationId: '1122334455', rowId: 1 }
    const initState = {
      name: 'test1',
      naiRealms: [{
        name: 'realm1',
        encoding: NaiRealmEcodingEnum.UTF8,
        rowId: 0
      }],
      roamConsortiumOIs: [ initRoi1, initRoi2 ]
    } as IdentityProvider

    // Add ROI
    const addPayload = { name: 'roi3', organizationId: '333333', rowId: 2 }
    const addAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ADD_ROI,
      payload: addPayload
    }
    const addState = IdentityProviderFormReducer(initState, addAction)
    expect(addState).toEqual({
      ...initState,
      roamConsortiumOIs: [initRoi1, initRoi2, addPayload]
    })

    // Edit ROI
    const editPayload = { name: 'roi-edit', organizationId: '555666', rowId: 0 }
    const editAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.UPDATE_ROI,
      payload: editPayload
    }
    const updatedState = IdentityProviderFormReducer(initState, editAction)
    expect(updatedState).toEqual({
      ...initState,
      roamConsortiumOIs: [ editPayload, initRoi2 ]
    })

    // Delete ROI
    const deleteAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.DELETE_ROI,
      payload: {
        rowIds: [0, 1]
      }
    }
    const deleteState = IdentityProviderFormReducer(initState, deleteAction)
    expect(deleteState).toEqual({
      ...initState,
      roamConsortiumOIs: []
    })
  })

  it('should update the radius with data when is dispatched', () => {
    const initState = {} as IdentityProvider

    // Update Auth Radius
    const authRadiusAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.AUTH_RADIUS_ID,
      payload: {
        authRadiusId: 'authRadiusId'
      }
    }
    const updatedAuthState = IdentityProviderFormReducer(initState, authRadiusAction )
    expect(updatedAuthState).toEqual({
      ...initState,
      authRadiusId: 'authRadiusId'
    })

    // Update Accounting Radius enabled
    const enableAccAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ACCOUNT_RADIUS_ENABLED,
      payload: {
        accountingRadiusEnabled: true
      }
    }
    const updatedAccountingEnabledState = IdentityProviderFormReducer(initState, enableAccAction)
    expect(updatedAccountingEnabledState).toEqual({
      ...initState,
      accountingRadiusEnabled: true
    })

    // Update Accounting Radius
    const accountingRadiusAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.ACCOUNT_RADIUS_ID,
      payload: {
        accountingRadiusId: 'accountingRadiusId'
      }
    }
    const updatedAccountingState = IdentityProviderFormReducer(initState, accountingRadiusAction)
    expect(updatedAccountingState).toEqual({
      ...initState,
      accountingRadiusId: 'accountingRadiusId'
    })
  })

  it('should update state from the getting API data when is dispatched', () => {
    const initState = {} as IdentityProvider
    const eap = {
      method: NaiRealmEapMethodEnum.PEAP,
      authInfos: [{
        info: NaiRealmAuthInfoEnum.Tunneled,
        tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
      }]
    }
    const realm = {
      name: 'realm1',
      encoding: NaiRealmEcodingEnum.UTF8,
      eaps: [eap]
    }
    const plmn = { mcc: '000', mnc: '001' }
    const roi = { name: 'roi1', organizationId: '000011' }
    const apiData = {
      name: 'test1',
      naiRealms: [realm],
      plmns: [plmn],
      roamConsortiumOIs: [roi]
    } as IdentityProvider

    const roadingAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.UPDATE_STATE,
      payload: { state: apiData }
    }
    const updatedState = IdentityProviderFormReducer(initState, roadingAction)
    expect(updatedState).toEqual({
      ...initState,
      name: 'test1',
      naiRealms: [realm],
      plmns: [plmn],
      roamConsortiumOIs: [roi]
    })
  })

  it('should update state with the loaded preconfigured data when is dispatched', () => {
    const realm = {
      name: 'realm1',
      encoding: NaiRealmEcodingEnum.UTF8,
      eaps: [{
        method: NaiRealmEapMethodEnum.PEAP,
        authInfos: [{
          info: NaiRealmAuthInfoEnum.Tunneled,
          tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
        }]
      }]
    }
    const initState = {
      name: 'test1',
      naiRealms: [realm],
      plmns: [{ mcc: '000', mnc: '001' }],
      roamConsortiumOIs: [{ name: 'roi1', organizationId: '000011' }]
    } as IdentityProvider


    const preRealm = {
      name: 'preRealm1',
      encoding: NaiRealmEcodingEnum.UTF8,
      eaps: []
    }
    const prePlmn = { mcc: '111', mnc: '111' }
    const preRoi = { name: 'preRoi1', organizationId: '111111' }
    const preconfiguredIdp = {
      name: 'preconfiguredIdp1',
      naiRealms: [preRealm],
      plmns: [prePlmn],
      roamConsortiumOIs: [preRoi]
    } as IdentityProvider

    const roadingAction: IdentityProviderActionPayload = {
      type: IdentityProviderActionType.LOAD_PRECONFIGURED,
      payload: { state: preconfiguredIdp }
    }
    const updatedState = IdentityProviderFormReducer(initState, roadingAction)
    expect(updatedState).toEqual({
      ...initState,
      name: 'test1',
      naiRealms: [preRealm],
      plmns: [prePlmn],
      roamConsortiumOIs: [preRoi]
    })

  })
})