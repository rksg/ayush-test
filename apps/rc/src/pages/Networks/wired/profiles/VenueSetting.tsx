import React, { useEffect, useState, useContext } from 'react'

import { Switch, Row, Col, Form, Input } from 'antd'
import { useIntl }                       from 'react-intl'

import {
  Loader,
  StepsFormLegacy,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import {
  useGetCliFamilyModelsQuery,
  useVenuesListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'

const defaultPayload = {
  fields: ['check-all', 'name', 'city', 'country', 'switchProfileName',
    'switches', 'activated', 'switchProfileId', 'status', 'id'],
  page: 1,
  pageSize: 25,
  sortField: 'name',
  sortOrder: 'ASC',
  searchString: ''
}

const defaultArray: Venue[] = []

export function VenueSetting () {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload
  })

  const { data: venueAppliedToCli } = useGetCliFamilyModelsQuery({ params })
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
    if(currentData.venues){
      form.setFieldValue('venues', currentData.venues)
      setVenueList(currentData.venues || [])
    }
  }, [tableQuery.data, currentData])

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows) => {
        const tmpTableData = tableData.map(item => (
          { ...item, activated: { isActivated: rows.map(row => row.id).includes(item.id) } }))
        setTableData(tmpTableData)
        const mergedList = [
          ...venueList, ...rows.map(row => row.id).filter(item => !venueList.includes(item))]
        setVenueList(mergedList)
        form.setFieldValue('venues', mergedList)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (rows) => {
        const tmpTableData = tableData.map(item => (
          { ...item, activated: { isActivated: rows.map(row => row.id).includes(item.id) } }))
        setTableData(tmpTableData)
        const filterList = venueList.filter(item => !rows.map(row=>row.id).includes(item))
        setVenueList(filterList)
        form.setFieldValue('venues', filterList)
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
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
      sorter: true,
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
          disabled={venueAppliedToCli?.map(item => item.venueId).includes(row.id)}
        />
      }
    }
  ]

  const rowSelection = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCheckboxProps: (record: any) => ({
      disabled: venueAppliedToCli?.map(item=>item.venueId).includes(record.id)
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderCell (checked: any, record: any, index: any, node: any) {
      if (venueAppliedToCli?.map(item => item.venueId).includes(record.id)) {
        // eslint-disable-next-line max-len
        return <Tooltip title='A CLI configuration profile has been applied to this venue so it cannot be selected.'>{node}</Tooltip>
      }
      return node
    }
  }

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Venues' })} />
          <Table
            rowKey='id'
            rowActions={filterByAccess(rowActions)}
            rowSelection={hasAccess() && {
              type: 'checkbox',
              ...rowSelection
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
          <Form.Item
            name='venues'
            initialValue={[]}
            hidden={true}
            children={<Input />}
          />
        </Col>
      </Row>
    </Loader>
  )
}
