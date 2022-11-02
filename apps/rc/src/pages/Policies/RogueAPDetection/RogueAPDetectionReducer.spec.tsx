import {
  RogueAPDetectionActionPayload,
  RogueAPDetectionActionTypes,
  RogueAPDetectionContextType, RogueCategory, RogueRuleType
} from '@acx-ui/rc/utils'

import { rogueAPDetectionReducer } from './RogueAPDetectionReducer'

describe('RogueAPDetectionReducer test', () => {
  it('should update the policy name when POLICYNAME action is dispatched', () => {
    const initState = {} as RogueAPDetectionContextType

    const action = {
      type: RogueAPDetectionActionTypes.POLICYNAME,
      payload: {
        policyName: 'policyNameId1'
      }
    }

    const updatedState = rogueAPDetectionReducer(initState, action as RogueAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      policyName: 'policyNameId1'
    })
  })
  it('should update the tags data when TAGS action is dispatched', () => {
    const initState = {} as RogueAPDetectionContextType

    const action = {
      type: RogueAPDetectionActionTypes.TAGS,
      payload: {
        tags: ['tag1', 'tag2', 'tag3']
      }
    }

    const updatedState = rogueAPDetectionReducer(initState, action as RogueAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      tags: ['tag1', 'tag2', 'tag3']
    })
  })
  it('should update the rule when RULE related action is dispatched', () => {
    const initState = {} as RogueAPDetectionContextType

    const action = {
      type: RogueAPDetectionActionTypes.ADD_RULE,
      payload: {
        rule: {
          name: 'rule1',
          type: RogueRuleType.AD_HOC_RULE,
          classification: RogueCategory.MALICIOUS
        }
      }
    }

    const updatedState = rogueAPDetectionReducer(initState, action as RogueAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      rules: [{
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }]
    })

    const addNextAction = {
      type: RogueAPDetectionActionTypes.ADD_RULE,
      payload: {
        rule: {
          name: 'rule2',
          type: RogueRuleType.AD_HOC_RULE,
          classification: RogueCategory.MALICIOUS
        }
      }
    }

    // eslint-disable-next-line max-len
    const updatedAddState = rogueAPDetectionReducer(updatedState, addNextAction as RogueAPDetectionActionPayload)

    expect(updatedAddState).toEqual({
      ...updatedState,
      rules: [{
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateNextAction = {
      type: RogueAPDetectionActionTypes.UPDATE_RULE,
      payload: {
        rule: {
          name: 'rule2-modify',
          type: RogueRuleType.AD_HOC_RULE,
          classification: RogueCategory.MALICIOUS,
          priority: 2
        }
      }
    }

    // eslint-disable-next-line max-len
    const updatedUpdateState = rogueAPDetectionReducer(updatedAddState, updateNextAction as RogueAPDetectionActionPayload)

    expect(updatedUpdateState).toEqual({
      ...updatedAddState,
      rules: [{
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2-modify',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateMoveUpAction = {
      type: RogueAPDetectionActionTypes.MOVE_UP,
      payload: {
        name: 'rule2-modify',
        priority: 2
      }
    }

    // eslint-disable-next-line max-len
    const updatedMoveUpState = rogueAPDetectionReducer(updatedUpdateState, updateMoveUpAction as RogueAPDetectionActionPayload)

    expect(updatedMoveUpState).toEqual({
      ...updatedUpdateState,
      rules: [{
        name: 'rule2-modify',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateMoveDownAction = {
      type: RogueAPDetectionActionTypes.MOVE_DOWN,
      payload: {
        name: 'rule2-modify',
        priority: 1
      }
    }

    // eslint-disable-next-line max-len
    const updatedMoveDownState = rogueAPDetectionReducer(updatedMoveUpState, updateMoveDownAction as RogueAPDetectionActionPayload)

    expect(updatedMoveDownState).toEqual({
      ...updatedMoveUpState,
      rules: [{
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2-modify',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateDelAction = {
      type: RogueAPDetectionActionTypes.DEL_RULE,
      payload: {
        name: 'rule2-modify'
      }
    }

    // eslint-disable-next-line max-len
    const updatedDelState = rogueAPDetectionReducer(updatedMoveDownState, updateDelAction as RogueAPDetectionActionPayload)

    expect(updatedDelState).toEqual({
      ...updatedMoveDownState,
      rules: [{
        name: 'rule1',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }]
    })

    const updateEntireAction = {
      type: RogueAPDetectionActionTypes.UPDATE_ENTIRE_RULE,
      payload: {
        rules: [{
          name: 'rule1-entire',
          type: RogueRuleType.AD_HOC_RULE,
          classification: RogueCategory.MALICIOUS,
          priority: 1
        }, {
          name: 'rule2-entire',
          type: RogueRuleType.AD_HOC_RULE,
          classification: RogueCategory.MALICIOUS,
          priority: 2
        }]
      }
    }

    // eslint-disable-next-line max-len
    const updatedEntireState = rogueAPDetectionReducer(updatedDelState, updateEntireAction as RogueAPDetectionActionPayload)

    expect(updatedEntireState).toEqual({
      ...updatedDelState,
      rules: [{
        name: 'rule1-entire',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2-entire',
        type: RogueRuleType.AD_HOC_RULE,
        classification: RogueCategory.MALICIOUS,
        priority: 2
      }]
    })
  })
  it('should update the venue when VENUE related action is dispatched', () => {
    const initState = {} as RogueAPDetectionContextType

    const action = {
      type: RogueAPDetectionActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    }

    const updatedState = rogueAPDetectionReducer(initState, action as RogueAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })

    const addAction = {
      type: RogueAPDetectionActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedAddVenueState = rogueAPDetectionReducer(updatedState, addAction as RogueAPDetectionActionPayload)

    expect(updatedAddVenueState).toEqual({
      ...updatedState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      },{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    })

    const removeAction = {
      type: RogueAPDetectionActionTypes.REMOVE_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedRemoveVenueState = rogueAPDetectionReducer(updatedAddVenueState, removeAction as RogueAPDetectionActionPayload)

    expect(updatedRemoveVenueState).toEqual({
      ...updatedAddVenueState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })
  })
  it('do nothing when undefined action is dispatched', () => {
    const initState = {} as RogueAPDetectionContextType

    const action = {
      type: 'undefined',
      payload: {
        tags: ['tag1', 'tag2', 'tag3']
      }
    }

    const updatedState = rogueAPDetectionReducer(initState, action as RogueAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
})
