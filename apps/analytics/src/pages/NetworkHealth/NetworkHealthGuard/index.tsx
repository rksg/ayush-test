import React, { useEffect, useRef } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { Loader, showToast } from '@acx-ui/components'
import { useNavigateToPath } from '@acx-ui/react-router-dom'
import { getIntl }           from '@acx-ui/utils'

import { messageMapping }                             from '../contents'
import { useNetworkHealthSpec, useNetworkHealthTest } from '../services'
// import { TypedUseQueryHookResult } from '@reduxjs/toolkit/dist/query/react'

export function showAlertAndNavigateAway (
  navigateToList: () => void,
  showedToast: React.MutableRefObject<boolean>,
  toastContent: MessageDescriptor
) {
  const { $t } = getIntl()
  if (showedToast.current) return
  showedToast.current = true

  showToast({
    type: 'error',
    content: $t(toastContent)
  })
  navigateToList()
}

function genNetworkHealthGuard (
  // TODO: change type of useQueryFn when RTK query expose proper type for useQuery
  // useQueryFn: TypedUseQueryHookResult<unknown, unknown, typeof baseQuery>,
  useQueryFn: typeof useNetworkHealthSpec | typeof useNetworkHealthTest,
  toastContent: MessageDescriptor
) {
  const NetworkHealthGuard = (props: React.PropsWithChildren) => {
    const { $t } = useIntl()
    const queryResults = (useQueryFn as typeof useNetworkHealthSpec | typeof useNetworkHealthTest)()
    const navigateToList = useNavigateToPath('/serviceValidation/networkHealth')
    const showedToast = useRef(false)

    useEffect(() => {
      if (queryResults.isUninitialized || !queryResults.isSuccess) return
      if (queryResults.data) return

      showAlertAndNavigateAway(navigateToList, showedToast, toastContent)
    }, [$t, navigateToList, queryResults])

    return <Loader states={[queryResults]}>
      {queryResults.data ? props.children : null}
    </Loader>
  }
  return NetworkHealthGuard
}

export const NetworkHealthTestGuard =
  genNetworkHealthGuard(useNetworkHealthTest, messageMapping.TEST_NOT_FOUND)

export const NetworkHealthSpecGuard =
  genNetworkHealthGuard(useNetworkHealthSpec, messageMapping.SPEC_NOT_FOUND)
