/* eslint-disable max-len */
import { ReactElement } from 'react'

import { TooltipPlacement } from 'antd/lib/tooltip'

import { Tooltip }                           from '@acx-ui/components'
import { CertificateStatusType, PolicyType } from '@acx-ui/rc/utils'

import { CertificateWarning } from './CertificateWarning'
import * as UI                from './styledComponents'

export type CertificateToolTipProps = {
    status?: CertificateStatusType[],
    placement?: TooltipPlacement,
    policyType?: PolicyType,
    icon?: ReactElement
}

export function CertificateToolTip (props: CertificateToolTipProps) {
  const { status, placement, icon } = props

  return (<Tooltip
    title={<CertificateWarning status={status} includeParentLocation={true} />}
    overlayClassName={UI.toolTipClassName}
    placement={placement ?? 'right'}>
    {icon ??
      <UI.WarningCircleRed
        style={{
          height: '18px',
          width: '18px',
          marginBottom: '-4px',
          marginLeft: '4px'
        }}/>}
  </Tooltip>)
}