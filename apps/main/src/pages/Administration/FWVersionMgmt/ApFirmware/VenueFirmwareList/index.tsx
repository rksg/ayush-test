import React, { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  ColumnType,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useGetVenueVersionListQuery,
  useDeleteVenueMutation,
  useGetVenueCityListQuery
} from '@acx-ui/rc/services'
import {
  Venue,
  FirmwareVenue,
  ApVenueStatusEnum,
  TableQuery,
  RequestPayload,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'
import { PreferencesDialog }    from './PreferencesDialog'
import { UpdateNowDialog }      from './UpdateNowDialog'

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const columns: TableProps<FirmwareVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      // disable: true,
      searchable: searchable,
      defaultSortOrder: 'ascend',
      width: 120,
      render: function (data, row) {
        return row.name
      }
    },
    {
      title: $t({ defaultMessage: 'Current AP Firmware' }),
      key: 'versions[0].version',
      dataIndex: 'versions[0].version',
      sorter: true,
      filterable: filterables ? filterables['city'] : false,
      // filterMultiple: true,
      width: 120,
      render: function (data, row) {
        return row.versions[0].version
      }
    },
    {
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'versions[0].category',
      dataIndex: 'versions[0].category',
      sorter: true,
      filterable: filterables ? filterables['city'] : false,
      // filterMultiple: true,
      width: 120,
      render: function (data, row) {
        return row.versions[0].category
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: true,
      // filterable: filterables ? filterables['city'] : false,
      // filterMultiple: true,
      width: 120,
      render: function (data, row) {
        return '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: true,
      // filterable: filterables ? filterables['city'] : false,
      // filterMultiple: true,
      width: 120,
      render: function (data, row) {
        return 'Not scheduled'
      }
    }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

export const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  return {
    fields: [
      'check-all',
      'name',
      'description',
      'city',
      'country',
      'networks',
      'aggregatedApStatus',
      'switches',
      'switchClients',
      'clients',
      ...(isEdgeEnabled ? ['edges'] : []),
      'cog',
      'latitude',
      'longitude',
      'status',
      'id'
    ],
    searchTargetFields: ['name', 'description'],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }
}

type VenueTableProps = {
  tableQuery: TableQuery<FirmwareVenue, RequestPayload<unknown>, unknown>,
  rowSelection?: TableProps<FirmwareVenue>['rowSelection'],
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const VenueFirmwareTable = (
  { tableQuery, rowSelection, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const [modelVisible, setModelVisible] = useState(false)
  const [updateModelVisible, setUpdateModelVisible] = useState(false)
  const [changeScheduleModelVisible, setChangeScheduleModelVisible] = useState(false)

  const handleModalCancel = () => {
    setModelVisible(false)
  }
  const handleModalSubmit = (data: []) => {
    // set preferences
  }

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }
  const handleUpdateModalSubmit = (data: []) => {
    // update firmware
  }

  const handleChangeScheduleModalCancel = () => {
    setChangeScheduleModelVisible(false)
  }
  const handleChangeScheduleModalSubmit = (data: []) => {
    // change firmware scheduled
  }


  // const tableData: readonly FirmwareVenue[] | undefined = tableQuery.data

  const tableData = tableQuery.data as readonly FirmwareVenue[] | undefined
  const columns = useColumns(searchable, filterables)
  const [
    deleteVenue,
    { isLoading: isDeleteVenueUpdating }
  ] = useDeleteVenueMutation()

  const rowActions: TableProps<FirmwareVenue>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Update Now' }),
    onClick: () => setUpdateModelVisible(true)
  },
  {
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    onClick: () => setChangeScheduleModelVisible(true)
  }]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteVenueUpdating }
    ]}>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={rowSelection}
        actions={[{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
          // disabled: allowedNetworkList.length === 0 ? true : false
        }]}
      />
      <UpdateNowDialog
        visible={updateModelVisible}
        // personaGroupId={props.groupId}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
      <ChangeScheduleDialog
        visible={changeScheduleModelVisible}
        // personaGroupId={props.groupId}
        onCancel={handleChangeScheduleModalCancel}
        onSubmit={handleChangeScheduleModalSubmit}
      />
      <PreferencesDialog
        visible={modelVisible}
        // personaGroupId={props.groupId}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
      />
    </Loader>
  )
}

export function VenueFirmwareList () {
  // const { $t } = useIntl()
  const venuePayload = useDefaultVenuePayload()

  const tableQuery = usePollingTableQuery<FirmwareVenue>({
    useQuery: useGetVenueVersionListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { cityFilterOptions } = useGetVenueCityListQuery({ params: useParams() }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: data?.map(v=>({ key: v.name, value: v.name })) || true
    })
  })

  return (
    <VenueFirmwareTable tableQuery={tableQuery}
      rowSelection={{ type: 'checkbox' }}
      searchable={true}
      filterables={{ city: cityFilterOptions }} />
  )
}

function shouldShowConfirmation (selectedVenues: FirmwareVenue[]) {
  const venues = selectedVenues.filter(v => {
    // return v['status'] !== ApVenueStatusEnum.IN_SETUP_PHASE || !_.isEmpty(v['aggregatedApStatus'])
    return v !== null
  })
  return venues.length > 0
}
