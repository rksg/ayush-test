import React from 'react'

import Column      from 'antd/lib/table/Column'
import ColumnGroup from 'antd/lib/table/ColumnGroup'
import _           from 'lodash'

import {
  Loader,
  Table
} from '@acx-ui/components'
import { ApExtraParams, Filters, useApListQuery } from '@acx-ui/rc/services'
import {
  APMeshRole,
  APView,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const defaultPayload = {
  searchString: '',
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'fwVersion'
  ]
}

export function Aps (props: {
  filters: Filters;
}) {
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: props.filters
    }
  })

  const tableData = tableQuery.data?.data ?? []
  const extraParams = tableQuery.data?.extra ?? {
    channel24: true,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  const transformMeshRole = (value: APMeshRole) => {
    let meshRole = ''
    switch (value) {
      case APMeshRole.EMAP:
        meshRole = 'eMAP'
        break
      case APMeshRole.DISABLED:
        meshRole = ''
        break
      default:
        meshRole = value
        break
    }
    return transformDisplayText(meshRole)
  }

  const channelColumns = {
    channel24: <Column
      key='channel24'
      title='2.4 GHz'
      dataIndex='channel24'
      render={transformDisplayText} />,
    channel50: <Column
      key='channel50'
      title='5 GHz'
      dataIndex='channel50'
      render={transformDisplayText} />,
    channelL50: <Column
      key='channelL50'
      title='LO 5 GHz'
      dataIndex='channelL50'
      render={transformDisplayText} />,
    channelU50: <Column
      key='channelU50'
      title='HI 5 GHz'
      dataIndex='channelU50'
      render={transformDisplayText} />,
    channel60: <Column
      key='channel60'
      title='6 GHz'
      dataIndex='channel60'
      render={transformDisplayText} />
  }

  return (
    <Loader states={[tableQuery]}>
      <Table dataSource={tableData}
        rowKey='id'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      >
        <Column title='AP Name' dataIndex='name' sorter={true} />
        <Column title='Status'
          dataIndex='deviceStatus'
          sorter={true}
          render={(value) => (
            <UI.StatusColumn>
              <UI.DeviceStatusIcon
                color={transformApStatus(value,
                  APView.AP_LIST).deviceStatus}>
              </UI.DeviceStatusIcon>
              <div>{transformApStatus(value, APView.AP_LIST).message}</div>
            </UI.StatusColumn>
          )} />
        <Column title='Model' dataIndex='model' sorter={true} />
        <Column title='IP Address' dataIndex='IP' />
        <Column title='MAC Address' dataIndex='apMac' sorter={true} />
        <Column title='Venue' dataIndex='venueName' sorter={true} />
        <Column title='Switch' dataIndex='switchName' />
        <Column title='Mesh Role'
          dataIndex='meshRole'
          sorter={true}
          render={transformMeshRole} />
        <Column title='Connected Clients'
          dataIndex='clients'
          render={transformDisplayNumber} />
        <Column title='AP Group' dataIndex='deviceGroupName' sorter={true} />
        <ColumnGroup title='RF Channels'>
          {_(channelColumns)
            .filter((_, key) => extraParams[key as keyof ApExtraParams])
            .value()}
        </ColumnGroup>
        <Column title='Tags' dataIndex='tags' sorter={true} />
        <Column title='Serial Number' dataIndex='serialNumber' sorter={true} />
        <Column title='Version' dataIndex='fwVersion' sorter={true} />
      </Table>
    </Loader>
  )
}
