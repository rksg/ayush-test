import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPOption } from '@acx-ui/rc/utils'

import { OptionAddButton } from '../styledComponents'

const dataOption = {
  id: 0,
  optId: '',
  name: '',
  format: '',
  value: ''
}
export function OptionList (props:{
  optionData: DHCPOption[],
  updateOptionData?: (data:DHCPOption[]) => void,
  showOptionForm?: (data:DHCPOption) => void,
}) {
  const { $t } = useIntl()
  const { optionData, updateOptionData, showOptionForm } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })
  const actions: TableProps<DHCPOption>['actions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPOption | DHCPOption[]) => {
        if (Array.isArray(rows) && rows.length===1) {
          showOptionForm?.(rows[0])
        }else{
          showError(true)
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPOption | DHCPOption[], clearSelection) => {

        if (Array.isArray(rows)) {
          rows.forEach(item => {
            const index = optionData.findIndex(i => i.id === item.id)
            if (index !== -1) {
              optionData.splice(index, 1)
            }
          })
        }
        clearSelection()
        updateOptionData?.(optionData)
      }
    }
  ]

  const columns: TableProps<DHCPOption>['columns'] = [
    {
      title: $t({ defaultMessage: 'Option ID' }),
      dataIndex: 'optId',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Name' }),
      dataIndex: 'name',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Format' }),
      dataIndex: 'format',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Value' }),
      width: 50,
      dataIndex: 'value'
    }
  ]
  return (
    <>
      {
        errorVisible &&
      <Alert message={$t(errorMessage)} type='error' showIcon closable />
      }
      <div>
        <OptionAddButton key='addOpt'
          type='primary'
          onClick={() => {
            showOptionForm?.(dataOption)
          }}>
          {$t({ defaultMessage: 'Add option' })}
        </OptionAddButton>
      </div>
      <Table
        rowKey='id'
        style={{ width: '800px' }}
        columns={columns}
        dataSource={[...optionData]}
        type={'tall'}
        actions={actions}
        rowSelection={{ defaultSelectedRowKeys: [] }}
      />
    </>
  )
}
