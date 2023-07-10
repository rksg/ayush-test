import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader, Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetLatestEdgeFirmwareQuery,
  useGetVenueEdgeFirmwareListQuery,
  useUpdateEdgeFirmwareMutation
} from '@acx-ui/rc/services'
import {
  dateSort,
  defaultSort,
  EdgeVenueFirmware,
  FirmwareCategory,
  firmwareTypeTrans,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import {
  toUserDate
} from '../../FirmwareUtils'

import { UpdateNowDialog } from './UpdateNowDialog'


export function VenueFirmwareList () {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const [venueIds, setVenueIds] = useState<string[]>([])
  const {
    data: venueFirmwareList,
    isLoading: isVenueFirmwareListLoading
  } = useGetVenueEdgeFirmwareListQuery({})
  const { latestReleaseVersion } = useGetLatestEdgeFirmwareQuery({}, {
    selectFromResult: ({ data }) => ({
      latestReleaseVersion: data?.[0]
    })
  })
  const { data: availableVersions } = useGetAvailableEdgeFirmwareVersionsQuery({})
  const [updateNow] = useUpdateEdgeFirmwareMutation()

  const columns: TableProps<EdgeVenueFirmware>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Current Edge Firmware' }),
      key: 'versions[0].name',
      dataIndex: 'versions[0].name',
      sorter: { compare: sortProp('versions[0].name', defaultSort) },
      render: function (data, row) {
        return row.versions?.[0]?.name || '--'
      },
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'versions[0].category',
      dataIndex: 'versions[0].category',
      sorter: { compare: sortProp('versions[0].category', defaultSort) },
      render: function (data, row) {
        if (!row.versions?.[0]) return '--'
        const text = transform(row.versions[0].category as FirmwareCategory, 'type')
        const subText = transform(row.versions[0].category as FirmwareCategory, 'subType')
        if (!subText) return text
        return `${text} (${subText})`
      },
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'updatedDate',
      dataIndex: 'updatedDate',
      sorter: { compare: sortProp('updatedDate', dateSort) },
      render: function (data, row) {
        if (!row.updatedDate) return '--'
        return toUserDate(row.updatedDate)
      },
      width: 120
    }
  ]

  const rowActions: TableProps<EdgeVenueFirmware>['rowActions'] = [
    {
      visible: (selectedItems) => {
        const hasOutdatedFw = selectedItems?.some(
          item => item.versions?.[0].id !== latestReleaseVersion?.id
        )
        return hasOutdatedFw
      },
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (selectedRows) => {
        setVenueIds(selectedRows.map(item => item.id))
        setUpdateModelVisible(true)
      }
    }
  ]

  const [updateModelVisible, setUpdateModelVisible] = useState(false)

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }

  const handleUpdateModalSubmit = async (data: string) => {
    const payload = {
      venueIds: venueIds,
      firmwareVersion: data
    }
    try {
      await updateNow({ payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[
      { isLoading: isVenueFirmwareListLoading, isFetching: isVenueFirmwareListLoading }
    ]}>
      <Table
        columns={columns}
        dataSource={venueFirmwareList}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox' }}
      />
      <UpdateNowDialog
        visible={updateModelVisible}
        availableVersions={availableVersions}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
    </Loader>
  )
}
