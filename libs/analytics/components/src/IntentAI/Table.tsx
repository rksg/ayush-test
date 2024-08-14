import { ReactNode, useState } from 'react'


import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Loader, TableProps, Table, Tooltip }                        from '@acx-ui/components'
import { get }                                                       from '@acx-ui/config'
import { DateFormatEnum, formatter }                                 from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI }            from '@acx-ui/icons'
import { TenantLink }                                                from '@acx-ui/react-router-dom'
import { filterByAccess, getShowWithoutRbacCheckKey, hasPermission } from '@acx-ui/user'
import { noDataDisplay, PathFilter }                                 from '@acx-ui/utils'

import { aiFeatures, codes }                     from './config'
import { useIntentAITableQuery, IntentListItem } from './services'
import * as UI                                   from './styledComponents'
import { useIntentAIActions }                    from './useIntentAIActions'

export const icons = {
  [aiFeatures.RRM]: <AIDrivenRRM />,
  [aiFeatures.AirFlexAI]: <AirFlexAI />,
  [aiFeatures.AIOps]: <AIOperation />,
  [aiFeatures.EcoFlexAI]: <EcoFlexAI />
}

type IconTooltipProps = {
  title: MessageDescriptor
  subTitleLeft: MessageDescriptor
  subTitleMiddle: MessageDescriptor
  subTitleRight: MessageDescriptor
  content: MessageDescriptor
  icon: JSX.Element
}

const IconTooltip = (props: IconTooltipProps) => {
  const { $t } = useIntl()
  const title = $t(props.title)
  const subTitleLeft = $t(props.subTitleLeft)
  const subTitleMiddle = $t(props.subTitleMiddle)
  const subTitleRight = $t(props.subTitleRight)
  const content = $t(props.content)
  return (
    <UI.FeatureTooltip onClick={(e) => e.stopPropagation()}>
      <div> {props.icon} </div>
      <div>
        <b className='title'>{title}</b><br />
        <div><b>{subTitleLeft}</b> {subTitleMiddle} <b>{subTitleRight}</b></div>
        <span className='br-size'></span>
        {content}
      </div>
    </UI.FeatureTooltip>
  )
}

export const iconTooltips = {
  [aiFeatures.RRM]: <IconTooltip
    icon={<AIDrivenRRM />}
    title={defineMessage({ defaultMessage: 'AI-Driven RRM' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Throughput' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'vs' })}
    subTitleRight={defineMessage({ defaultMessage: 'Client Density' })}
    content={defineMessage({
      defaultMessage: `Choose between a network with maximum throughput,
      allowing some interference, or one with minimal interference, for high client density.` })}
  />,
  [aiFeatures.AirFlexAI]: <IconTooltip
    icon={<AirFlexAI />}
    title={defineMessage({ defaultMessage: 'AirFlexAI' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Time to Connect' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'vs' })}
    subTitleRight={defineMessage({ defaultMessage: 'Client Density' })}
    content={defineMessage({
      defaultMessage: `Choose between fine-tuning your wireless LAN for extremely high client
      density environment or focus on keeping faster client time to connect.` })}
  />,
  [aiFeatures.AIOps]: <IconTooltip
    icon={<AIOperation />}
    title={defineMessage({ defaultMessage: 'AI Operations' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Optimize Network' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'with' })}
    subTitleRight={defineMessage({ defaultMessage: 'AI Insights' })}
    content={defineMessage({
      defaultMessage: `Proactively monitor and tune network performance with RUCKUS AI's
      dynamic recommendations to enhance KPIs and user experience.` })}
  />,
  [aiFeatures.EcoFlexAI]: <IconTooltip
    icon={<EcoFlexAI />}
    title={defineMessage({ defaultMessage: 'EcoFlexAI' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Energy Footprint' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'vs' })}
    subTitleRight={defineMessage({ defaultMessage: 'Mission Criticality' })}
    content={defineMessage({
      defaultMessage: `Reduce energy footprint for efficiency and sustainability,
      or operate mission-critical services for reliability and continuous operation.` })}
  />
}

export type AIFeatureProps = {
  code: string
  aiFeature: string
  root: string
  sliceId: string
}

export const AIFeature = (props: AIFeatureProps): JSX.Element => {
  return (<UI.FeatureIcon>
    <Tooltip
      placement='right'
      title={iconTooltips[codes[props.code].aiFeature]}
      overlayInnerStyle={{ width: '345px' }}
    >
      {icons[codes[props.code].aiFeature]}
    </Tooltip>
    <TenantLink to={get('IS_MLISA_SA')
      ? `/analytics/intentAI/${props.root}/${props.sliceId}/${props.code}`
      : `/analytics/intentAI/${props.sliceId}/${props.code}`
    }>
      <span>{props.aiFeature}</span>
    </TenantLink>
  </UI.FeatureIcon>)
}

export function IntentAITable (
  { pathFilters }: { pathFilters: PathFilter }
) {
  const { $t } = useIntl()
  const intentActions = useIntentAIActions()

  const {
    tableQuery: queryResults,
    onFilterChange,
    onPageChange,
    pagination,
    filterOptions
  } = useIntentAITableQuery(
    { ...pathFilters }
  )
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const rowActions: TableProps<IntentListItem>['rowActions'] = [
    {
      key: getShowWithoutRbacCheckKey('1-click-optimize'),
      label: $t({ defaultMessage: '1-Click Optimize' }),
      visible: rows => !rows.some(row => row.status !== 'New' as string),
      onClick: (rows) => {
        intentActions.showOneClickOptimize(rows, ()=> clearSelection())
      }
    }
  ]

  const { aiFeatures = [], categories =[], statuses = [], zones = [] } = filterOptions?.data || {}
  const data = queryResults?.data?.intents
  const columns: TableProps<IntentListItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'AI Feature' }),
      width: 110,
      dataIndex: 'aiFeature',
      key: 'aiFeature',
      filterable: aiFeatures,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All AI Features' }),
      render: (_: ReactNode, row: IntentListItem) => <AIFeature {...row} />
    },
    {
      title: $t({ defaultMessage: 'Intent' }),
      width: 250,
      dataIndex: 'intent',
      key: 'intent'
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      width: 130,
      dataIndex: 'category',
      key: 'category',
      filterable: categories,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Categories' })
    },
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      width: 200,
      dataIndex: 'sliceValue',
      key: 'sliceValue',
      filterable: zones,
      filterSearch: true,
      filterPlaceholder: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'All Zones' })
        : $t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }),
      render: (_, row: IntentListItem ) => {
        return <Tooltip
          placement='top'
          title={row.scope}
          dottedUnderline={true}
        >
          {row.sliceValue}
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      width: 200,
      dataIndex: 'status',
      key: 'status',
      filterable: statuses,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Status' }),
      render: (_, row: IntentListItem ) => {
        const { status, statusTooltip } = row
        return <Tooltip
          placement='top'
          title={statusTooltip}
          dottedUnderline={true}
        >
          {status}
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Last update' }),
      width: 130,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, row) => formatter(DateFormatEnum.DateTimeFormat)(row.updatedAt)
    }
  ]

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  return (
    <Loader states={[queryResults]}>
      <UI.IntentAITableStyle/>
      <Table
        className='intentai-table'
        data-testid='intentAI'
        settingsId={'intentai-table'}
        type='tall'
        dataSource={data}
        columns={columns}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasPermission({ permission: 'WRITE_INTENT_AI' }) && {
          type: 'checkbox',
          selectedRowKeys
        }}
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        filterableWidth={200}
        onChange={onPageChange}
        pagination={{ ...pagination, total: queryResults?.data?.total || 0 }}
        onFilterChange={onFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}