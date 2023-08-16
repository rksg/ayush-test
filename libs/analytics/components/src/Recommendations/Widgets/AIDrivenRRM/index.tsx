import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, nodeTypes } from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData } from '@acx-ui/components'
import { NodeType }                   from '@acx-ui/utils'

import { useRecommendationListQuery } from '../../services'
import * as UI                        from '../styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  filters: AnalyticsFilter
}

function AIDrivenRRMWidget ({
  filters
}: AIDrivenRRMProps) {
  const intl = useIntl()
  const queryResults = useRecommendationListQuery(filters)
  const data = queryResults?.data?.filter((row) =>
    (true === row.code.includes('crrm'))
  )
  console.log('aidrivenrrm data', data)
  const { $t } = intl
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const subTitle = $t({
    defaultMessage: 'AI-Driven RRM has been run on \'n\' zones and already \'n1/n\' have been optimized' })
  const noData = data?.length === 0

  const items = data?.slice(0,5).map(props => {
    const { sliceType, sliceValue, priority, metadata, id } = props
    const type = nodeTypes(sliceType as NodeType)
    const text = `${type}(${sliceValue})`
    return <UI.Detail key={id}>
      <div style={{ display: 'flex' }}>
        <UI.PriorityIcon value={priority}/>
        <span>{text}</span>
      </div>
      <UI.Subtitle>{id}</UI.Subtitle>
    </UI.Detail>
  })

  return <Loader states={[queryResults]}>
    <Card title={title} subTitle={subTitle}>
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width, height: height - 20 * 2, marginBlock: 20 }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIDrivenRRMWidget
