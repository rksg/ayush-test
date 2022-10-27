import {
  RougeAPDetectionActionPayload,
  RougeAPDetectionActionTypes,
  RougeAPDetectionContextType, RougeCategory, RougeRuleType
} from '@acx-ui/rc/utils'

import { rougeAPDetectionReducer } from './RougeAPDetectionReducer'

describe('RougeAPDetectionReducer test', () => {
  it('should update the policy name when POLICYNAME action is dispatched', () => {
    const initState = {} as RougeAPDetectionContextType

    const action = {
      type: RougeAPDetectionActionTypes.POLICYNAME,
      payload: {
        policyName: 'policyNameId1'
      }
    }

    const updatedState = rougeAPDetectionReducer(initState, action as RougeAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      policyName: 'policyNameId1'
    })
  })
  it('should update the tags data when TAGS action is dispatched', () => {
    const initState = {} as RougeAPDetectionContextType

    const action = {
      type: RougeAPDetectionActionTypes.TAGS,
      payload: {
        tags: ['tag1', 'tag2', 'tag3']
      }
    }

    const updatedState = rougeAPDetectionReducer(initState, action as RougeAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      tags: ['tag1', 'tag2', 'tag3']
    })
  })
  it('should update the rule when RULE related action is dispatched', () => {
    const initState = {} as RougeAPDetectionContextType

    const action = {
      type: RougeAPDetectionActionTypes.ADD_RULE,
      payload: {
        rule: {
          name: 'rule1',
          type: RougeRuleType.AD_HOC_RULE,
          classification: RougeCategory.MALICIOUS
        }
      }
    }

    const updatedState = rougeAPDetectionReducer(initState, action as RougeAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      rules: [{
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }]
    })

    const addNextAction = {
      type: RougeAPDetectionActionTypes.ADD_RULE,
      payload: {
        rule: {
          name: 'rule2',
          type: RougeRuleType.AD_HOC_RULE,
          classification: RougeCategory.MALICIOUS
        }
      }
    }

    // eslint-disable-next-line max-len
    const updatedAddState = rougeAPDetectionReducer(updatedState, addNextAction as RougeAPDetectionActionPayload)

    expect(updatedAddState).toEqual({
      ...updatedState,
      rules: [{
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateNextAction = {
      type: RougeAPDetectionActionTypes.UPDATE_RULE,
      payload: {
        rule: {
          name: 'rule2-modify',
          type: RougeRuleType.AD_HOC_RULE,
          classification: RougeCategory.MALICIOUS,
          priority: 2
        }
      }
    }

    // eslint-disable-next-line max-len
    const updatedUpdateState = rougeAPDetectionReducer(updatedAddState, updateNextAction as RougeAPDetectionActionPayload)

    expect(updatedUpdateState).toEqual({
      ...updatedAddState,
      rules: [{
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2-modify',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateMoveUpAction = {
      type: RougeAPDetectionActionTypes.MOVE_UP,
      payload: {
        name: 'rule2-modify',
        priority: 2
      }
    }

    // eslint-disable-next-line max-len
    const updatedMoveUpState = rougeAPDetectionReducer(updatedUpdateState, updateMoveUpAction as RougeAPDetectionActionPayload)

    expect(updatedMoveUpState).toEqual({
      ...updatedUpdateState,
      rules: [{
        name: 'rule2-modify',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateMoveDownAction = {
      type: RougeAPDetectionActionTypes.MOVE_DOWN,
      payload: {
        name: 'rule2-modify',
        priority: 1
      }
    }

    // eslint-disable-next-line max-len
    const updatedMoveDownState = rougeAPDetectionReducer(updatedMoveUpState, updateMoveDownAction as RougeAPDetectionActionPayload)

    expect(updatedMoveDownState).toEqual({
      ...updatedMoveUpState,
      rules: [{
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }, {
        name: 'rule2-modify',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 2
      }]
    })

    const updateDelAction = {
      type: RougeAPDetectionActionTypes.DEL_RULE,
      payload: {
        name: 'rule2-modify'
      }
    }

    // eslint-disable-next-line max-len
    const updatedDelState = rougeAPDetectionReducer(updatedMoveDownState, updateDelAction as RougeAPDetectionActionPayload)

    expect(updatedDelState).toEqual({
      ...updatedMoveDownState,
      rules: [{
        name: 'rule1',
        type: RougeRuleType.AD_HOC_RULE,
        classification: RougeCategory.MALICIOUS,
        priority: 1
      }]
    })
  })
  it('should update the venue when VENUE related action is dispatched', () => {
    const initState = {} as RougeAPDetectionContextType

    const action = {
      type: RougeAPDetectionActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    }

    const updatedState = rougeAPDetectionReducer(initState, action as RougeAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })

    const addAction = {
      type: RougeAPDetectionActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedAddVenueState = rougeAPDetectionReducer(updatedState, addAction as RougeAPDetectionActionPayload)

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
      type: RougeAPDetectionActionTypes.REMOVE_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedRemoveVenueState = rougeAPDetectionReducer(updatedAddVenueState, removeAction as RougeAPDetectionActionPayload)

    expect(updatedRemoveVenueState).toEqual({
      ...updatedAddVenueState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })
  })
  it('do nothing when undefined action is dispatched', () => {
    const initState = {} as RougeAPDetectionContextType

    const action = {
      type: 'undefined',
      payload: {
        tags: ['tag1', 'tag2', 'tag3']
      }
    }

    const updatedState = rougeAPDetectionReducer(initState, action as RougeAPDetectionActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
})
