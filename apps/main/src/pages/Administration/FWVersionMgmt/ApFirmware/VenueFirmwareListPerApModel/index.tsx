import { useState } from 'react'


import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Tooltip }                                      from '@acx-ui/components'
import { useGetFirmwareVersionIdListQuery, useGetVenueApModelFirmwareListQuery }   from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel, dateSort, defaultSort, sortProp, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                               from '@acx-ui/user'
import { noDataDisplay }                                                           from '@acx-ui/utils'

import { getApNextScheduleTpl, getApSchedules, getNextSchedulesTooltip, toUserDate } from '../../FirmwareUtils'
import { PreferencesDialog }                                                         from '../../PreferencesDialog'
import * as UI                                                                       from '../../styledComponents'

import { UpdateNowPerApModel }                                                         from './UpdateNowPerApModel'
import { renderCurrentFirmwaresColumn, useUpdateNowPerApModel, useUpgradePerferences } from './venueFirmwareListPerApModelUtils'

export function VenueFirmwareListPerApModel () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery<FirmwareVenuePerApModel>({
    useQuery: useGetVenueApModelFirmwareListQuery,
    defaultPayload: {}
  })
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])
  const [ selectedRows, setSelectedRows ] = useState<FirmwareVenuePerApModel[]>([])
  // eslint-disable-next-line max-len
  const { updateNowVisible, setUpdateNowVisible, handleUpdateModalCancel } = useUpdateNowPerApModel()
  const {
    preferencesModalVisible, setPreferencesModalVisible, preferences,
    handlePreferencesModalCancel, handlePreferencesModalSubmit
  } = useUpgradePerferences()

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  const afterUpdateModalSubmit = () => {
    clearSelection()
  }

  const rowActions: TableProps<FirmwareVenuePerApModel>['rowActions'] = [
    {
      visible: (rows) => rows.some(row => !row.isFirmwareUpToDate),
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateNowVisible(true)
      }
    }
  ]

  return (<>
    <Loader states={[tableQuery]}>
      <Table
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox', selectedRowKeys }}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setPreferencesModalVisible(true)
        }])}
      />
    </Loader>
    {updateNowVisible && selectedRows && <UpdateNowPerApModel
      onCancel={handleUpdateModalCancel}
      afterSubmit={afterUpdateModalSubmit}
      selectedVenuesFirmwares={selectedRows}
    />}
    <PreferencesDialog
      visible={preferencesModalVisible}
      data={preferences}
      onCancel={handlePreferencesModalCancel}
      onSubmit={handlePreferencesModalSubmit}
    />
  </>)
}

function useColumns () {
  const { $t } = useIntl()
  const { versionFilterOptions } = useGetFirmwareVersionIdListQuery({ params: useParams() }, {
    refetchOnMountOrArgChange: false,
    selectFromResult ({ data }) {
      return {
        versionFilterOptions: data?.map(v => ({ key: v, value: v })) || true
      }
    }
  })

  const columns: TableProps<FirmwareVenuePerApModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'currentApFirmwares',
      dataIndex: 'currentApFirmwares',
      filterable: versionFilterOptions ?? false,
      filterMultiple: false,
      render: function (data, row) {
        return row.currentApFirmwares
          ? renderCurrentFirmwaresColumn(row.currentApFirmwares)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastScheduleUpdate',
      dataIndex: 'lastScheduleUpdate',
      sorter: { compare: sortProp('lastScheduleUpdate', dateSort) },
      render: function (_, row) {
        return toUserDate(row.lastScheduleUpdate || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'isFirmwareUpToDate',
      dataIndex: 'isFirmwareUpToDate',
      sorter: { compare: sortProp('isFirmwareUpToDate', defaultSort) },
      render: function (_, row) {
        return row.isFirmwareUpToDate
          ? $t({ defaultMessage: 'Up to date' })
          : $t({ defaultMessage: 'Update available' })
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedules',
      dataIndex: 'nextSchedules',
      sorter: { compare: sortProp('nextSchedules[0].startDateTime', dateSort) },
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const schedules = getApSchedules(row)

        return schedules.length === 0
          ? getApNextScheduleTpl(row)
          : <Tooltip
            title={<UI.ScheduleTooltipText>{getNextSchedulesTooltip(row)}</UI.ScheduleTooltipText>}
            overlayStyle={{ minWidth: '285px' }}
          ><UI.WithTooltip>{getApNextScheduleTpl(row)}</UI.WithTooltip></Tooltip>
      }
    }
  ]

  return columns
}
