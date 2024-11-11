/* eslint-disable max-len */
import { ReactElement } from 'react'

import { TooltipPlacement }          from 'antd/lib/tooltip'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, cssStr }                                                        from '@acx-ui/components'
import { CertificateStatusType, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                             from '@acx-ui/react-router-dom'


export type CertificateToolTipProps = {
    visible: boolean,
    status?: CertificateStatusType[],
    placement?: TooltipPlacement,
    icon?: ReactElement
}

export function CertificateToolTip (props: CertificateToolTipProps) {
  const { $t } = useIntl()
  const { visible, status, placement, icon } = props

  const certificateToolTipInfo = $t({
    defaultMessage:
        'Certificate Management/ Server & Client Certificates.'
  })

  const getTitle = (status: CertificateStatusType[]) => {
    const isExpired = status.find(s => s === CertificateStatusType.EXPIRED)
    const isRevoked = status.find(s => s === CertificateStatusType.REVOKED)
    if (isExpired && isRevoked) {
      return 'This certificate has revoked and expired. Please go to'
    } else if (isExpired) {
      return 'This certificate has expired. Please go to'
    } else if (isRevoked) {
      return 'This certificate has revoked. Please go to'
    }
    return ''
  }

  const title = status? getTitle(status) : ''

  return (<Tooltip
    title={
      <FormattedMessage
        defaultMessage={
          '{title} <certificateToolTip></certificateToolTip> to renew it.'
        }
        values={{
          title,
          certificateToolTip: ()=> (visible?
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.CERTIFICATE,
                oper: PolicyOperation.LIST
              })}>
              {certificateToolTipInfo}
            </TenantLink>
            :[])
        }}
      />
    }
    placement={placement ?? 'right'}>
    {icon ?? <Tooltip.Warning isFilled
      placement='right'
      iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px', marginLeft: '4px', fill: cssStr('--acx-semantics-red-60') }}
    />}
  </Tooltip>)
}