import { WifiCallingFormContextType } from '@acx-ui/rc/utils'

const WifiCallingFormValidate = (state: WifiCallingFormContextType): WifiCallingFormContextType => {
  if (state.description === '' || (state.description && state.description.length < 2)) {
    delete state.description
  }
  return {
    ...state,
    epdgs: state.ePDG || []
  }
}

export default WifiCallingFormValidate
