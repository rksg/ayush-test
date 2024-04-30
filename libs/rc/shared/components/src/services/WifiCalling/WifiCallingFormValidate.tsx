import { WifiCallingFormContextType } from '@acx-ui/rc/utils'

const WifiCallingFormValidate = (state: WifiCallingFormContextType): WifiCallingFormContextType => {
  if (state.description === '' || (state.description && state.description.length < 2)) {
    delete state.description
  }

  const epdgsList = state.ePDG.map(epdg => {
    if (epdg.ip === '') {
      return { domain: epdg.domain }
    }
    return epdg
  })

  return {
    ...state,
    epdgs: epdgsList || []
  }
}

export default WifiCallingFormValidate
