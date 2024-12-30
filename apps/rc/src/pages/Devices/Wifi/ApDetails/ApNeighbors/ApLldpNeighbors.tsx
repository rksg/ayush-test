import { useMemo, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps }     from '@acx-ui/components'
import { Features, useIsSplitOn }                                     from '@acx-ui/feature-toggle'
import { useLazyGetApLldpNeighborsQuery, useLazyGetApNeighborsQuery } from '@acx-ui/rc/services'
import {
  ApLldpNeighbor,
  defaultSort,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { WifiScopes }         from '@acx-ui/types'
import { filterByAccess }     from '@acx-ui/user'
import { CatchErrorResponse } from '@acx-ui/utils'

import { NewApNeighborTypes, defaultPagination } from './constants'
import { lldpNeighborsFieldLabelMapping }        from './contents'
import { useApNeighbors }                        from './useApNeighbors'

import { apNeighborValueRender } from '.'

import type { LldpNeighborsDisplayFields } from './contents'

export default function ApLldpNeighbors () {
  const { $t } = useIntl()
  const { serialNumber, venueId } = useApContext()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const apNeighborQuery = isUseWifiRbacApi ?
    useLazyGetApNeighborsQuery :
    useLazyGetApLldpNeighborsQuery
  const [ getApNeighbors, getApNeighborsStates ] = apNeighborQuery()
  // eslint-disable-next-line max-len
  const { doDetect, isDetecting, handleApiError } = useApNeighbors('lldp', serialNumber!, socketHandler, venueId)
  const [ detailsDrawerVisible, setDetailsDrawerVisible ] = useState(false)
  const [ selectedApLldpNeighbor, setSelectedApLldpNeighbor ] = useState<ApLldpNeighbor>()

  const tableActions = [{
    scopeKey: [WifiScopes.UPDATE],
    label: $t({ defaultMessage: 'Detect' }),
    disabled: isDetecting,
    onClick: () => doDetect()
  }]

  async function socketHandler () {
    try {
      await getApNeighbors({
        params: { serialNumber, venueId },
        payload: {
          filters: [{ type: NewApNeighborTypes.LLDP_NEIGHBOR }],
          page: 1,
          pageSize: 10000
        }
      }).unwrap()
    } catch (error) {
      handleApiError(error as CatchErrorResponse)
    }
  }

  const isTableFetching = () => {
    return getApNeighborsStates.isFetching || isDetecting
  }

  const getRowKey = (record: ApLldpNeighbor): string => {
    return record.lldpTime + (record.lldpPortID ?? '') + (record.lldpChassisID ?? '')
  }

  return <Loader states={[{
    isLoading: getApNeighborsStates.isLoading,
    isFetching: isTableFetching()
  }]}>
    <Table
      settingsId='ap-lldp-neighbors-table'
      rowKey={getRowKey}
      columns={useColumns(setDetailsDrawerVisible, setSelectedApLldpNeighbor)}
      dataSource={(getApNeighborsStates.data?.neighbors as ApLldpNeighbor[]) ?? []}
      pagination={defaultPagination}
      actions={filterByAccess(tableActions)}
    />
    <ApLldpNeighborDetailsDrawer
      apLldpNeighbor={selectedApLldpNeighbor}
      visible={detailsDrawerVisible}
      setVisible={setDetailsDrawerVisible}
    />
  </Loader>
}

function useColumns (
  setDetailsDrawerVisible: (visible: boolean) => void,
  setSelectedApLldpNeighbor: (data: ApLldpNeighbor) => void
): TableProps<ApLldpNeighbor>['columns'] {
  const { $t } = useIntl()

  const columns: TableColumn<ApLldpNeighbor, 'text'>[] = [
    {
      key: 'lldpInterface',
      dataIndex: 'lldpInterface',
      render: (_, row, __, highlightFn) => {
        return <Button
          size='small'
          type='link'
          onClick={() => {
            setSelectedApLldpNeighbor(row)
            setDetailsDrawerVisible(true)
          }}
          children={highlightFn(row.lldpInterface ?? '')}
        />
      }
    },
    {
      key: 'lldpTime',
      dataIndex: 'lldpTime',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpTime, highlightFn)
    },
    {
      key: 'lldpSysName',
      dataIndex: 'lldpSysName',
      render: (_, row, __, highlightFn) => {
        const value = highlightFn(row.lldpSysName ?? '')
        if (!row.neighborManaged) return value

        const mac: string | undefined = row.lldpChassisID?.split(' ')[1]

        return <TenantLink
          // eslint-disable-next-line max-len
          to={`/devices/switch/${mac || row.neighborSerialNumber}/${row.neighborSerialNumber}/details/overview`}
          style={{ lineHeight: '20px' }}
          children={value}
        />
      }
    },
    {
      key: 'lldpSysDesc',
      dataIndex: 'lldpSysDesc',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpSysDesc, highlightFn)
    },
    {
      key: 'lldpChassisID',
      dataIndex: 'lldpChassisID',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpChassisID, highlightFn)
    },
    {
      key: 'lldpMgmtIP',
      dataIndex: 'lldpMgmtIP',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpMgmtIP, highlightFn)
    },
    {
      key: 'lldpCapability',
      dataIndex: 'lldpCapability',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpCapability, highlightFn)
    },
    {
      key: 'lldpPortDesc',
      dataIndex: 'lldpPortDesc',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpPortDesc, highlightFn)
    },
    {
      key: 'lldpPortID',
      dataIndex: 'lldpPortID',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpPortID, highlightFn)
    },
    {
      key: 'lldpDeviceType',
      dataIndex: 'lldpDeviceType',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpDeviceType, highlightFn)
    },
    {
      key: 'lldpClass',
      dataIndex: 'lldpClass',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpClass, highlightFn)
    },
    {
      key: 'lldpPDReqPowerVal',
      dataIndex: 'lldpPDReqPowerVal',
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpPDReqPowerVal, highlightFn)
    },
    {
      key: 'lldpPSEAllocPowerVal',
      dataIndex: 'lldpPSEAllocPowerVal',
      // eslint-disable-next-line max-len
      render: (_, row, __, highlightFn) => apNeighborValueRender(row.lldpPSEAllocPowerVal, highlightFn)
    }
  ]


  columns.forEach(column => {
    // eslint-disable-next-line max-len
    column.title = $t(lldpNeighborsFieldLabelMapping[column.dataIndex as keyof LldpNeighborsDisplayFields])
    column.sorter = { compare: sortProp(column.dataIndex as string, defaultSort) }
    column.searchable = true
  })

  return useMemo(() => columns, [])
}

interface ApLldpNeighborDetailsDrawerProps {
  apLldpNeighbor?: ApLldpNeighbor,
  visible: boolean,
  setVisible: (value: boolean) => void
}
function ApLldpNeighborDetailsDrawer (props: ApLldpNeighborDetailsDrawerProps) {
  const { $t } = useIntl()
  const { apLldpNeighbor, visible, setVisible } = props
  const content = apLldpNeighbor ? <Space size='small' direction='vertical'>
    <FieldsDisplaySection
      title={$t({ defaultMessage: 'Interface' })}
      apLldpNeighbor={apLldpNeighbor}
      fieldsName={['lldpInterface', 'lldpVia', 'lldpRID', 'lldpTime']}
      layout='horizontal'
    />
    <FieldsDisplaySection
      title={$t({ defaultMessage: 'Chassis' })}
      apLldpNeighbor={apLldpNeighbor}
      fieldsName={['lldpChassisID', 'lldpSysName', 'lldpSysDesc', 'lldpMgmtIP', 'lldpCapability']}
    />
    <FieldsDisplaySection
      title={$t({ defaultMessage: 'Port' })}
      apLldpNeighbor={apLldpNeighbor}
      fieldsName={[
        'lldpPortID', 'lldpPortDesc', 'lldpMFS', 'lldpPMDAutoNeg', 'lldpAdv', 'lldpMAUOperType',
        'lldpMDIPower', 'lldpDeviceType', 'lldpPowerPairs', 'lldpClass', 'lldpPowerType',
        'lldpPowerSource', 'lldpPowerPriority', 'lldpPDReqPowerVal', 'lldpPSEAllocPowerVal'
      ]}
    />
  </Space> : null

  return (
    <Drawer
      title={$t({ defaultMessage: 'Show Details' })}
      visible={visible}
      onClose={() => setVisible(false)}
      destroyOnClose={true}
      children={content}
      width={'500px'}
    />
  )
}

interface FieldDisplayProps {
  fieldName: keyof LldpNeighborsDisplayFields,
  fieldValue: string | null
}
function FieldDisplay (props: FieldDisplayProps) {
  const { $t } = useIntl()
  return (<Space size={2} split=':'>
    <div style={{ fontWeight: 600 }}>
      {$t(lldpNeighborsFieldLabelMapping[props.fieldName])}
    </div>
    <div>{apNeighborValueRender(props.fieldValue)}</div>
  </Space>)
}

interface MultipleFieldsDisplayProps {
  fields: FieldDisplayProps[],
  layout: 'horizontal' | 'vertical'
}
function MultipleFieldsDisplay (props: MultipleFieldsDisplayProps) {
  const { fields, layout } = props

  return (<Space
    split={layout === 'horizontal' ? ',' : null}
    direction={layout}
    size={layout === 'horizontal' ? 2 : 5}
  >
    {fields.map(field => {
      return <FieldDisplay
        key={field.fieldName}
        fieldName={field.fieldName}
        fieldValue={field.fieldValue}
      />
    })}
  </Space>)
}

interface FieldsDisplaySectionProps {
  title: string,
  apLldpNeighbor: ApLldpNeighbor,
  fieldsName: (keyof LldpNeighborsDisplayFields)[],
  layout?: 'horizontal' | 'vertical'
}
function FieldsDisplaySection (props: FieldsDisplaySectionProps) {
  const { title, apLldpNeighbor, fieldsName, layout = 'vertical' } = props

  return (<>
    <div style={{ color: 'var(--acx-neutrals-60)' }}>{title}</div>
    <MultipleFieldsDisplay
      fields={fieldsName.map(fieldName => ({ fieldName, fieldValue: apLldpNeighbor[fieldName] }))}
      layout={layout}
    />
  </>)
}
