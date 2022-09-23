import { useContext, useEffect, useRef, useState } from 'react'

import { Form }    from 'antd'
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

  useEffect(() => {
    if (tableQuery.data) {
      setTableData(tableQuery.data?.data ?? [])
    }
  }, [tableQuery.data])

  useEffect(() => {
    if (!dataloadedRef.current) {
      updateField(currentData.scope)
      dataloadedRef.current = true
    }
  }, [currentData, form])

  useEffect(() => {
    const formScope = form.getFieldValue('scope')
    if (dataloadedRef.current && formScope) {
      applyTableSelectedAps(formScope)
    }
  }, [tableQuery.pagination?.current])

  const applyTableSelectedAps = (selected: MdnsProxyScopeData[]) => {
    const resultTableData: Venue[] = (tableData ?? []).map((tableVenue: Venue) => {
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
    const resultScope: MdnsProxyScopeData[] = currentScope?.slice() ?? []
    let targetVenue = resultScope.find((s: MdnsProxyScopeData) => s.venueId === venue.id)

    if (targetVenue) {
      targetVenue.aps = (aps.length === 0
        ? []
        : aps.map(a => ({ serialNumber: a.serialNumber, name: a.name }))
      )
    } else {
      targetVenue = { venueName: venue.name, venueId: venue.id, aps: aps }
      resultScope.push(targetVenue)
    }

    updateField(resultScope)
  }

  const updateField = (scope: MdnsProxyScopeData[]) => {
    form.setFieldValue('scope', scope)
    applyTableSelectedAps(scope)
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
