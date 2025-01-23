import { useIntl } from 'react-intl'

import { GridCol, GridRow, ProgressBarV2 } from '@acx-ui/components'
import { formats }                         from '@acx-ui/formatter'
import { Sync }                            from '@acx-ui/icons'

import * as UI from './styledComponents'

type QuotaUsageBarProps = {
  total: number
  used: number
  onClick?: () => void
}

export const QuotaUsageBar: React.FC<QuotaUsageBarProps> = ({ total, used, onClick }) => {
  const { $t } = useIntl()
  const remaining = total - used
  const percent = Math.round((used / total) * 100)

  return (
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
          {$t({ defaultMessage: '{used} of {total} used ({percent}%)' },
            { used: formats.bytesFormat(used),
              total: formats.bytesFormat(total),
              percent
            })}
        </UI.QuotaUsageSubTitle>
      </GridCol>
    </GridRow>)
}