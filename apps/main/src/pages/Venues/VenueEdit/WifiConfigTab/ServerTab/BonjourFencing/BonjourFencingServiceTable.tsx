import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useApListQuery }                              from '@acx-ui/rc/services'
import {
  BonjourFencingService,
  BonjourFencingWiredRule,
  BonjourFencingWirelessRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping } from '@acx-ui/rc/utils'

import { BonjourFencingContext } from './BonjourFencing'
import BonjourFencingDrawer      from './BonjourFencingDrawer'
import { updateRowId }           from './utils'

export interface apNameMacAddrMapping {
  name: string,
  apMac: string,
  serialNumber: string
}

export interface BonjourFencingServiceContextType {
  currentService?: BonjourFencingService,
  currentServiceRef: React.MutableRefObject<BonjourFencingService | undefined>,
  otherServices: BonjourFencingService[],
  venueAps: apNameMacAddrMapping[]
}

export const BonjourFencingServiceContext = createContext({} as BonjourFencingServiceContextType)

export function BonjourFencingServiceTable () {
  const { $t } = useIntl()
  const params = useParams()
  const { bonjourFencingServices, setBonjourFencingServices } = useContext(BonjourFencingContext)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerFormData, setDrawerFormData] = useState<BonjourFencingService>()
  const [otherServices, setOtherServices] = useState<BonjourFencingService[]>([])
  const [venueAps, setVenueAps] = useState<apNameMacAddrMapping[]>([])
  const serviceRef = useRef<BonjourFencingService>()


  const [drawerForm] = Form.useForm<BonjourFencingService>()

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

  const getWirelessRuleTooltip = (data: boolean, wirelessRule?: BonjourFencingWirelessRule) => {
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
    wiredRules?: BonjourFencingWiredRule[],
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

  const columns: TableProps<BonjourFencingService>['columns'] = [{
    title: $t({ defaultMessage: 'Service' }),
    dataIndex: 'service',
    key: 'service',
    width: 150,
    render: function (data, row) {
      if (data !== BridgeServiceEnum.OTHER) {
        return $t(mdnsProxyRuleTypeLabelMapping[data as BridgeServiceEnum])
      } else {
        return `Other_${row.customServiceName}`
      }
    }
  }, {
    title: $t({ defaultMessage: 'Wireless Connection' }),
    dataIndex: 'wirelessEnabled',
    key: 'wirelessEnabled',
    align: 'center',
    render: function (data, row) {
      return getWirelessRuleTooltip(data as boolean, row.wirelessRule)
    }
  }, {
    title: $t({ defaultMessage: 'Wired Connection' }),
    dataIndex: 'wiredEnabled',
    key: 'wiredEnabled',
    align: 'center',
    render: function (data, row) {
      return getWiredRulesTooltip(data as boolean, row.wiredRules)
    }
  }, {
    title: $t({ defaultMessage: 'Custom Mapping' }),
    dataIndex: 'customMappingEnabled',
    key: 'customMappingEnabled',
    align: 'center',
    render: function (data, row) {
      return getCustomMappingTooltip(data as boolean, row.customStrings)
    }
  }]

  const handleAddAction = () => {
    serviceRef.current = {} as BonjourFencingService
    setDrawerFormData({} as BonjourFencingService)
    setOtherServices(bonjourFencingServices)
    setDrawerVisible(true)
  }

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Service' }),
      onClick: handleAddAction,
      disabled: drawerVisible
    }
  ]

  const handleUpdateData = (data: BonjourFencingService) => {
    const services = [ ...bonjourFencingServices ]
    const targetIdx = services.findIndex((r: BonjourFencingService) => r.rowId === data.rowId)

    const newData = updateRowId(data)

    if (targetIdx === -1) {
      services.push(newData)
    } else {
      services.splice(targetIdx, 1, newData)
    }

    // Check the max number of "Other" service is 3.
    const otherServices = services.filter((r: BonjourFencingService) => r.service === 'OTHER')
    if (otherServices.length > 3) {
      showActionModal({
        type: 'error',
        //title: $t({ defaultMessage: 'Error' }),
        content:
            $t({ defaultMessage: 'The max entries with "Other" service is 3.' })
      })
    } else {
      setBonjourFencingServices(services)
      setDrawerVisible(false)
      drawerForm.resetFields()
    }
  }

  const rowActions: TableProps<(typeof bonjourFencingServices)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: drawerVisible,
      onClick: (selectedRows, clearSelection) => {
        const selectData = { ...selectedRows[0] }
        const otherExistData = bonjourFencingServices.filter(s => s.rowId !== selectData.rowId)

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
        const newData = bonjourFencingServices.filter(r => keys.indexOf(r.rowId) === -1)
        setBonjourFencingServices(newData)
        clearSelection()
      }
    }
  ]

  return (
    <BonjourFencingServiceContext.Provider
      value={{
        currentService: drawerFormData,
        currentServiceRef: serviceRef,
        otherServices: otherServices,
        venueAps: venueAps
      }}>
      <BonjourFencingDrawer
        form={drawerForm}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        onDataChanged={handleUpdateData}
      />
      <Table
        columns={columns}
        dataSource={bonjourFencingServices}
        actions={actions}
        rowActions={rowActions}
        rowKey='rowId'
        rowSelection={{ type: 'checkbox' }}
      />
    </BonjourFencingServiceContext.Provider>
  )

}
