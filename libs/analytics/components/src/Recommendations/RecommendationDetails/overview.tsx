import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Drawer, Loader, SearchBar, Table, TableProps } from '@acx-ui/components'
import { get }                                          from '@acx-ui/config'
import { DateFormatEnum, formatter }                    from '@acx-ui/formatter'

import { DescriptionSection }        from '../../DescriptionSection'
import { codes, statusTrailMsgs }    from '../config'
import { Priority, PriorityIcon }    from '../styledComponents'
import { getOptimized, getCrrmText } from '../Widgets/AIDrivenRRM'
import { OptimizedIcon }             from '../Widgets/styledComponents'

import { EnhancedRecommendation, RecommendationAp, useGetApsQuery } from './services'
import { RecommendationApImpacted }                                 from './styledComponents'

const ImpactedApsDrawer = ({ id, aps, visible, onClose }:
  { id: string, aps: RecommendationAp[], visible: boolean, onClose: () => void }) => {
  const { $t } = useIntl()
  const [search, setSearch] = useState('')
  const impactedApsQuery = useGetApsQuery({ id, search })
  const columns: TableProps<RecommendationAp>['columns'] = [
    { key: 'name', dataIndex: 'name', title: $t({ defaultMessage: 'AP Name' }) },
    { key: 'model', dataIndex: 'model', title: $t({ defaultMessage: 'AP Model' }) },
    { key: 'mac', dataIndex: 'mac', title: $t({ defaultMessage: 'AP MAC' }) },
    { key: 'version', dataIndex: 'version', title: $t({ defaultMessage: 'AP Version' }) }
  ]

  return <Drawer
    width='600px'
    title={$t(
      { defaultMessage: '{count} Impacted {count, plural, one {AP} other {APs}}' },
      { count: aps!.length }
    )}
    style={{
      display: visible ? 'block' : 'none'
    }}
    onClose={onClose}
    visible={visible}
    children={
      <>
        <SearchBar onChange={setSearch} />
        <Loader states={[impactedApsQuery]}>
          <Table<RecommendationAp>
            rowKey='mac'
            columns={columns}
            dataSource={impactedApsQuery.data}
          />
        </Loader>
      </>
    }
  />
}

export const Overview = ({ details }:{ details: EnhancedRecommendation }) => {
  const intl = useIntl()
  const { $t } = intl
  const [visible, setVisible] = useState(false)
  const { statusTrail, category, sliceValue, status, code, id, priority } = details
  const { createdAt } = statusTrail[0]
  const { kpis } = codes[code]
  const isRrm = code.includes('crrm')
  const optimized = getOptimized([details]).isOptimized

  const Icon = () => <Priority>
    <PriorityIcon value={priority.order} />
    <span>{$t(priority.label)}</span>
  </Priority>

  const Optimized = () => <div style={{ display: 'flex' }}>
    <OptimizedIcon value={optimized ? 0 : 1} />
    <span style={{ paddingTop: 5 }}>{optimized ? 'Optimized' : 'Non-optimized'}</span>
  </div>

  const fields = [
    ...(isRrm
      ? [{ label: $t({ defaultMessage: 'Zone RRM' }), children: <Optimized /> }]
      : [{ label: $t({ defaultMessage: 'Priority' }), children: <Icon /> }]),
    { label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(createdAt)) },
    ...(isRrm ? [] : [{ label: $t({ defaultMessage: 'Category' }), children: $t(category) }]),
    ...(isRrm ? [] : [{
      label: get('IS_MLISA_SA') ? $t({ defaultMessage: 'Zone' }) : $t({ defaultMessage: 'Venue' }),
      children: sliceValue
    }]),
    ...(isRrm
      ? [{
        label: $t({ defaultMessage: 'Summary' }),
        children: getCrrmText(details, intl.$t, optimized)
      }]
      : []),
    { label: $t({ defaultMessage: 'Status' }), children: $t(statusTrailMsgs[status]) }
  ]

  const hasAp = Boolean(kpis.filter(kpi => kpi.showAps).length)
  const impactedApsQuery = useGetApsQuery({ id, search: '' }, { skip: !hasAp })
  if (hasAp && impactedApsQuery.data?.length) {
    const impactedApField = {
      label: $t({ defaultMessage: 'AP Impact Count' }),
      children: <RecommendationApImpacted onClick={() => setVisible(true)}>
        {$t({
          defaultMessage: '{count} of {count} {count, plural, one {AP} other {APs}} ({percent})' },
        { count: impactedApsQuery.data.length, percent: formatter('percent')(100) })}
      </RecommendationApImpacted>
    }
    fields.splice(2, 0, impactedApField)
  }

  return <Loader states={[impactedApsQuery]}>
    <DescriptionSection fields={fields} />
    {(hasAp) && <ImpactedApsDrawer
      id={id}
      aps={impactedApsQuery.data!}
      onClose={() => setVisible(false)}
      visible={visible}
    />}
  </Loader>
}
