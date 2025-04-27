import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader, Tooltip, TrendPill } from '@acx-ui/components'

import * as UI                                         from '../../common/KPIs/styledComponents'
import { useIntentContext }                            from '../../IntentContext'
import { dataRetentionText }                           from '../../utils'
import { KPIConfig, getKPIConfigsData, KPICardConfig } from '../common'
import { useIntentAIEcoFlexQuery }                     from '../services'

export const CustomizeKPIGrid: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>,
  isDetail?: boolean
}> = ({ kpiQuery, isDetail=false }) => {
  const { $t } = useIntl()
  const { state, isDataRetained } = useIntentContext()

  const noData = state === 'no-data'
  const current = kpiQuery?.data?.data?.data
  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>
  if (noData || !kpiQuery?.data || !current) {
    return <Card>
      {$t({
        defaultMessage: 'Key Performance Indications will be generated once Intent is activated.'
      })}
    </Card>
  }

  const previous = kpiQuery?.data?.compareData?.data
  const values:KPICardConfig[] = getKPIConfigsData(KPIConfig, current ?? {}, previous ?? {})

  return (<Loader states={[kpiQuery]}><GridRow>
    {values.map(({ key, label, value, values,
      valueMessage, valueSuffixMessage, valueSuffixClass,
      pillValue, tooltip
    }) => (
      <Tooltip
        placement='top'
        title={tooltip && $t(tooltip)}
        key={`tooltip-${key}`}
      >
        <GridCol key={key} col={{ span: isDetail? 8: 12 }}>
          <Card>
            <UI.Title>{$t(label)}</UI.Title>
            <UI.Statistic
              value={valueMessage? $t(valueMessage, values) : value}
              suffix={<>
                {valueSuffixMessage && (<span className={valueSuffixClass}>
                  {$t(valueSuffixMessage, {
                    ...values,
                    ...(values?.isShowPreviousSpan && {
                      previousSpan: (chunk: React.ReactNode) =>
                        <span className='ant-statistic-content-suffix-previous'>{chunk}</span>
                    })
                  })}
                </span>)}
                {pillValue && <TrendPill {...pillValue} />}
              </>}
            />
          </Card>
        </GridCol>
      </Tooltip>
    ))}
  </GridRow>
  </Loader>)
}
