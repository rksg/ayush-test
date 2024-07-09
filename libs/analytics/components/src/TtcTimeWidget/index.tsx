import { useIntl } from 'react-intl'

import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'
import type { AnalyticsFilter }     from '@acx-ui/utils'

import { useAverageTtcQuery } from './services'
import * as UI                from './styledComponents'

export function TtcTimeWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}){
  const queryResults= useAverageTtcQuery(filters)
  const { $t } = useIntl()
  const { data } = queryResults
  return(
    <Loader states={[queryResults]}>
      <GridRow>
        <GridCol col={{ span: 24 }} >
          <UI.Wrapper>
            <UI.Title>
              {$t({ defaultMessage: 'Time To Connect' })}
            </UI.Title>
          </UI.Wrapper>
          <UI.Wrapper>
            <UI.LargePercent>
              { formatter('durationFormat')(Math.round(data || 0)) }
            </UI.LargePercent>
          </UI.Wrapper>
        </GridCol>
      </GridRow>
    </Loader>
  )
}
