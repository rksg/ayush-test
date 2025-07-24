import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { LargeCheck, LargeX } from '@acx-ui/icons'
import { StatusReason }       from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


export default function PublishReadinessProgress (props: {
    variant?: 'short' | 'text'
    reasons: StatusReason[]
  }) {

  const { variant, reasons } = props
  const { $t } = useIntl()

  const isWorkflowReady = useMemo<boolean>(() => {
    return (reasons && !reasons?.length)
  }, [reasons])

  return (
    (variant === 'short') ?
      // short variant
      <UI.PublishReadinessBox ready={isWorkflowReady}>
        {isWorkflowReady ? <LargeCheck className='icon'/> : <LargeX className='icon' />}
      </UI.PublishReadinessBox>
      :
      // text variant --
      <>
        { isWorkflowReady ? $t({ defaultMessage: 'Ready' }) : $t({ defaultMessage: 'Not Ready' }) }
      </>


  )
}