import { useContext, useEffect, useRef, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm, Table, Loader, TableProps } from '@acx-ui/components'
import { useVenuesListQuery }                   from '@acx-ui/rc/services'
import { useTableQuery, Venue, MdnsProxyScopeData }             from '@acx-ui/rc/utils'

import { MdnsProxyScopeApDrawer, SimpleApRecord } from './MdnsProxyScopeApDrawer'
import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

export function MdnsProxyScope () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { defaultData } = useContext(MdnsProxyFormContext)
  const [ selectedVenue, setSelectedVenue ] = useState<Venue>()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const [ tableData, setTableData ] = useState<Venue[]>([])
  const defaultDataLoaded = useRef<boolean>(false)

  useEffect(() => {
    if (!defaultData?.scope || defaultDataLoaded.current) {
      return
    }
    applyTableSelectedAps(defaultData.scope)
    defaultDataLoaded.current = true
  }, [defaultData])

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: [ 'check-all', 'name', 'city', 'cog', 'id' ],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  useEffect(() => {
    if (tableQuery.data && tableData.length === 0) {
      setTableData(tableQuery.data?.data)
    }
  }, [tableQuery.data])

  const applyTableSelectedAps = (selected: MdnsProxyScopeData[]) => {
    const resultTableData: Venue[] = tableData.map((tableVenue: Venue) => {
      const target: MdnsProxyScopeData | undefined = selected.find(s => s.venueId === tableVenue.id)

      return {
        ...tableVenue,
        activatedApsId: target ? target.aps.map(ap => ap.serialNumber) : tableVenue.activatedApsId
      }
    })

    setTableData(resultTableData)
  }

  const handleSelectAps = (rows: Venue[]) => {
    setDrawerVisible(true)
    setSelectedVenue(rows[0])
  }

  const handleSetAps = (venue: Venue, aps: SimpleApRecord[] = []) => {
    const currentScope = form.getFieldValue('scope')
    const resultScope: MdnsProxyScopeData[] = currentScope ? currentScope.slice(0) : []
    let targetVenue: MdnsProxyScopeData | undefined = resultScope.find((s: MdnsProxyScopeData) => s.venueId === venue.id)

    if (targetVenue) {
      targetVenue.aps = (aps.length === 0 ? [] : aps.map((a: SimpleApRecord) => ({ serialNumber: a.serialNumber, name: a.name })))
    } else {
      targetVenue = { venueName: venue.name, venueId: venue.id, aps: aps }
      resultScope.push(targetVenue)
    }

    form.setFieldValue('scope', resultScope)
    applyTableSelectedAps(resultScope)
  }

  const actions: TableProps<Venue>['actions'] = [
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
      render: function (data) {
        return data ? data : 0
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
          selectedApsId={selectedVenue.activatedApsId}
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
            actions={actions}
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
