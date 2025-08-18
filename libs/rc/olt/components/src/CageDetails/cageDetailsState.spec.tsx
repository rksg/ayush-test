import { OltFixtures } from '@acx-ui/olt/utils'

import { cageDetailsReducer } from './cageDetailsState'

const { mockOltCageList, mockOntList } = OltFixtures
describe('cageDetailsReducer', () => {
  const initState = {
    cageDetails: mockOltCageList[0],
    selectedOnt: mockOntList[0],
    currentTab: undefined,
    drawers: {
      ontDetails: false,
      editOnt: false,
      manageOnts: false
    }
  }

  it('should set selected ont correctly', () => {
    const state = cageDetailsReducer(initState, {
      type: 'SET_SELECTED_ONT', payload: mockOntList[1]
    })
    expect(state).not.toBe(initState)
    expect(state.selectedOnt).toBe(mockOntList[1])
    expect(state.drawers).toBe(initState.drawers)
  })

  it('should set current tab correctly', () => {
    const state = cageDetailsReducer(initState, {
      type: 'SET_CURRENT_TAB', payload: 'clients'
    })
    expect(state).not.toBe(initState)
    expect(state.currentTab).toBe('clients')
    expect(state.drawers).toBe(initState.drawers)
  })

  it('should open drawer correctly', () => {
    const state = cageDetailsReducer(initState, {
      type: 'OPEN_DRAWER', payload: 'ontDetails'
    })
    expect(state).not.toBe(initState)
    expect(state.drawers.ontDetails).toBe(true)
  })

  it('should handle undefined action type', () => {
    const state = cageDetailsReducer(initState, {
      type: 'UNDEFINED_ACTION', payload: mockOntList[1]
    })
    expect(state).toBe(initState)
    expect(state.selectedOnt).toBe(mockOntList[0])
    expect(state.drawers).toBe(initState.drawers)
  })

})