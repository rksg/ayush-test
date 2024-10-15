import React from 'react'

import { useLayoutContext } from '@acx-ui/components'

import * as UI from './styledComponents'

export function IntentDetailsSidebar (props: React.HTMLAttributes<HTMLDivElement>) {
  const { pageHeaderY } = useLayoutContext()
  return <UI.IntentDetailsSidebar {...props} $pageHeaderY={pageHeaderY} />
}
