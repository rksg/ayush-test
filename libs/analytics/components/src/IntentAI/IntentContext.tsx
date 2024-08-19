import { createContext, useContext } from 'react'

import { EnhancedIntent, IntentKPIConfig } from './IntentAIForm/services'

type IIntentContext = {
  intent: EnhancedIntent
  kpis: IntentKPIConfig[]
}

export const IntentContext = createContext({} as IIntentContext)
export const useIntentContext = () => useContext(IntentContext)

export function withIntent <Props> (Component: React.ComponentType<Props & IIntentContext>) {
  return (props: Props) => {
    const context = useIntentContext()
    return <Component {...props} {...context} />
  }
}
