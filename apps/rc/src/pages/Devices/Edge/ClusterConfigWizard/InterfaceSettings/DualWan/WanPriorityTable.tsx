import { useCallback, useMemo } from 'react'

import { TableProps, Table, RowProps } from 'antd'
import form                            from 'antd/lib/form'
import { cloneDeep, findIndex, get }   from 'lodash'
import { useIntl }                     from 'react-intl'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortableElementProps,
  SortableContainerProps
} from 'react-sortable-hoc'

import { EdgeWanLinkHealthCheckPolicy, EdgeWanMember } from '@acx-ui/rc/utils'

import { LinkHealthMonitorToggleButton }           from './LinkHealthMonitorToggleButton'
import { DragIcon, DragIconWrapper }               from './styledComponents'
import { getDisplayPortString, getDisplayWanRole } from './utils'

// @ts-ignore
const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
// @ts-ignore
const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)
interface DraggableTableRowProps extends RowProps {
  'data-row-key': number;
}

export const useDefaultColumns = (
  nodeNameMapping: Record<string, string>,
  // eslint-disable-next-line max-len
  onChange: (checked: boolean, healthCheckData: EdgeWanLinkHealthCheckPolicy | undefined, priority: number) => void
) => {
  const { $t } = useIntl()

  const DragHandle = SortableHandle(() => <DragIcon />)

  const columns: TableProps<EdgeWanMember>['columns'] = [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 50,
      render: (_, row) => {
        return <DragIconWrapper
          data-testid={`${row.priority}_dragWrapper`}
        >
          <DragHandle />
        </DragIconWrapper>
      }
    },
    {
      title: $t({ defaultMessage: 'Port' }),
      key: 'portName',
      dataIndex: 'portName',
      render: (_, row) => {
        const nodeName = get(nodeNameMapping, row.serialNumber)
        return getDisplayPortString(nodeName, row.portName)
      }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'priority',
      dataIndex: 'priority',
      render: (_, row) => {
        return getDisplayWanRole(row.priority)
      }
    },
    {
      title: $t({ defaultMessage: 'Link Health Monitoring' }),
      key: 'healthCheckEnabled',
      dataIndex: 'healthCheckEnabled',
      width: 200,
      render: (_, row) => {
        return <LinkHealthMonitorToggleButton
          portName={row.portName}
          enabled={row.healthCheckEnabled}
          data={row.linkHealthCheckPolicy}
          // eslint-disable-next-line max-len
          onChange={(checked: boolean, healthCheckData: EdgeWanLinkHealthCheckPolicy | undefined) => {
            onChange(checked, healthCheckData, row.priority)
          }}
        />
      }
    }
  ]
  return columns
}

interface WanPriorityTableProps {
  data?: EdgeWanMember[]
  onChange?: (data: EdgeWanMember[]) => void
  nodeNameMapping: Record<string, string>
}
export const WanPriorityTable = (props: WanPriorityTableProps) => {
  const { data, onChange, nodeNameMapping } = props

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex !== newIndex) {
        let tempDataSource = cloneDeep(data ?? [])
        let movingItem = tempDataSource.splice(oldIndex, 1)
        tempDataSource.splice(newIndex, 0, movingItem[0])

        // re-assign priority
        adjustPriority(tempDataSource)

        onChange?.(tempDataSource)
      }
    }, [data, form])

  const DraggableContainer = useMemo(() =>
    (props: SortableContainerProps) => {
      return <SortContainer
        useDragHandle
        disableAutoscroll
        onSortEnd={onSortEnd}
        {...props}
      />
    }, [onSortEnd])

  const DraggableTableRow = useMemo(() =>
    (props: DraggableTableRowProps) => {
      if (!data) return null

      const { className, style, ...restProps } = props
      const index = data.findIndex(
        (x) => x.priority === restProps['data-row-key']
      )
      return <SortableItem index={index} {...restProps} />
    }, [data])

  // eslint-disable-next-line max-len
  const onHealthCheckToggleChange = (checked: boolean, healthCheckData: EdgeWanLinkHealthCheckPolicy | undefined, priority: number) => {
    let tempDataSource = cloneDeep(data ?? [])
    const index = findIndex(data, { priority })
    tempDataSource[index].healthCheckEnabled = checked
    tempDataSource[index].linkHealthCheckPolicy = healthCheckData
    onChange?.(tempDataSource)
  }

  return <Table
    rowKey={'priority'}
    columns={useDefaultColumns(nodeNameMapping, onHealthCheckToggleChange)}
    dataSource={data}
    pagination={false}
    components={{
      body: {
        wrapper: DraggableContainer,
        row: DraggableTableRow
      }
    }}
  />
}

const adjustPriority = (data: EdgeWanMember[]) => {
  // re-assign priority
  data.forEach((item, index) => {
    item.priority = index + 1
  })
}