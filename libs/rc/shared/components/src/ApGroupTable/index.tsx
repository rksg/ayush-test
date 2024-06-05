import { createContext } from 'react'

import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ApGroupViewModel, NewApGroupViewModelExtended } from '@acx-ui/rc/utils'

import { ApGroupTableNonRbac } from './NonRbac'
import { ApGroupTableRbac }    from './Rbac'
import { ApGroupTableProps }   from './types'


export const ApGroupsTabContext = createContext({} as {
  setApGroupsCount: (data: number) => void
})

// eslint-disable-next-line max-len
export const ApGroupTable = (props: ApGroupTableProps<NewApGroupViewModelExtended | ApGroupViewModel>) => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  return isWifiRbacEnabled
    ? <ApGroupTableRbac {...(props as ApGroupTableProps<NewApGroupViewModelExtended>)} />
    : <ApGroupTableNonRbac {...(props as ApGroupTableProps<ApGroupViewModel>)} />
}