import { createContext } from 'react'

import { IdentityProvider, IdentityProviderActionPayload } from '@acx-ui/rc/utils'

import { IdentityProviderFormReducer } from './IdentityProviderFormReducer'


const IdentityProviderFormContext = createContext<{
  state: IdentityProvider,
  dispatch: React.Dispatch<IdentityProviderActionPayload>
}>({
  state: {} as IdentityProvider,
  dispatch: () => {}
})

export const mainReducer = (
  state: IdentityProvider,
  action: IdentityProviderActionPayload
): IdentityProvider => {
  return IdentityProviderFormReducer(state, action)
}



export default IdentityProviderFormContext