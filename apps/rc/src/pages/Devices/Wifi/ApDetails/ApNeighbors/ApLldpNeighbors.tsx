import { useEffect, useMemo, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps }       from '@acx-ui/components'
import { useLazyGetApLldpNeighborsQuery, useDetectApNeighborsMutation } from '@acx-ui/rc/services'
import {
  ApLldpNeighbor,
  ApLldpNeighborsResponse,
  CatchErrorResponse,
  defaultSort,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { emtpyRenderer }                   from './ApRfNeighbors'
import { lldpNeighborsFieldLabelMapping }  from './contents'
import { DetectionStatus, useApNeighbors } from './useApNeighbors'

import type { LldpNeighborsDisplayFields } from './contents'

export default function ApLldpNeighbors () {
  const { $t } = useIntl()
  const { serialNumber } = useApContext()
  // eslint-disable-next-line max-len
  const [ getApLldpNeighbors, { isLoading: isLoadingApLldpNeighbors }] = useLazyGetApLldpNeighborsQuery()
  const [ detectApNeighbors, { isLoading: isDetecting } ] = useDetectApNeighborsMutation()
  const { setRequestId, detectionStatus, handleError } = useApNeighbors('', socketHandler)
  const [ tableData, setTableData ] = useState<ApLldpNeighborsResponse>()
  const [ detailsDrawerVisible, setDetailsDrawerVisible ] = useState(false)
  const [ selectedApLldpNeighbor, setSelectedApLldpNeighbor ] = useState<ApLldpNeighbor>()

  useEffect(() => {
    doDetect()
  }, [])

  const doDetect = async () => {
    try {
      const result = await detectApNeighbors({
        params: { serialNumber },
        payload: { action: 'DETECT_LLDP_NEIGHBOR' }
      }).unwrap()

      setRequestId(result.requestId)
    } catch (error) {
      setRequestId('')
      handleError(error as CatchErrorResponse)
    }
  }

  const tableActions = [{
    label: $t({ defaultMessage: 'Detect' }),
    disabled: isDetecting,
    onClick: doDetect
  }]

  async function socketHandler () {
    try {
      const data = await getApLldpNeighbors({ params: { serialNumber } }).unwrap()
      setTableData(data)
    } catch (error) {
      handleError(error as CatchErrorResponse)
    }
  }

  const isTableLoading = (): boolean => {
    return isLoadingApLldpNeighbors || detectionStatus === DetectionStatus.FETCHING
  }

  return <Loader states={[{ isLoading: isTableLoading() }]}>
    <Table
      settingsId='ap-lldp-neighbors-table'
      rowKey='lldpPortID'
      columns={useColumns(setDetailsDrawerVisible, setSelectedApLldpNeighbor)}
      dataSource={tableData?.neighbors ?? []}
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
          children={data}
        />
      }
    },
    {
      key: 'lldpTime',
      dataIndex: 'lldpTime',
      title: $t({ defaultMessage: 'Time' })
    },
    {
      key: 'lldpSysName',
      dataIndex: 'lldpSysName',
      title: $t({ defaultMessage: 'System Name' })
    },
    {
      key: 'lldpSysDesc',
      dataIndex: 'lldpSysDesc',
      title: $t({ defaultMessage: 'System Description' })
    },
    {
      key: 'lldpChassisID',
      dataIndex: 'lldpChassisID',
      title: $t({ defaultMessage: 'Chassis ID' })
    },
    {
      key: 'lldpMgmtIP',
      dataIndex: 'lldpMgmtIP',
      title: $t({ defaultMessage: 'Mgmt IP' })
    },
    {
      key: 'lldpPortID',
      dataIndex: 'lldpPortID',
      title: $t({ defaultMessage: 'Port ID' })
    },
    {
      key: 'lldpClass',
      dataIndex: 'lldpClass',
      title: $t({ defaultMessage: 'Power Class' })
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
