import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'


import {
  Loader,
  StepsFormLegacy,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  NetworkApGroupDialog,
  NetworkVenueScheduleDialog,
  transformAps,
  transformRadios,
  transformScheduling
} from '@acx-ui/rc/components'
import { useNetworkVenueListQuery } from '@acx-ui/rc/services'
import {
  aggregateApGroupPayload,
  NetworkSaveData,
  NetworkVenue,
  useTableQuery,
  Venue,
  useScheduleSlotIndexMap,
  generateDefaultNetworkVenue,
  SchedulingModalState,
  RadioTypeEnum,
  IsWPA3security
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

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
  const { cloneMode, data, setData } = useContext(NetworkFormContext)

  const activatedNetworkVenues: NetworkVenue[] = Form.useWatch('venues')
  const params = useParams()
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)

  const prevIsWPA3securityRef = useRef(false)
  const isWPA3security = IsWPA3security(data?.wlan?.wlanSecurity)

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })

  const [tableData, setTableData] = useState<Venue[]>([])

  // AP group form
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })

  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })

  const handleVenueSaveData = (newSelectedNetworkVenues: NetworkVenue[]) => {
    setData && setData({ ...data, venues: newSelectedNetworkVenues })
    form.setFieldsValue({ venues: newSelectedNetworkVenues })
  }

  const handleActivateVenue = (isActivate: boolean, rows: Venue[]) => {
    let newSelectedNetworkVenues: NetworkVenue[] = [...activatedNetworkVenues]
    if (isActivate) {
      const newActivatedNetworkVenues: NetworkVenue[] =
        rows.map(row => {
          const newNetworkVenue = generateDefaultNetworkVenue(row.id, row.networkId as string)
          if (triBandRadioFeatureFlag && isWPA3security) {
            newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
          }
          return newNetworkVenue
        })
      newSelectedNetworkVenues = _.uniq([...newSelectedNetworkVenues, ...newActivatedNetworkVenues])
    } else {
      const handleVenuesIds = rows.map(row => row.id)
      _.remove(newSelectedNetworkVenues, v => handleVenuesIds.includes(v.venueId as string))
    }
    handleVenueSaveData(newSelectedNetworkVenues)
    setTableDataActivate(tableData, newSelectedNetworkVenues.map(i=>i.venueId))
  }

  const setTableDataActivate = (dataOfTable: Venue[], selectedVenueIds: (string|undefined)[]) => {
    const data:Venue[] = []
    dataOfTable.forEach(item => {
      let activated = { isActivated: false }
      if(selectedVenueIds.find(id => id === item.id)) {
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
      visible: (selectedRows) => {
        const enabled = selectedRows.some((item)=>{
          return item.mesh && item.mesh.enabled && data && data.enableDhcp
        })
        return !enabled
      },
      onClick: (rows) => {
        handleActivateVenue(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      visible: (selectedRows) => {
        const enabled = selectedRows.some((item)=>{
          return item.mesh && item.mesh.enabled && data && data.enableDhcp
        })
        return !enabled
      },
      onClick: (rows) => {
        handleActivateVenue(false, rows)
      }
    }
  ]

  useEffect(()=>{
    if(tableQuery.data && activatedNetworkVenues){

      const currentTableData = tableQuery.data.data.map(item => {
        item = cloneMode ? _.omit(item, 'networkId') : item

        const targetNetworkVenue = activatedNetworkVenues.find(nv => nv.venueId === item.id)

        return {
          ...item,
          deepVenue: targetNetworkVenue,
          // work around of read-only records from RTKQ
          activated: targetNetworkVenue ? { isActivated: true } : { ...item.activated }
        }
      })
      setTableDataActivate(currentTableData, activatedNetworkVenues.map(v=>v.venueId))
    }
  }, [tableQuery.data, activatedNetworkVenues])

  useEffect(()=>{
    if(data && (activatedNetworkVenues === undefined || activatedNetworkVenues?.length === 0)) {
      if(cloneMode){
        const venuesData = data?.venues?.map(item => {
          return { ...item, networkId: null, id: null }
        })
        form.setFieldsValue({ venues: venuesData })
      }else{
        form.setFieldsValue({ venues: data.venues })
      }
    }
  }, [data])

  useEffect(() => {
    if (data?.wlan) {
      if (prevIsWPA3securityRef.current === true && data.wlan.wlanSecurity !== 'WPA3') {
        if (activatedNetworkVenues?.length > 0) {
          // remove radio 6g when wlanSecurity is changed from WPA3 to others
          const newActivatedNetworkVenues = activatedNetworkVenues.map(venue => {
            const { allApGroupsRadioTypes, apGroups } = venue
            if (allApGroupsRadioTypes && allApGroupsRadioTypes.includes(RadioTypeEnum._6_GHz)) {
              allApGroupsRadioTypes.splice(allApGroupsRadioTypes.indexOf(RadioTypeEnum._6_GHz), 1)
            }
            if (apGroups && apGroups.length > 0) {
              apGroups.forEach(apGroup => {
                if (apGroup.radioTypes && apGroup.radioTypes.includes(RadioTypeEnum._6_GHz)) {
                  apGroup.radioTypes.splice(apGroup.radioTypes.indexOf(RadioTypeEnum._6_GHz), 1)
                }
              })
            }
            return venue
          })

          handleVenueSaveData(newActivatedNetworkVenues)
          setTableDataActivate(tableData, newActivatedNetworkVenues.map(i=>i.venueId))
        }
      }
      prevIsWPA3securityRef.current = (data.wlan.wlanSecurity === 'WPA3')

    }
  }, [data?.wlan])

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
      dataIndex: ['networks', 'count'],
      align: 'center'
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      align: 'center',
      render: function (_, row) {
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
      render: function (_, row) {
        let disabled = false
        // eslint-disable-next-line max-len
        let title = $t({ defaultMessage: 'You cannot activate the DHCP service on this venue because it already enabled mesh setting' })
        if(data && data.enableDhcp && row.mesh && row.mesh.enabled){
          disabled = true
        }else{
          title = ''
        }
        return <Tooltip
          title={title}
          placement='bottom'><Switch
            disabled={disabled}
            checked={Boolean(row.activated?.isActivated)}
            onClick={(checked, event) => {
              event.stopPropagation()
              handleActivateVenue(checked, [row])
            }}
          /></Tooltip>

      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        return transformAps(getCurrentVenue(row),
          data as NetworkSaveData, (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformRadios(getCurrentVenue(row),
          data as NetworkSaveData, (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        return transformScheduling(
          getCurrentVenue(row), scheduleSlotIndexMap[row.id], (e) => handleClickScheduling(row, e))
      }
    }
  ]

  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return
    }
    const venueId = row.id
    // Need to get deepVenue from data(NetworkFormContext) since this table doesn't post data immediately
    return data?.venues?.find(v => v.venueId === venueId)
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
        handleVenueSaveData(selectedVenues)
      }
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
        map[key].forEach((item: string) => {
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
      handleVenueSaveData(selectedVenues)
    }
    setScheduleModalState({
      visible: false
    })
  }

  return (
    <>
      <StepsFormLegacy.Title>{ $t({ defaultMessage: 'Venues' }) }</StepsFormLegacy.Title>
      <p>{ $t({ defaultMessage: 'Select venues to activate this network' }) }</p>
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowActions={filterByAccess(rowActions)}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableData}
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
              network={data}
              onCancel={handleCancel}
            />
          </Form.Provider>
        </Loader>
      </Form.Item>
    </>
  )
}
