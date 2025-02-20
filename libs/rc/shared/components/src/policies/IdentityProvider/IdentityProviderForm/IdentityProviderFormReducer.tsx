import {
  IdentityProvider,
  IdentityProviderActionPayload,
  IdentityProviderActionType
} from '@acx-ui/rc/utils'

import { updateRowIds } from '../utils'


export const IdentityProviderFormReducer = (
  state: IdentityProvider, action: IdentityProviderActionPayload
): IdentityProvider => {
  switch (action.type) {
    case IdentityProviderActionType.NAME:
      return {
        ...state,
        name: action.payload.name
      }
    case IdentityProviderActionType.ADD_REALM:
      if (!state.naiRealms) {
        return {
          ...state,
          naiRealms: [
            action.payload
          ]
        }
      }
      return {
        ...state,
        naiRealms: [
          ...state.naiRealms,
          action.payload
        ]
      }
    case IdentityProviderActionType.UPDATE_REALM:
      return {
        ...state,
        naiRealms: state.naiRealms.map((value, index) => {
          const { rowId } = action.payload
          if (index === rowId) {
            const { name, encoding, eaps } = action.payload
            return { name, encoding, eaps, rowId }
          }
          return value
        })
      }
    case IdentityProviderActionType.DELETE_REALM:
      if (state.naiRealms) {
        const rowIds = action.payload.rowIds
        const filteredRealms = state.naiRealms.filter(r => rowIds.indexOf(r.rowId!) === -1)

        return {
          ...state,
          naiRealms: [...updateRowIds(filteredRealms)]
        }
      }
      return {
        ...state
      }
    case IdentityProviderActionType.ADD_PLMN:
      if (!state.plmns) {
        return {
          ...state,
          plmns: [
            action.payload
          ]
        }
      }
      return {
        ...state,
        plmns: [
          ...state.plmns,
          action.payload
        ]
      }
    case IdentityProviderActionType.UPDATE_PLMN:
      return {
        ...state,
        plmns: state.plmns?.map((value, index) => {
          const { rowId } = action.payload
          if (index === rowId) {
            const { mcc, mnc } = action.payload
            return { mcc, mnc, rowId }
          }
          return value
        })
      }
    case IdentityProviderActionType.DELETE_PLMN:
      if (state.plmns) {
        const rowIds = action.payload.rowIds
        const filteredPlmns = state.plmns.filter(r => rowIds.indexOf(r.rowId!) === -1)

        return {
          ...state,
          plmns: [...updateRowIds(filteredPlmns)]
        }
      }
      return {
        ...state
      }
    case IdentityProviderActionType.ADD_ROI:
      if (!state.roamConsortiumOIs) {
        return {
          ...state,
          roamConsortiumOIs: [
            action.payload
          ]
        }
      }
      return {
        ...state,
        roamConsortiumOIs: [
          ...state.roamConsortiumOIs,
          action.payload
        ]
      }
    case IdentityProviderActionType.UPDATE_ROI:
      return {
        ...state,
        roamConsortiumOIs: state.roamConsortiumOIs?.map((value, index) => {
          const { rowId } = action.payload
          if (index === rowId) {
            const { name, organizationId } = action.payload
            return { name, organizationId, rowId }
          }
          return value
        })
      }
    case IdentityProviderActionType.DELETE_ROI:
      if (state.roamConsortiumOIs) {
        const rowIds = action.payload.rowIds
        const filteredOIs = state.roamConsortiumOIs.filter(r => rowIds.indexOf(r.rowId!) === -1)

        return {
          ...state,
          roamConsortiumOIs: [...updateRowIds(filteredOIs)]
        }
      }
      return {
        ...state
      }
    case IdentityProviderActionType.AUTH_RADIUS_ID:
      return {
        ...state,
        authRadiusId: action.payload.authRadiusId
      }
    case IdentityProviderActionType.ACCOUNT_RADIUS_ENABLED:
      return {
        ...state,
        accountingRadiusEnabled: action.payload.accountingRadiusEnabled
      }
    case IdentityProviderActionType.ACCOUNT_RADIUS_ID:
      return {
        ...state,
        accountingRadiusId: action.payload.accountingRadiusId
      }
    case IdentityProviderActionType.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
    case IdentityProviderActionType.LOAD_PRECONFIGURED:
      const { naiRealms=[], plmns=[], roamConsortiumOIs=[] } = action.payload.state
      return {
        ...state,
        naiRealms,
        plmns,
        roamConsortiumOIs
      }
  }
}
