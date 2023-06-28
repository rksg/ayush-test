import { useState } from 'react'

import { Badge }                                            from 'antd'
import { capitalize }                                       from 'lodash'
import moment                                               from 'moment-timezone'
import { useIntl, MessageDescriptor, MessageFormatElement } from 'react-intl'

import { Drawer, Loader, SearchBar, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }                    from '@acx-ui/formatter'

import { DescriptionSection } from '../DescriptionSection'

import { statusTrailMsgs }                                          from './configRecommendationData'
import configRecommendations                                        from './configRecommendations'
import { EnhancedRecommendation, RecommendationAp, useGetApsQuery } from './services'
import { RecommendationApImpacted }                                 from './styledComponents'

const getPriorityColor = (val: MessageDescriptor ) => {
  const msg = (val.defaultMessage as MessageFormatElement[])
  const priority = (msg[0] as unknown as { value: 'high' | 'low' | 'medium' })
  switch (priority.value) {
    case 'high': return '--acx-semantics-red-50'
    case 'medium': return '--acx-semantics-yellow-50'
    case 'low': return '--acx-semantics-yellow-20'
  }
}

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
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const { priority, statusTrail, category, sliceValue, status, code, id } = details
  const { createdAt } = statusTrail[statusTrail.length - 1]
  const { kpis } = configRecommendations[code]
  const iconColor = getPriorityColor(priority)
  const Icon = () => <Badge color={`var(${iconColor})`} text={capitalize($t(priority))}/>
  const fields = [
    { label: $t({ defaultMessage: 'Priority' }), children: <Icon /> },
    { label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(createdAt)) },
    { label: $t({ defaultMessage: 'Category' }), children: $t(category) },
    { label: $t({ defaultMessage: 'Venue' }), children: sliceValue },
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
    {(hasAp && visible) && <ImpactedApsDrawer
      id={id}
      aps={impactedApsQuery.data!}
      onClose={() => setVisible(false)}
      visible={visible}
    />}
  </Loader>
}