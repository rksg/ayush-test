import { Space } from 'antd'
import ProTable from '@ant-design/pro-table'
import type { ProColumns } from '@ant-design/pro-table'
import * as UI from './styledComponents'

import type { TableProps as AntTableProps } from 'antd'
export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' > {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'rotated' | 'selectable' | 'singleSelect'
    options?: false | undefined
    search?: false | undefined
    headerTitle?: String
    columns: ProColumns<RecordType, 'text'>[] | undefined
    alertOptions?: ActionListItem[]
  }

type ActionListItem = {
  key: number,
  label: string,
  onClick: () => void
}

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  let columns = props.columns
  if (type === 'rotated' && columns) {
    columns = columns.map(column => {
      if (column.sorter) return column

      const Title = column.title
      return {
        ...column,
        title: typeof Title === 'function'
          ? (props) => <UI.RotatedColumn children={<Title {...props} />} />
          : <UI.RotatedColumn children={Title} />
      }
    })
  }

  return <UI.Wrapper $type={type}>
    <ProTable<RecordType>
      {...props}
      bordered={false}
      options={false}
      search={false}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={columns}
      rowSelection={
        (type === 'selectable' && { defaultSelectedRowKeys: [] }) ||
        (type === 'singleSelect' && { defaultSelectedRowKeys: [], type: 'radio' })
      }
      tableAlertRender={({selectedRowKeys, onCleanSelected}) => (
        <>
          <Space>
            <span>
              {selectedRowKeys.length} selected
              <a className='table-alert-close-button' style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                x
              </a>
            </span>
          </Space>
          <Space size={12}>
            {
              props.alertOptions?.map(option => 
                <>
                  <a onClick={()=>option.onClick()} key={option.key} className='alert-options'>
                    {option.label}
                  </a>
                  <div className='options-divider'>|</div>
                </>
              )
            }
          </Space>
        </> 
      )}
      tableAlertOptionRender={false}
    />
  </UI.Wrapper>
}
