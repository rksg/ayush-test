import { defineMessage, useIntl } from 'react-intl'

import { Card, GridCol, GridRow, TrendPill, Loader } from '@acx-ui/components'
import { formatter }                                 from '@acx-ui/formatter'

import * as UI                                              from '../../common/KPIs/styledComponents'
import { useIntentContext }                                 from '../../IntentContext'
import { BenefitsConfig, getKPIConfigsData, KPICardConfig } from '../common'
import { useIntentAIEcoFlexQuery }                          from '../services'

export const BenefitsGrid: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>
}> = ({ kpiQuery }) => {
  const { $t } = useIntl()
  const { state, isDataRetained } = useIntentContext()
  const noData = state === 'no-data'
  const current = kpiQuery?.data?.data?.data
  const previous = kpiQuery?.data?.compareData?.data

  const values: KPICardConfig[] = (noData || !current || !isDataRetained) ? [
    {
      key: 'projectedPowerSaving',
      label: defineMessage({ defaultMessage: 'Projected power saving' }),
      value: kpiQuery?.data?.data?.data?.projectedPowerSaving
        ? formatter('countFormat')(kpiQuery?.data?.data?.data?.projectedPowerSaving)
        : $t({ defaultMessage: 'Not available' })
    }]
    : getKPIConfigsData(BenefitsConfig, current ?? {}, previous ?? {})

  return (<Loader states={[kpiQuery]}>
    <GridRow data-testid='Benefits'>
      {values.map(({ key, label, value, values,
        valueMessage, valueSuffixMessage, valueSuffixClass,
        pillValue
      }) => (
        <GridCol key={key} col={{ span: 12 }}>
          <Card>
            <UI.Title>{$t(label)}</UI.Title>
            <UI.Statistic
              valueRender={() => (<span className='ant-statistic-content-value'>
                {valueMessage? $t(valueMessage, { ...values, value }) : value}
                {valueSuffixMessage &&
              (<span className={valueSuffixClass}>{$t(valueSuffixMessage)}</span>)}
              </span>)}
              suffix={pillValue && <TrendPill {...pillValue} />}
            />
          </Card>
        </GridCol>
      ))}
    </GridRow>
  </Loader>)
}
