import { useEffect, useState, useContext } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'


import {
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  NetworkApGroupDialog,
  transformAps,
  transformRadios,
  transformScheduling
} from '@acx-ui/rc/components'
import { useNetworkVenueListQuery } from '@acx-ui/rc/services'
import {
  aggregateApGroupPayload,
  NetworkSaveData,
  NetworkVenue, RadioEnum,
  SchedulerTypeEnum,
  useTableQuery,
  Venue,
  useScheduleSlotIndexMap
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  SchedulingModalState,
  NetworkVenueScheduleDialog
} from '../../NetworkDetails/NetworkVenuesTab/NetworkVenueScheduleDialog'
import { useGetNetwork }  from '../../NetworkDetails/services'
import NetworkFormContext from '../NetworkFormContext'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

interface ApGroupModalState { // subset of ApGroupModalWidgetProps
  visible: boolean,
  wlan?: NetworkSaveData['wlan'],
  networkVenue?: NetworkVenue,
  venueName?: string
}

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

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

interface schedule {
  [key: string]: string
}

export function Venues () {
  const form = Form.useFormInstance()
  const { editMode, cloneMode, data, setData } = useContext(NetworkFormContext)

  const venues = Form.useWatch('venues')
  const params = useParams()

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const networkQuery = useGetNetwork()

  const [tableData, setTableData] = useState(defaultArray)
  const [activateVenues, setActivateVenues] = useState(defaultArray)

  // AP group form
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })

  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })

  const handleVenueSaveData = (selectedRows: Venue[]) => {
    const defaultSetup = {
      apGroups: [],
      scheduler: { type: SchedulerTypeEnum.ALWAYS_ON },
      isAllApGroups: true,
      allApGroupsRadio: RadioEnum.Both
    }
    const selected = selectedRows.map((row) => {
      const existsVenue = (data?.venues?.find(venue => venue.venueId === row.id))
      if (existsVenue) {
        return existsVenue
      } else {
        return ({
          ...defaultSetup,
          venueId: row.id,
          name: row.name
        })
      }
    })

    setData && setData({ ...data, venues: selected })
    form.setFieldsValue({ venues: selected })
  }

  const handleActivateVenue = (isActivate:boolean, row:Venue | Venue[]) => {
    let selectedVenues = [...activateVenues]
    if (isActivate) {
      if (Array.isArray(row)) {
        selectedVenues = [...selectedVenues, ...row]
      } else {
        selectedVenues = [...selectedVenues, row]
      }
    } else {
      if (Array.isArray(row)) {
        row.forEach(item => {
          const index = selectedVenues.findIndex(i => i.id === item.id)
          if (index !== -1) {
            selectedVenues.splice(index, 1)
          }
        })
      } else {
        const index = selectedVenues.findIndex(i => i.id === row.id)
        if (index !== -1) {
          selectedVenues.splice(index, 1)
        }
      }
    }
    selectedVenues = _.uniq(selectedVenues)
    setActivateVenues(selectedVenues)
    handleVenueSaveData(selectedVenues)
    setTableDataActivate(tableData ,selectedVenues)
  }

  const setTableDataActivate = (dataOfTable:Venue[], selectedVenues:Venue[]) => {
    const data:Venue[] = []
    dataOfTable.forEach(item => {
      let activated = { isActivated: false }
      if(selectedVenues.find(i => i.id === item.id)) {
        activated.isActivated = true
      }
      item.activated = activated
      data.push(item)
    })
    setTableData(data)
  }

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows) => {
        handleActivateVenue(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (rows) => {
        handleActivateVenue(false, rows)
      }
    }
  ]

  useEffect(()=>{
    if(editMode || cloneMode){
      if(tableQuery.data && activateVenues.length === 0){
        const selected: Venue[] = []
        const tableData = tableQuery.data.data.map((item: Venue) =>
        {
          item = cloneMode ? _.omit(item, 'networkId') : item
          const isActivated = venues &&
            venues.filter((venue: Venue) => venue.venueId === item.id).length > 0
          if(isActivated){
            selected.push(item)
          }
          const activatedVenue = item.deepVenue || networkQuery.data?.venues?.find(
            i => i.venueId === item.id
          )
          return {
            ...item,
            deepVenue: activatedVenue,
            // work around of read-only records from RTKQ
            activated: { isActivated }
          }
        })
        setTableData(tableData)
        setTableDataActivate(tableData, selected)
        setActivateVenues(selected)
      }
    }else{
      if(tableQuery.data && tableData.length === 0){
        const tableData = tableQuery.data.data.map((item: Venue) =>
        {
          const activatedVenue = item.deepVenue || networkQuery.data?.venues?.find(
            i => i.venueId === item.id
          )
          return {
            ...item,
            deepVenue: activatedVenue,
            // work around of read-only records from RTKQ
            activated: { ...item.activated }
          }
        })
        setTableData(tableData)
      }
    }
    if(data && (venues === undefined || venues?.length === 0)) {
      if(cloneMode){
        const venuesData = data?.venues?.map(item => {
          return { ...item, networkId: null, id: null }
        })
        form.setFieldsValue({ venues: venuesData })
      }else{
        form.setFieldsValue({ venues: data.venues })
      }
    }
  }, [venues, tableQuery.data, editMode, data])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData)

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
      key: 'network',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count']
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      render: function (data, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked, event) => {
            event.stopPropagation()
            handleActivateVenue(checked, row)
          }}
        />
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (data, row) {
        return transformAps(getCurrentVenue(row), (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (data, row) {
        return transformRadios(getCurrentVenue(row), (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (data, row) {
        return transformScheduling(
          getCurrentVenue(row), scheduleSlotIndexMap[row.id], (e) => handleClickScheduling(row, e))
      }
    }
  ]

  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return
    }
    const network = data
    const venueId = row.id
    let venue = row.deepVenue
    if (!venue) {
      venue = network?.venues?.find(v => v.venueId === venueId)
    }
    return venue
  }

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      venue: row,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      wlan: data?.wlan,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleApGroupFormFinish = (name: string, newData: FormFinishInfo) => {
    if (name === 'networkApGroupForm') {
      let oldData = _.cloneDeep(apGroupModalState.networkVenue)
      const payload = aggregateApGroupPayload(newData, oldData, true)

      let selectedVenues = data?.venues?.map((row) => {
        if(row.venueId ===payload.venueId) {
          return { ...row, ...payload }
        } else {return row}
      })

      if(selectedVenues) {
        setData && setData({ ...data, venues: selectedVenues })
        form.setFieldsValue({ venues: selectedVenues })
      }

      let currentTableData: Venue[] = []
      const currentIndex = tableData.findIndex(item => item.id === payload.venueId)
      tableData.forEach((item, index)=>{
        if (index === currentIndex) {
          currentTableData.push(
            { ...item, deepVenue: payload }
          )
        } else {
          currentTableData.push(item)
        }
      })

      setTableData(currentTableData)
      setApGroupModalState({
        visible: false
      })
    }
  }

  const handleCancel = () => {
    setApGroupModalState({
      visible: false
    })
    setScheduleModalState({
      visible: false
    })
  }

  const handleScheduleFormFinish = (name: string, info: FormFinishInfo) => {
    let scheduleData = _.cloneDeep(scheduleModalState.networkVenue)
    // const schdule = info.values.map

    let tmpScheduleList: schedule = { type: info.values?.scheduler.type }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: { [key: string]: any } = info.values?.scheduler
    for (let key in map) {
      if(key === 'type'){
        continue
      }
      if (map.hasOwnProperty(key) && map['type'] === 'CUSTOM') {
        let scheduleList: string[] = []
        for(let i = 0; i < 96; i++){
          scheduleList.push('0')
        }
        map[key].map((item: string) => {
          const value = parseInt(item.split('_')[1], 10)
          scheduleList[value] = '1'
        })
        tmpScheduleList[key] = scheduleList.join('')
      }
    }

    const payload = _.assign(scheduleData, { scheduler: tmpScheduleList })

    let selectedVenues = data?.venues?.map((row) => {
      if(row.venueId ===payload.venueId) {
        return { ...row, ...payload }
      } else {return row}
    })

    if(selectedVenues) {
      setData && setData({ ...data, venues: selectedVenues })
      form.setFieldsValue({ venues: selectedVenues })
    }

    let currentTableData: Venue[] = []
    const currentIndex = tableData.findIndex(item => item.id === payload.venueId)
    tableData.forEach((item, index)=>{
      if (index === currentIndex) {
        currentTableData.push(
          { ...item, deepVenue: payload }
        )
      } else {
        currentTableData.push(item)
      }
    })

    setTableData(currentTableData)
    setScheduleModalState({
      visible: false
    })
  }

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Venues' }) }</StepsForm.Title>
      <p>{ $t({ defaultMessage: 'Select venues to activate this network' }) }</p>
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowActions={rowActions}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={[...tableData]}

            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
          <Form.Provider
            onFormFinish={handleApGroupFormFinish}
          >
            <NetworkApGroupDialog
              {...apGroupModalState}
              tenantId={params.tenantId}
              formName='networkApGroupForm'
              onCancel={handleCancel}
            />
          </Form.Provider>
          <Form.Provider
            onFormFinish={handleScheduleFormFinish}
          >
            <NetworkVenueScheduleDialog
              {...scheduleModalState}
              formName='networkVenueScheduleForm'
              network={networkQuery.data}
              onCancel={handleCancel}
            />
          </Form.Provider>
        </Loader>
      </Form.Item>
    </>
  )
}
