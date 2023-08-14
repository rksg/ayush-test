import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useApListQuery }                              from '@acx-ui/rc/services'
import {
  MdnsFencingService,
  MdnsFencingWiredRule,
  MdnsFencingWirelessRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping } from '@acx-ui/rc/utils'

import { MdnsFencingContext } from './MdnsFencing'
import MdnsFencingDrawer      from './MdnsFencingDrawer'
import { updateRowId }        from './utils'

export interface apNameMacAddrMapping {
  name: string,
  apMac: string,
  serialNumber: string
}

export interface MdnsFencingServiceContextType {
  currentService?: MdnsFencingService,
  currentServiceRef: React.MutableRefObject<MdnsFencingService | undefined>,
  otherServices: MdnsFencingService[],
  venueAps: apNameMacAddrMapping[]
}

export const MdnsFencingServiceContext = createContext({} as MdnsFencingServiceContextType)

export function MdnsFencingServiceTable () {
  const { $t } = useIntl()
  const params = useParams()
  const { mdnsFencingServices, setMdnsFencingServices } = useContext(MdnsFencingContext)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerFormData, setDrawerFormData] = useState<MdnsFencingService>()
  const [otherServices, setOtherServices] = useState<MdnsFencingService[]>([])

  const [venueAps, setVenueAps] = useState<apNameMacAddrMapping[]>([])
  const serviceRef = useRef<MdnsFencingService>()


  const [drawerForm] = Form.useForm<MdnsFencingService>()

  const apViewModelPayload = {
    entityType: 'apsList',
    fields: ['name', 'serialNumber', 'apMac', 'deviceStatus', 'venueId'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC',
    filters: { venueId: [params.venueId] }
  }
  const apViewModelQuery = useApListQuery({ params, payload: apViewModelPayload }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  useEffect(() => {
    const data = apViewModelQuery?.data
    if (data) {
      const aps = data
        .filter(ap => !!ap.apMac)
        .map(ap => {
          const { name='', apMac='', serialNumber='' } = ap
          return { name, apMac, serialNumber }
        })

      setVenueAps(aps)
    }

  }, [apViewModelQuery?.data])

  const fencingRangeRender = (fencingRange: string) => {
    return (fencingRange === 'SAME_AP')?
      $t({ defaultMessage: 'Same AP' }) : $t({ defaultMessage: '1-hop AP neighbors' })
  }

  const getWirelessRuleTooltip = (data: boolean, wirelessRule?: MdnsFencingWirelessRule) => {
    if (!data) {
      return $t({ defaultMessage: 'OFF' })
    }

    if (!wirelessRule?.fencingRange) {
      return $t({ defaultMessage: 'ON' })
    }

    const firstRow = $t({ defaultMessage: 'Fencing Range:' })
    const row = fencingRangeRender(wirelessRule.fencingRange)
    const rows = [ firstRow, row ]
    const tooltipTitle = rows.map(n => <div>{n}</div>)

    return <Tooltip title={tooltipTitle}>{$t({ defaultMessage: 'ON' })}</Tooltip>
  }

  const getWiredRulesTooltip = (
    data: boolean,
    wiredRules?: MdnsFencingWiredRule[],
    maxShow = 25
  ) => {
    if (!data) {
      return $t({ defaultMessage: 'OFF' })
    }

    const rulesLen = (wiredRules && wiredRules.length) || 0

    if (!wiredRules || rulesLen === 0) {
      return $t({ defaultMessage: 'ON' })
    }

    const firstRow = $t({ defaultMessage: 'Fencing Range:' })

    const truncateData = wiredRules.slice(0, maxShow-1)
    const rules = truncateData.map(rule => {
      const { name, fencingRange } = rule
      return `${name}: ${fencingRangeRender(fencingRange)}`
    })

    const rows = [ firstRow ].concat(rules)
    if (rulesLen > maxShow) {
      const lastRow = $t({ defaultMessage: 'And {total} more...' },
        { total: rulesLen - maxShow })

      rows.push(lastRow)
    }

    const tooltipTitle = rows.map(n => <div>{n}</div>)

    return <Tooltip title={tooltipTitle}>{$t({ defaultMessage: 'ON' })}</Tooltip>
  }

  const getCustomMappingTooltip = (data: boolean, customStrings?: string[]) => {
    if (!data) {
      return $t({ defaultMessage: 'OFF' })
    }

    if (!customStrings?.length) {
      return $t({ defaultMessage: 'ON' })
    }

    const firstRow = $t({ defaultMessage: 'Custom String:' })
    const rows = [ firstRow ].concat(customStrings)
    const tooltipTitle = rows.map(n => <div>{n}</div>)

    return <Tooltip title={tooltipTitle}>{$t({ defaultMessage: 'ON' })}</Tooltip>
  }

  const columns: TableProps<MdnsFencingService>['columns'] = [{
    title: $t({ defaultMessage: 'Service' }),
    dataIndex: 'service',
    key: 'service',
    width: 150,
    render: function (_, row) {
      if (row.service !== BridgeServiceEnum.OTHER) {
        return $t(mdnsProxyRuleTypeLabelMapping[row.service as BridgeServiceEnum])
      } else {
        return `Other_${row.customServiceName}`
      }
    }
  }, {
    title: $t({ defaultMessage: 'Wireless Connection' }),
    dataIndex: 'wirelessEnabled',
    key: 'wirelessEnabled',
    align: 'center',
    render: function (_, row) {
      return getWirelessRuleTooltip(row.wirelessEnabled, row.wirelessRule)
    }
  }, {
    title: $t({ defaultMessage: 'Wired Connection' }),
    dataIndex: 'wiredEnabled',
    key: 'wiredEnabled',
    align: 'center',
    render: function (_, row) {
      return getWiredRulesTooltip(row.wiredEnabled, row.wiredRules)
    }
  }, {
    title: $t({ defaultMessage: 'Custom Mapping' }),
    dataIndex: 'customMappingEnabled',
    key: 'customMappingEnabled',
    align: 'center',
    render: function (_, row) {
      return getCustomMappingTooltip(row.customMappingEnabled, row.customStrings)
    }
  }]

  const handleAddAction = () => {
    serviceRef.current = {} as MdnsFencingService
    setDrawerFormData({} as MdnsFencingService)
    setOtherServices(mdnsFencingServices)
    setDrawerVisible(true)
  }

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Service' }),
      onClick: handleAddAction,
      disabled: drawerVisible
    }
  ]

  const handleUpdateData = (data: MdnsFencingService) => {
    const services = [ ...mdnsFencingServices ]
    const targetIdx = services.findIndex((r: MdnsFencingService) => r.rowId === data.rowId)

    const newData = updateRowId(data)

    if (targetIdx === -1) {
      services.push(newData)
    } else {
      services.splice(targetIdx, 1, newData)
    }

    // Check the max number of "Other" service is 3.
    const otherServices = services.filter((r: MdnsFencingService) => r.service === 'OTHER')
    if (otherServices.length > 3) {
      showActionModal({
        type: 'error',
        //title: $t({ defaultMessage: 'Error' }),
        content:
            $t({ defaultMessage: 'The max entries with "Other" service is 3.' })
      })
    } else {
      setMdnsFencingServices(services)
      setDrawerVisible(false)
      drawerForm.resetFields()
    }
  }

  const rowActions: TableProps<(typeof mdnsFencingServices)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const selectData = { ...selectedRows[0] }
        const otherExistData = mdnsFencingServices.filter(s => s.rowId !== selectData.rowId)

        serviceRef.current = selectData
        setDrawerFormData(selectData)
        setOtherServices(otherExistData)
        setDrawerVisible(true)

        clearSelection()
      }
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const keys = selectedRows.map(row => row.rowId)
        const newData = mdnsFencingServices.filter(r => keys.indexOf(r.rowId) === -1)
        setMdnsFencingServices(newData)
        clearSelection()
      }
    }
  ]

  return (
    <MdnsFencingServiceContext.Provider
      value={{
        currentService: drawerFormData,
        currentServiceRef: serviceRef,
        otherServices: otherServices,
        venueAps: venueAps
      }}>
      <MdnsFencingDrawer
        form={drawerForm}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        onDataChanged={handleUpdateData}
      />
      <Table
        columns={columns}
        dataSource={mdnsFencingServices}
        actions={actions}
        rowActions={rowActions}
        rowKey='rowId'
        rowSelection={{ type: 'checkbox' }}
      />
    </MdnsFencingServiceContext.Provider>
  )

}
