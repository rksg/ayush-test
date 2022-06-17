import ProTable  from '@ant-design/pro-table'
import { Space } from 'antd'

import * as UI from './styledComponents'

import type { ProColumns }                  from '@ant-design/pro-table'
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
          ? (props) => <UI.RotatedColumn children={Title(props, undefined, null)} />
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
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <>
          <Space>
            <span>
              {selectedRowKeys.length} selected
              <a className='table-alert-close-button' onClick={onCleanSelected} >
                x
              </a>
            </span>
          </Space>
          <Space>
            {
              props.alertOptions?.map((option, index) => 
                <p key={option.key} className={'alert-option-span'}>
                  <a onClick={()=>option.onClick()} className='alert-options'>
                    {option.label}
                  </a>
                  {(props.alertOptions
                    && index + 1 < props?.alertOptions?.length)
                    && <span className='options-divider' key={`optionsDivider${index}`}>|</span>}
                </p>
              )
            }
          </Space>
        </> 
      )}
      tableAlertOptionRender={false}
    />
  </UI.Wrapper>
}
