import { useMemo, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { useLazyGetApLldpNeighborsQuery }                         from '@acx-ui/rc/services'
import {
  ApLldpNeighbor,
  CatchErrorResponse,
  defaultSort,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { emtpyRenderer }                  from './ApRfNeighbors'
import { defaultPagination }              from './constants'
import { lldpNeighborsFieldLabelMapping } from './contents'
import { handleError, useApNeighbors }    from './useApNeighbors'

import type { LldpNeighborsDisplayFields } from './contents'

export default function ApLldpNeighbors () {
  const { $t } = useIntl()
  const { serialNumber } = useApContext()
  const [ getApLldpNeighbors, getApLldpNeighborsStates ] = useLazyGetApLldpNeighborsQuery()
  const { doDetect, isDetecting } = useApNeighbors('lldp', serialNumber!, socketHandler)
  const [ detailsDrawerVisible, setDetailsDrawerVisible ] = useState(false)
  const [ selectedApLldpNeighbor, setSelectedApLldpNeighbor ] = useState<ApLldpNeighbor>()

  const tableActions = [{
    label: $t({ defaultMessage: 'Detect' }),
    disabled: isDetecting,
    onClick: doDetect
  }]

  function socketHandler () {
    try {
      getApLldpNeighbors({ params: { serialNumber } }).unwrap()
    } catch (error) {
      handleError(error as CatchErrorResponse)
    }
  }

  const isTableFetching = () => {
    return getApLldpNeighborsStates.isFetching || isDetecting
  }

  const getRowKey = (record: ApLldpNeighbor): string => {
    return record.lldpTime + (record.lldpPortID ?? '') + (record.lldpChassisID ?? '')
  }

  return <Loader states={[{
    isLoading: getApLldpNeighborsStates.isLoading,
    isFetching: isTableFetching()
  }]}>
    <Table
      settingsId='ap-lldp-neighbors-table'
      rowKey={getRowKey}
      columns={useColumns(setDetailsDrawerVisible, setSelectedApLldpNeighbor)}
      dataSource={getApLldpNeighborsStates.data?.neighbors ?? []}
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
      render: (data, row) => {
        return <Button
          size='small'
          type='link'
          onClick={() => {
            setSelectedApLldpNeighbor(row)
            setDetailsDrawerVisible(true)
          }}
          children={row.lldpInterface}
        />
      }
    },
    {
      key: 'lldpTime',
      dataIndex: 'lldpTime'
    },
    {
      key: 'lldpSysName',
      dataIndex: 'lldpSysName',
      render: (data, row) => {
        if (!row.neighborManaged) return data

        const mac: string | undefined = row.lldpChassisID?.split(' ')[1]

        return <TenantLink
          // eslint-disable-next-line max-len
          to={`/devices/switch/${mac || row.neighborSerialNumber}/${row.neighborSerialNumber}/details/overview`}
          style={{ lineHeight: '20px' }}
          children={data}
        />
      }
    },
    {
      key: 'lldpSysDesc',
      dataIndex: 'lldpSysDesc'
    },
    {
      key: 'lldpChassisID',
      dataIndex: 'lldpChassisID'
    },
    {
      key: 'lldpMgmtIP',
      dataIndex: 'lldpMgmtIP'
    },
    {
      key: 'lldpCapability',
      dataIndex: 'lldpCapability'
    },
    {
      key: 'lldpPortDesc',
      dataIndex: 'lldpPortDesc'
    },
    {
      key: 'lldpPortID',
      dataIndex: 'lldpPortID'
    },
    {
      key: 'lldpMDIPower',
      dataIndex: 'lldpMDIPower'
    },
    {
      key: 'lldpClass',
      dataIndex: 'lldpClass'
    },
    {
      key: 'lldpPDReqPowerVal',
      dataIndex: 'lldpPDReqPowerVal'
    },
    {
      key: 'lldpPSEAllocPowerVal',
      dataIndex: 'lldpPSEAllocPowerVal'
    }
  ]


  columns.forEach(column => {
    // eslint-disable-next-line max-len
    column.title = $t(lldpNeighborsFieldLabelMapping[column.dataIndex as keyof LldpNeighborsDisplayFields])
    column.sorter = { compare: sortProp(column.dataIndex as string, defaultSort) }
    column.searchable = true
    column.render = column.render ?? emtpyRenderer
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
    <div>{emtpyRenderer(props.fieldValue)}</div>
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
