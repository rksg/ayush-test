import { useContext, useEffect, useRef, useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm, Table, Loader, TableProps }     from '@acx-ui/components'
import { useVenuesListQuery }                       from '@acx-ui/rc/services'
import { useTableQuery, Venue, MdnsProxyScopeData } from '@acx-ui/rc/utils'

import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxyScopeApDrawer, SimpleApRecord } from './MdnsProxyScopeApDrawer'



export function MdnsProxyScope () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(MdnsProxyFormContext)
  const [ selectedVenue, setSelectedVenue ] = useState<Venue>()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const [ tableData, setTableData ] = useState<Venue[]>()
  const dataloadedRef = useRef<boolean>(false)

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: [ 'check-all', 'name', 'city', 'cog', 'id' ],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  // Set venue table data source
  useEffect(() => {
    if (tableQuery.data) {
      setTableData(tableQuery.data.data)
    }
  }, [tableQuery.data])

  // Update selected APs value
  useEffect(() => {
    if (!dataloadedRef.current && tableData) {
      updateField(currentData.scope)
      dataloadedRef.current = true
    }
  }, [currentData.scope, form, tableData])

  const handleSelectAps = (rows: Venue[]) => {
    setDrawerVisible(true)
    setSelectedVenue(rows[0])
  }

  const handleSetAps = (venue: Venue, aps: SimpleApRecord[]) => {
    const currentScope = form.getFieldValue('scope')
    const resultScope: MdnsProxyScopeData[] = currentScope?.slice() ?? []

    _.remove(resultScope, (s: MdnsProxyScopeData) => s.venueId === venue.id)

    resultScope.push({
      venueName: venue.name,
      venueId: venue.id,
      aps: aps
    })

    updateField(resultScope)
  }

  const updateField = (scope: MdnsProxyScopeData[] = []) => {
    form.setFieldValue('scope', scope)
  }

  const getActivatedApsId = (venueId: string): string[] => {
    const scope: MdnsProxyScopeData[] = form.getFieldValue('scope')
    const target = scope.find(s => s.venueId === venueId)
    return target ? target.aps.map(ap => ap.serialNumber) : []
  }

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Select APs' }),
      onClick: (rows: Venue[]) => {
        handleSelectAps(rows)
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      key: 'city',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Selected APs' }),
      dataIndex: ['activatedApsId', 'length'],
      key: 'activatedApsId',
      render: function (data, row) {
        const scope: MdnsProxyScopeData[] = form.getFieldValue('scope') ?? []
        const target = scope.find(v => v.venueId === row.id)

        return target ? target.aps.length : 0
      }
    }
  ]

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Scope' }) }</StepsForm.Title>
      <p>{ $t({
        defaultMessage: 'Select the venues and APs where the mDNS Proxy Service will be applied:'
      }) }</p>
      {selectedVenue
        ? <MdnsProxyScopeApDrawer
          venue={selectedVenue}
          selectedApsId={getActivatedApsId(selectedVenue.id)}
          visible={drawerVisible}
          setVisible={setDrawerVisible}
          setAps={handleSetAps}
        />
        : null
      }
      <Form.Item name='scope'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowActions={rowActions}
            rowSelection={{ type: 'radio' }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Loader>
      </Form.Item>
    </>
  )
}
