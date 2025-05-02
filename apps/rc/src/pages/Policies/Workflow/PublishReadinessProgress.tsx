import { Tooltip } from 'antd'

import { PublishedTooltipContent } from '@acx-ui/rc/components'
import { StatusReason }            from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export default function PublishReadinessProgress (props: {
  publishReadiness: number,
  reasons: StatusReason[]
}) {
  const { publishReadiness, reasons } = props

  return reasons?.length ? <Tooltip
    placement='bottomLeft'
    showArrow={false}
    overlayStyle={{
      width: '395px'
    }}
    title={<PublishedTooltipContent reasons={reasons} />}>
    <UI.ProgressBar
      strokeLinecap='round'
      strokeColor='var(--acx-semantics-green-40)'
      percent={publishReadiness}
      showInfo={false}
      strokeWidth={12}
    />
  </Tooltip>
    : <UI.ProgressBar
      strokeLinecap='round'
      strokeColor='var(--acx-semantics-green-40)'
      percent={publishReadiness}
      showInfo={false}
      strokeWidth={12}
    />
}