import React, { useEffect, useState } from 'react'

import Column        from 'antd/lib/table/Column'
import ColumnGroup   from 'antd/lib/table/ColumnGroup'
import { useParams } from 'react-router-dom'


import {
  Loader,
  Table
} from '@acx-ui/components'
import { ApExtraParams, useApListQuery } from '@acx-ui/rc/services'
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
const defaultArray: any[] = []

export function Aps () {
  const params = useParams()
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: { networkId: [params.networkId] }
    }
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [extraParams, setExtra] = useState<ApExtraParams>({
    channel24: true,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  })

  useEffect(() => {
    if (tableQuery.data) {
      const data = tableQuery.data.data
      const extra = tableQuery.data.extra

      setTableData(data)
      setExtra(extra)
    }
  }, [tableQuery.data])

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

  const getChannelColumn = function () {
    return (<>
      {extraParams.channel24 &&
        <Column title='2.4 GHz'
          dataIndex='channel24'
          render={
            (value) => <>
              {transformDisplayText(value)}
            </>
          } />}
      {extraParams.channel50 &&
        <Column title='5 GHz'
          dataIndex='channel50'
          render={
            (value) => <>
              {transformDisplayText(value)}
            </>
          } />}

      {extraParams.channelL50 &&
        <Column title='LO 5 GHz'
          dataIndex='channelL50'
          render={
            (value) => <>
              {transformDisplayText(value)}
            </>
          } />}

      {extraParams.channelU50 &&
        <Column title='HI 5 GHz'
          dataIndex='channelU50'
          render={
            (value) => <>
              {transformDisplayText(value)}
            </>
          } />}

      {extraParams.channel60 &&
        <Column title='6 GHz'
          dataIndex='channel60'
          render={
            (value) => <>
              {transformDisplayText(value)}
            </>
          } />}</>)
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
          render={
            (value) => (
              <>
                {transformMeshRole(value)}
              </>
            )} />
        <Column title='Connected Clients'
          dataIndex='clients'
          render={
            (value) => <>
              {transformDisplayNumber(value)}
            </>
          } />
        <Column title='AP Group' dataIndex='deviceGroupName' sorter={true} />
        <ColumnGroup title='RF Channels'>
          {getChannelColumn()}
        </ColumnGroup>
        <Column title='Tags' dataIndex='tags' sorter={true} />
        <Column title='Serial Number' dataIndex='serialNumber' sorter={true} />
        <Column title='Version' dataIndex='fwVersion' sorter={true} />
      </Table>
    </Loader>
  )
}
