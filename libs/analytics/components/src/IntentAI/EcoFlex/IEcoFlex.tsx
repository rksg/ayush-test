import { defineMessage } from 'react-intl'

import { createIntentAIDetails } from './IntentAIDetails'
export { configuration, kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  action: {
    hasData: defineMessage({
      defaultMessage: `
        Leverage <b><i>Energy Saving</i></b>, available only through IntentAI for AI/ML based 
        Energy Saving Model for the network. In this mode, based on the usage pattern PowerSave 
        supported APs are switched to PowerSaving mode and resumed to normal power based on the
        increased network activity.
      ` }),
    noData: defineMessage({
      defaultMessage: `When activated, this Intent takes over 
      the automatic energy saving in the network.` })
  }
})
