import { Provider as ReduxProvider, ProviderProps } from 'react-redux'

import { store } from './store'

export function Provider (props: Omit<ProviderProps, 'store'>) {
  return <ReduxProvider {...props} store={store} />
}
