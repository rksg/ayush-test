import React, { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, ProgressBarV2 } from '@acx-ui/components'
import { formats }                                 from '@acx-ui/formatter'
import { Sync }                                    from '@acx-ui/icons'

import { useGetQuotaUsageQuery } from './services'
import * as UI                   from './styledComponents'

type QuotaUsageBarProps = {
  onClick?: () => void
}

export const QuotaUsageBar: React.FC<QuotaUsageBarProps> = ({ onClick }) => {
  const { $t } = useIntl()
  const quotaQuery = useGetQuotaUsageQuery()
  const [remaining, setRemaining] = useState(0)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (quotaQuery.data) {
      const allowed = quotaQuery.data.allowed ?? 0
      const used = quotaQuery.data.used ?? 0
      setRemaining(Math.max(allowed - used, 0))
      setPercent(Math.round((used / allowed) * 100))
    }
  }, [quotaQuery])
  const usedPct = percent > 100 ? $t({ defaultMessage: '100% threshold exceeded' }) : `${percent}%`
  return (
    <Loader states={[quotaQuery]} >
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <UI.QuotaUsageTitle>
            {$t({ defaultMessage: '{remaining} of data remaining' },
              { remaining: formats.bytesFormat(remaining) })}
          </UI.QuotaUsageTitle>
          <UI.QuotaUsageBarContent>
            <UI.QuotaUsageBar>
              <ProgressBarV2
                percent={percent}
                gradientMode='usage'
                strokeWidth={8}
                style={{ lineHeight: '8px' }}
              />
            </UI.QuotaUsageBar>
            {onClick ? (<UI.QuotaUsageButton
              size='small'
              data-testid={'sync-button'}
              icon={<Sync />}
              onClick={onClick} />) : null}
          </UI.QuotaUsageBarContent>
          <UI.QuotaUsageSubTitle>
            {$t({ defaultMessage: '{used} of {total} used ({usedPct})' },
              { used: formats.bytesFormat(quotaQuery?.data?.used ?? 0),
                total: formats.bytesFormat(quotaQuery?.data?.allowed ?? 0),
                usedPct
              })}
          </UI.QuotaUsageSubTitle>
        </GridCol>
      </GridRow>
    </Loader>)
}