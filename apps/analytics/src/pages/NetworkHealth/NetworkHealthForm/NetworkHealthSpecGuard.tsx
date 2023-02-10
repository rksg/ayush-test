import React, { useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showToast } from '@acx-ui/components'
import { useNavigateToPath } from '@acx-ui/react-router-dom'
import { getIntl }           from '@acx-ui/utils'

import { messageMapping }       from '../contents'
import { useNetworkHealthSpec } from '../services'

export function showAlertAndNavigateAway (
  navigateToList: () => void,
  showedToast: React.MutableRefObject<boolean>
) {
  const { $t } = getIntl()
  if (showedToast.current) return
  showedToast.current = true

  showToast({
    type: 'error',
    content: $t(messageMapping.SPEC_NOT_FOUND)
  })
  navigateToList()
}

export function NetworkHealthSpecGuard (props: React.PropsWithChildren) {
  const { $t } = useIntl()
  const spec = useNetworkHealthSpec()
  const navigateToList = useNavigateToPath('/serviceValidation/networkHealth')
  const showedToast = useRef(false)

  useEffect(() => {
    if (spec.isUninitialized || !spec.isSuccess) return
    if (spec.data) return

    showAlertAndNavigateAway(navigateToList, showedToast)
  }, [$t, navigateToList, spec])

  return <Loader states={[spec]}>
    {spec.data ? props.children : null}
  </Loader>
}
