import {
  ApSnmpActionPayload,
  ApSnmpActionType,
  ApSnmpPolicy,
  SnmpV2Agent,
  SnmpV3Agent
} from '@acx-ui/rc/utils'

import { mockSnmpV2Agents, mockSnmpV3Agents } from './__tests__/fixtures'
import { SnmpAgentFormReducer }               from './SnmpAgentFormReducer'


describe('SnmpAgentFormReducer test', () => {
  it('should update the policy name when NAME action is dispatched', () => {
    const initState = {} as ApSnmpPolicy

    const action: ApSnmpActionPayload = {
      type: ApSnmpActionType.NAME,
      payload: {
        name: 'policyName1'
      }
    }

    const updatedState = SnmpAgentFormReducer(initState, action)

    expect(updatedState).toEqual({
      ...initState,
      policyName: 'policyName1'
    })
  })

  it('should add the SnmpV2/SnmpV3 agnet without initData when is dispatched', () => {
    const initState = {} as ApSnmpPolicy

    // add a SnmpV2
    const AddSnmpv2Payload = mockSnmpV2Agents[0]
    const addSnmpV2Action: ApSnmpActionPayload = {
      type: ApSnmpActionType.ADD_SNMP_V2,
      payload: AddSnmpv2Payload
    }
    const addSnmpV2State = SnmpAgentFormReducer(initState, addSnmpV2Action )
    expect(addSnmpV2State).toEqual({
      ...initState,
      snmpV2Agents: [ AddSnmpv2Payload ]
    })

    // Add SnmpV3
    const addSnmpV3Payload = mockSnmpV3Agents[0]
    const addSnmpV3Action: ApSnmpActionPayload = {
      type: ApSnmpActionType.ADD_SNMP_V3,
      payload: addSnmpV3Payload
    }
    const addSnmpV3State = SnmpAgentFormReducer(initState, addSnmpV3Action)
    expect(addSnmpV3State).toEqual({
      ...initState,
      snmpV3Agents: [ addSnmpV3Payload ]
    })

  })

  it('should delete the SnmpV2/SnmpV3 agnet without initData when is dispatched', () => {
    const initState = {} as ApSnmpPolicy

    // delete SnmpV2
    const delRealmAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.DELETE_SNMP_V2,
      payload: { names: ['123'] }
    }
    const delRealmState = SnmpAgentFormReducer(initState, delRealmAction )
    expect(delRealmState).toEqual({
      ...initState
    })

    // delete SnmpV3
    const delPlmnAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.DELETE_SNMP_V3,
      payload: { names: ['ttt'] }
    }
    const delPlmnState = SnmpAgentFormReducer(initState, delPlmnAction)
    expect(delPlmnState).toEqual({
      ...initState
    })
  })

  it('should add/update/delete the SnmpV2 with data when is dispatched', () => {
    const initState = {
      policyName: 'test1',
      snmpV2Agents: [ mockSnmpV2Agents[0] ],
      snmpV3Agents: []
    } as ApSnmpPolicy

    // Add a SnmpV2 agent
    const addSnmpV2Payload = mockSnmpV2Agents[1]
    const addAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.ADD_SNMP_V2,
      payload: addSnmpV2Payload
    }
    const addSnmpV2State = SnmpAgentFormReducer(initState, addAction)
    expect(addSnmpV2State).toEqual({
      ...initState,
      snmpV2Agents: mockSnmpV2Agents
    })

    const initState_2 = {
      policyName: 'test1',
      snmpV2Agents: mockSnmpV2Agents,
      snmpV3Agents: []
    } as ApSnmpPolicy

    // Edit SnmpV2
    const editSnmpV2Payload = {
      ...mockSnmpV2Agents[0],
      communityName: 'cn1-edited'
    } as SnmpV2Agent

    const editAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.UPDATE_SNMP_V2,
      payload: { ...editSnmpV2Payload, editIndex: 0 }
    }
    const updatedSnmpV2State = SnmpAgentFormReducer(initState_2, editAction)

    expect(updatedSnmpV2State).toEqual({
      ...initState,
      snmpV2Agents: [ editSnmpV2Payload, mockSnmpV2Agents[1] ]
    })

    // Delete SnmpV2
    const deleteAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.DELETE_SNMP_V2,
      payload: {
        names: ['joe_cn1', 'joe_cn2']
      }
    }
    const deleteSnmpV2State = SnmpAgentFormReducer(initState_2, deleteAction)
    expect(deleteSnmpV2State).toEqual({
      ...initState,
      snmpV2Agents: []
    })
  })

  it('should add/update/delete the SnmpV3 with data when is dispatched', () => {
    const initState = {
      policyName: 'test1',
      snmpV2Agents: [],
      snmpV3Agents: [ mockSnmpV3Agents[0] ]
    } as ApSnmpPolicy

    // Add PLMN
    const addPayload = mockSnmpV3Agents[1]
    const addAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.ADD_SNMP_V3,
      payload: addPayload
    }
    const addState = SnmpAgentFormReducer(initState, addAction)
    expect(addState).toEqual({
      ...initState,
      snmpV3Agents: mockSnmpV3Agents
    })

    const initState_2 = {
      policyName: 'test1',
      snmpV2Agents: [],
      snmpV3Agents: mockSnmpV3Agents
    } as ApSnmpPolicy

    // Edit PLMN
    const editPayload = {
      ...mockSnmpV3Agents[0],
      userName: 'un1-edited'
    } as SnmpV3Agent

    const editAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.UPDATE_SNMP_V3,
      payload: { ...editPayload, editIndex: 0 }
    }
    const updatedState = SnmpAgentFormReducer(initState_2, editAction)
    expect(updatedState).toEqual({
      ...initState,
      snmpV3Agents: [ editPayload, mockSnmpV3Agents[1] ]
    })

    // Delete PLMN
    const deleteAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.DELETE_SNMP_V3,
      payload: {
        names: ['joe_un1', 'joe_un2']
      }
    }
    const deleteState = SnmpAgentFormReducer(initState, deleteAction)
    expect(deleteState).toEqual({
      ...initState,
      snmpV3Agents: []
    })

  })

  it('should update state from the getting API data when is dispatched', () => {
    const initState = {} as ApSnmpPolicy

    const apiData = {
      policyName: 'joe_snmp',
      snmpV2Agents: mockSnmpV2Agents,
      snmpV3Agents: mockSnmpV3Agents
    } as ApSnmpPolicy

    const roadingAction: ApSnmpActionPayload = {
      type: ApSnmpActionType.UPDATE_STATE,
      payload: { state: apiData }
    }
    const updatedState = SnmpAgentFormReducer(initState, roadingAction)
    expect(updatedState).toEqual({
      ...initState,
      ...apiData
    })
  })
})