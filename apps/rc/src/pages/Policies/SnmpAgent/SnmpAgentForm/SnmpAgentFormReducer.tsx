
import {
  ApSnmpActionPayload,
  ApSnmpActionType,
  ApSnmpPolicy
} from '@acx-ui/rc/utils'

export const SnmpAgentFormReducer = (
  state: ApSnmpPolicy, action: ApSnmpActionPayload
): ApSnmpPolicy => {
  switch (action.type) {
    case ApSnmpActionType.NAME:
      return {
        ...state,
        policyName: action.payload.name
      }
    case ApSnmpActionType.ADD_SNMP_V2:
      if (!state.snmpV2Agents) {
        return {
          ...state,
          snmpV2Agents: [
            action.payload
          ]
        }
      }
      return {
        ...state,
        snmpV2Agents: [
          ...state.snmpV2Agents,
          action.payload
        ]
      }
    case ApSnmpActionType.UPDATE_SNMP_V2:
      return {
        ...state,
        snmpV2Agents: state.snmpV2Agents.map((snmpv2) => {
          const { payload } = action
          if (snmpv2.communityName === payload.communityName) {
            return { ...payload }
          }
          return snmpv2
        })
      }
    case ApSnmpActionType.DELETE_SNMP_V2:
      if (state.snmpV2Agents) {
        const { names } = action.payload

        return {
          ...state,
          snmpV2Agents: state.snmpV2Agents.filter(s => !names.includes(s.communityName))
        }
      }
      return {
        ...state
      }
    case ApSnmpActionType.ADD_SNMP_V3:
      if (!state.snmpV3Agents) {
        return {
          ...state,
          snmpV3Agents: [
            action.payload
          ]
        }
      }
      return {
        ...state,
        snmpV3Agents: [
          ...state.snmpV3Agents,
          action.payload
        ]
      }
    case ApSnmpActionType.UPDATE_SNMP_V3:
      return {
        ...state,
        snmpV3Agents: state.snmpV3Agents.map((snmpv3) => {
          const { payload } = action
          if (snmpv3.userName === payload.userName) {
            return { ...payload }
          }
          return snmpv3
        })
      }
    case ApSnmpActionType.DELETE_SNMP_V3:
      if (state.snmpV3Agents) {
        const { names } = action.payload

        return {
          ...state,
          snmpV3Agents: state.snmpV3Agents.filter(s => !names.includes(s.userName))
        }
      }
      return {
        ...state
      }
    case ApSnmpActionType.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
  }
}