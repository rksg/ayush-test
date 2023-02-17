import React, { useEffect, useState, useContext } from 'react'

import { Switch, Row, Col, Form } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import {
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useNetworkVenueListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'

import ConfigurationProfileFormContext from './ConfigurationProfileFormContext'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status'
  ]
}

const defaultArray: Venue[] = []
/* eslint-disable max-len */

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function VenueSetting () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [venueList, setVenueList] = useState<string[]>([])


  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = item.deepVenue
        data.push({
          ...item,
          deepVenue: activatedVenue,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })
      setTableData(data)
    }
    if(currentData.venues && editMode){
      form.setFieldValue('venues', currentData.venues)
      setVenueList(currentData.venues || [])
    }
  }, [tableQuery.data, currentData])

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: () => {
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: () => {
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      align: 'center',
      render: function (data) { return data ? data : 0 }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (data, row) {
        return <Switch
          checked={form.getFieldValue('venues').includes(row.id)}
          onClick={(checked, event) => {
            if(checked){
              row.activated = { isActivated: true }
              const mergedList = [...venueList, row.id]
              setVenueList(mergedList)
              form.setFieldValue('venues', mergedList)
            }else{
              row.activated = { isActivated: false }
              const filterList = venueList.filter((item: string) => item !== row.id)
              setVenueList(filterList)
              form.setFieldValue('venues', filterList)
            }
            event.stopPropagation()
          }}
        />
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Row gutter={20}>
        <Col span={20}>
          <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
          <Table
            rowKey='id'
            rowActions={rowActions}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
          <Form.Item name='venues' initialValue={[]} />
        </Col>
      </Row>
    </Loader>
  )
}
