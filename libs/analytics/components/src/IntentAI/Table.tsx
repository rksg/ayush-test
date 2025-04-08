import { ReactNode, useCallback, useRef, useState } from 'react'

import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Loader, TableProps, Table, Tooltip, Banner }    from '@acx-ui/components'
import { get }                                           from '@acx-ui/config'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                     from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, EquiFlex, EcoFlexAI } from '@acx-ui/icons'
import { useNavigate, useTenantLink, TenantLink }        from '@acx-ui/react-router-dom'
import { WifiScopes }                                    from '@acx-ui/types'
import {
  filterByAccess,
  getShowWithoutRbacCheckKey,
  aiOpsApis,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import {
  noDataDisplay,
  PathFilter,
  useEncodedParameter,
  useTrackLoadTime,
  widgetsMapping
} from '@acx-ui/utils'

import { Icon }                                       from './common/IntentIcon'
import { AiFeatures, codes, IntentListItem }          from './config'
import { getStatusTooltip, useIntentAITableQuery }    from './services'
import { DisplayStates, Statuses }                    from './states'
import * as UI                                        from './styledComponents'
import { IntentAIDateTimePicker, useIntentAIActions } from './useIntentAIActions'
import { Actions, getDefaultTime, isVisibleByAction } from './utils'

import type { Filters } from './services'

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
    <UI.FeatureTooltip onClick={(e) => e.stopPropagation()} data-testid='featureTooltip'>
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
  [AiFeatures.RRM]: <IconTooltip
    icon={<AIDrivenRRM />}
    title={defineMessage({ defaultMessage: 'AI-Driven RRM' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Throughput' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'vs' })}
    subTitleRight={defineMessage({ defaultMessage: 'Client Density' })}
    content={defineMessage({
      defaultMessage: `Choose between a network with maximum throughput,
      allowing some interference, or one with minimal interference, for high client density.` })}
  />,
  [AiFeatures.EquiFlex]: <IconTooltip
    icon={<EquiFlex />}
    title={defineMessage({ defaultMessage: 'EquiFlex' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Time to Connect' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'vs' })}
    subTitleRight={defineMessage({ defaultMessage: 'Client Density' })}
    content={defineMessage({
      defaultMessage: `Choose between fine-tuning your wireless LAN for extremely high client
      density environment or focus on keeping faster client time to connect.` })}
  />,
  [AiFeatures.AIOps]: <IconTooltip
    icon={<AIOperation />}
    title={defineMessage({ defaultMessage: 'AI Operations' })}
    subTitleLeft={defineMessage({ defaultMessage: 'Optimize Network' })}
    subTitleMiddle={defineMessage({ defaultMessage: 'with' })}
    subTitleRight={defineMessage({ defaultMessage: 'AI Insights' })}
    content={defineMessage({
      defaultMessage: `Proactively monitor and tune network performance with RUCKUS AI's
      dynamic recommendations to enhance KPIs and user experience.` })}
  />,
  [AiFeatures.EcoFlex]: <IconTooltip
    icon={<EcoFlexAI />}
    title={defineMessage({ defaultMessage: 'EcoFlex' })}
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
  status: Statuses
}

export const AIFeature = (props: AIFeatureProps): JSX.Element => {
  return (<UI.FeatureIcon>
    <Tooltip
      placement='right'
      title={iconTooltips[codes[props.code].aiFeature]}
      overlayInnerStyle={{ width: '345px' }}
    >
      <Icon feature={codes[props.code].aiFeature} />
    </Tooltip>
    {props.status === Statuses.new &&
      hasPermission({ permission: 'WRITE_INTENT_AI', scopes: [WifiScopes.UPDATE] })
      ? <span>{props.aiFeature}</span>
      : <TenantLink to={get('IS_MLISA_SA')
        ? `/analytics/intentAI/${props.root}/${props.sliceId}/${props.code}`
        : `/analytics/intentAI/${props.sliceId}/${props.code}`
      }>
        <span>{props.aiFeature}</span>
      </TenantLink>
    }
  </UI.FeatureIcon>)
}

export function IntentAITable (
  { pathFilters, helpUrl }: { pathFilters: PathFilter, helpUrl: string | undefined }
) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/intentAI')
  const intentActions = useIntentAIActions()
  const revertInitialDate = useRef(getDefaultTime())
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

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
  const [selectedRows, setSelectedRows] = useState<IntentListItem[]>([])

  const clearSelection = useCallback(() => {
    setSelectedRowKeys([])
    setSelectedRows([])
  }, [setSelectedRowKeys, setSelectedRows])

  const getRevertPickerJSX = () => (<IntentAIDateTimePicker
    id={'intent-ai-revert-picker'}
    title={$t({ defaultMessage: 'Revert' })}
    disabled={false}
    initialDate={revertInitialDate}
    onApply={(date) => intentActions.revert(date, selectedRows, clearSelection)}
  />)

  const rowActions: TableProps<IntentListItem>['rowActions'] = [
    {
      key: getShowWithoutRbacCheckKey(Actions.One_Click_Optimize),
      label: $t({ defaultMessage: '1-Click Optimize' }),
      visible: rows => isVisibleByAction(rows, Actions.One_Click_Optimize),
      onClick: (rows) => intentActions.showOneClickOptimize(rows, clearSelection)
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Optimize),
      label: selectedRows?.[0]?.displayStatus === DisplayStates.new ?
        $t({ defaultMessage: 'Optimize' }) : $t({ defaultMessage: 'Edit' }),
      visible: rows => isVisibleByAction(rows, Actions.Optimize),
      onClick: (rows) => {
        const row = rows[0]
        const editPath = get('IS_MLISA_SA')
          ? `${row.root}/${row.sliceId}/${row.code}/edit`
          : `${row.sliceId}/${row.code}/edit`
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${editPath}`
        })
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Revert),
      label: getRevertPickerJSX() as unknown as string,
      visible: rows => isVisibleByAction(rows, Actions.Revert),
      onClick: () => {}
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Pause),
      label: $t({ defaultMessage: 'Pause' }),
      visible: rows => isVisibleByAction(rows, Actions.Pause),
      onClick: (rows) =>
        intentActions.handleTransitionIntent(Actions.Pause, rows, () => clearSelection())
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Cancel),
      label: $t({ defaultMessage: 'Cancel' }),
      visible: rows => isVisibleByAction(rows, Actions.Cancel),
      onClick: (rows) =>
        intentActions.handleTransitionIntent(Actions.Cancel, rows, () => clearSelection())
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Resume),
      label: $t({ defaultMessage: 'Resume' }),
      visible: rows => isVisibleByAction(rows, Actions.Resume),
      onClick: (rows) =>
        intentActions.handleTransitionIntent(Actions.Resume, rows, () => clearSelection())
    }
  ]

  const intentTableFilters = useEncodedParameter<Filters>('intentTableFilters')
  const selectedFilters = intentTableFilters.read() || {}
  const {
    aiFeatures = [], categories = [], statuses = [], zones = [], intents = []
  } = filterOptions?.data || {}
  const data = queryResults?.data?.intents
  const columns: TableProps<IntentListItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'AI Feature' }),
      width: 110,
      dataIndex: 'aiFeature',
      key: 'aiFeature',
      filterable: aiFeatures,
      filteredValue: selectedFilters.aiFeatures,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All AI Features' }),
      render: (_: ReactNode, row: IntentListItem) => <AIFeature {...row} />,
      filterableWidth: 175
    },
    {
      title: $t({ defaultMessage: 'Intent' }),
      width: 250,
      dataIndex: 'intent',
      key: 'intent',
      filterable: intents,
      filteredValue: selectedFilters.intents,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Intents' }),
      filterableWidth: 240
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      width: 130,
      dataIndex: 'category',
      key: 'category',
      filterable: categories,
      filteredValue: selectedFilters.categories,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Categories' }),
      filterableWidth: 175
    },
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      width: 200,
      dataIndex: 'sliceValue',
      key: 'sliceValue',
      filterable: zones,
      filteredValue: selectedFilters.zones,
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
      dataIndex: 'statusLabel',
      key: 'statusLabel',
      filterable: statuses,
      filteredValue: selectedFilters.statuses,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Status' }),
      render: (_, row: IntentListItem ) => {
        const { statusLabel, displayStatus, sliceValue, metadata, updatedAt } = row
        return <Tooltip
          placement='top'
          title={getStatusTooltip(
            displayStatus, sliceValue, { ...metadata, updatedAt })}
          dottedUnderline={true}
        >
          {statusLabel}
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

  useTrackLoadTime({
    itemName: widgetsMapping.INTENT_AI_TABLE,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  const hasRowSelection = hasCrossVenuesPermission() && hasPermission({
    permission: 'WRITE_INTENT_AI',
    scopes: [WifiScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateIntentAI]
  })

  return (
    <Loader states={[queryResults]}>
      <UI.IntentAITableStyle />
      <Banner
        title={$t({ defaultMessage: 'Revolutionize your Network Optimization' })}
        subTitles={[$t({
          defaultMessage: `Automate configuration and
        monitoring tasks aligned with your network priorities, while enhancing`
        }), $t({ defaultMessage: 'performance through IntentAI\'s advanced AI/ML technologies.' })]}
        helpUrl={helpUrl} />
      <Table<IntentListItem>
        key={JSON.stringify(selectedFilters)}
        className='intentai-table'
        data-testid='intentAI'
        settingsId={'intentai-table'}
        type='tall'
        dataSource={data}
        columns={columns}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasRowSelection && {
          type: 'checkbox',
          selectedRowKeys,
          onChange: (_, selRows) => setSelectedRows(selRows)
        }}
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        filterableWidth={200}
        onChange={onPageChange}
        pagination={{ ...pagination, total: queryResults?.data?.total || 0 }}
        selectedFilters={selectedFilters}
        onFilterChange={onFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}
