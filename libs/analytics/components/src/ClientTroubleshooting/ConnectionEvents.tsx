import React from 'react'

import { useIntl } from 'react-intl'

import * as UI from './styledComponents'

export function ConnectionEvents ({ children }: { children?: React.ReactNode }) {
  const { $t } = useIntl()
  return (
    <UI.Popover
      title={$t({ defaultMessage: 'Connection Event Details' })}
      content='test content'
      trigger={['focus', 'click']}
      placement='bottom'
    >
      {children}
    </UI.Popover>
  )
}