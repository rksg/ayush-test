import { useState, useEffect } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Drawer, Loader, Table, TableProps, recommendationBandMapping } from '@acx-ui/components'
import { get }                                                          from '@acx-ui/config'
import { DateFormatEnum, formatter }                                    from '@acx-ui/formatter'
import { useWifiNetworkListQuery }                                      from '@acx-ui/rc/services'
import { truthy }                                                       from '@acx-ui/utils'

import { DescriptionSection }          from '../../DescriptionSection'
import { codes, statusTrailMsgs }      from '../config'
import { RecommendationWlan }          from '../services'
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

function useWlanRecords (originalWlans: RecommendationWlan[] | undefined, skip: boolean) {
  const [wlans, setWlans] = useState<Array<RecommendationWlan>>(originalWlans ?? [])
  const r1NetworksQuery = useWifiNetworkListQuery({
    payload: {
      deep: true,
      fields: ['id', 'name', 'ssid'],
      filters: { id: originalWlans?.map(wlan => wlan.name) },
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, { skip })
  useEffect(() => {
    if (r1NetworksQuery.data?.data) {
      setWlans(r1NetworksQuery.data.data)
    }
  }, [r1NetworksQuery])
  return wlans
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
    updatedAt,
    metadata
  } = details
  const { kpis } = codes[code]
  const { wlans } = metadata
  const isRrm = code.includes('crrm')
  const isFlexAI = code.startsWith('c-probeflex')
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const needsWlans = isFlexAI && wlans && wlans.length > 0
  const wlanRecords = useWlanRecords(wlans, !needsWlans || isMlisa)
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
    },
    (needsWlans && {
      label: $t({ defaultMessage: 'Networks' }),
      children: $t({ defaultMessage: '{count} networks selected' }, { count: wlans.length }),
      popover: wlanRecords.map(wlan => wlan.name).join('\n')
    })
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
