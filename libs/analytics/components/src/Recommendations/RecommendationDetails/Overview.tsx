import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Drawer, Loader, Table, TableProps, recommendationBandMapping } from '@acx-ui/components'
import { get }                                                          from '@acx-ui/config'
import { DateFormatEnum, formatter }                                    from '@acx-ui/formatter'
import { truthy }                                                       from '@acx-ui/utils'

import { DescriptionSection }          from '../../DescriptionSection'
import { codes, statusTrailMsgs }      from '../config'
import { PriorityIcon, OptimizedIcon } from '../styledComponents'

import { DownloadRRMComparison }                                    from './Graph/DownloadRRMComparison'
import { EnhancedRecommendation, RecommendationAp, useGetApsQuery } from './services'

const ImpactedApsDrawer = ({ id, aps, visible, onClose }:
  { id: string, aps: RecommendationAp[], visible: boolean, onClose: () => void }) => {
  const { $t } = useIntl()
  const [search, setSearch] = useState('')
  const impactedApsQuery = useGetApsQuery({ id, search })
  const columns: TableProps<RecommendationAp>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      searchable: true
    },
    {
      key: 'model',
      dataIndex: 'model',
      title: $t({ defaultMessage: 'AP Model' }),
      searchable: true
    },
    {
      key: 'mac',
      dataIndex: 'mac',
      title: $t({ defaultMessage: 'AP MAC' }),
      searchable: true
    },
    {
      key: 'version',
      dataIndex: 'version',
      title: $t({ defaultMessage: 'AP Version' }),
      searchable: true
    }
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
      <Loader states={[impactedApsQuery]}>
        <Table<RecommendationAp>
          rowKey='mac'
          columns={columns}
          onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
          searchableWidth={390}
          enableApiFilter
          dataSource={impactedApsQuery.data}
        />
      </Loader>
    }
  />
}

export const Overview = ({ details }:{ details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const {
    category,
    sliceValue,
    status,
    code,
    id,
    priority,
    crrmOptimizedState,
    crrmInterferingLinksText,
    updatedAt
  } = details
  const { kpis } = codes[code]
  const isRrm = code.includes('crrm')

  const fields = [
    (isRrm && {
      label: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone RRM Health' })
        : $t({ defaultMessage: '<VenueSingular></VenueSingular> RRM Health' }),
      children: <OptimizedIcon
        value={crrmOptimizedState!.order}
        text={$t(crrmOptimizedState!.label)}
      />
    }),
    (!isRrm && {
      label: $t({ defaultMessage: 'Priority' }),
      children: <PriorityIcon value={priority.order} text={$t(priority.label)} />
    }),
    {
      label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))
    },
    (!isRrm && {
      label: $t({ defaultMessage: 'Category' }),
      children: $t(category)
    }),
    (!isRrm && {
      // eslint-disable-next-line max-len
      label: get('IS_MLISA_SA') ? $t({ defaultMessage: 'Zone' }) : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      children: sliceValue
    }),
    (isRrm && {
      label: $t({ defaultMessage: 'Summary' }),
      children: crrmInterferingLinksText
    }),
    {
      label: $t({ defaultMessage: 'Status' }),
      children: $t(statusTrailMsgs[status])
    }
  ].filter(truthy)

  const hasAp = Boolean(kpis.filter(kpi => kpi.showAps).length)
  const impactedApsQuery = useGetApsQuery({ id, search: '' }, { skip: !hasAp })
  if (hasAp && impactedApsQuery.data?.length) {
    const impactedApField = {
      label: $t({ defaultMessage: 'AP Impact Count' }),
      children: $t(
        { defaultMessage: '{count} of {count} {count, plural, one {AP} other {APs}} ({percent})' },
        { count: impactedApsQuery.data.length, percent: formatter('percent')(100) }
      ),
      onClick: () => setVisible(true)
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
    { Object.keys(recommendationBandMapping).includes(details.code as string) &&
      <DownloadRRMComparison details={details} title={$t({ defaultMessage: 'RRM comparison' })}/>}
  </Loader>
}
