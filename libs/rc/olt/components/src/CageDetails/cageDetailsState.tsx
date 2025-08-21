import { createContext, useReducer, useContext, useMemo } from 'react'
import type { ReactNode, Dispatch }                       from 'react'

import {
  OntDetailsAction,
  DrawerKey,
  OntDetailsTabType,
  OltCage,
  OltOnt
} from '@acx-ui/olt/utils'

export interface CageDetailsState {
  cageDetails: OltCage
  selectedOnt?: OltOnt
  currentTab?: string
  drawers: Record<DrawerKey, boolean>
}

export const initialCageDetailsState: CageDetailsState = {
  cageDetails: {} as OltCage,
  selectedOnt: undefined,
  currentTab: undefined,
  drawers: {
    ontDetails: false,
    editOnt: false,
    manageOnts: false
  }
}

export function cageDetailsReducer (
  state: CageDetailsState,
  action: OntDetailsAction
): CageDetailsState {
  switch (action.type) {
    case 'SET_SELECTED_ONT':
      return { ...state, selectedOnt: action.payload }
    // case 'SET_CURRENT_TAB':
    //   return { ...state, currentTab: action.payload }
    case 'OPEN_DRAWER':
    case 'CLOSE_DRAWER':
      return {
        ...state,
        drawers: {
          ...state.drawers,
          [action.payload]: action.type === 'OPEN_DRAWER'
        }
      }
    // case 'CLOSE_ALL_DRAWERS':
    //   return {
    //     ...state,
    //     drawers: {
    //       ...state.drawers,
    //       ...initialCageDetailsState.drawers
    //     }
    //   }
    default:
      return state
  }
}

interface CageDetailsContextType {
  state: CageDetailsState
  dispatch: Dispatch<OntDetailsAction>
}

const CageDetailsContext = createContext<CageDetailsContextType | undefined>(undefined)

export const useCageDetails = () => {
  const context = useContext(CageDetailsContext)
  if (!context) throw new Error('useCageDetails must be used within a CageDetailsProvider')
  return context
}

export const CageDetailsProvider = ({
  children,
  cageDetails,
  initialTab
}: {
  children: ReactNode
  cageDetails: OltCage
  initialTab?: string
}) => {
  const [state, dispatch] = useReducer(cageDetailsReducer, {
    ...initialCageDetailsState,
    cageDetails,
    currentTab: initialTab ?? OntDetailsTabType.PANEL
  })

  return (
    <CageDetailsContext.Provider value={{ state, dispatch }}>
      {children}
    </CageDetailsContext.Provider>
  )
}

export const useDrawerActions = () => {
  const { dispatch } = useCageDetails()
  return useMemo(() => {
    const keys: DrawerKey[] = ['ontDetails', 'editOnt', 'manageOnts']
    return keys.reduce((acc, key) => {
      acc[`open${capitalize(key)}`] = () => dispatch({ type: 'OPEN_DRAWER', payload: key })
      acc[`close${capitalize(key)}`] = () => dispatch({ type: 'CLOSE_DRAWER', payload: key })
      return acc
    }, {} as Record<string, () => void>)
  }, [dispatch])
}

function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
