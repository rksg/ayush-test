
import { useState } from 'react'

import {
  Space } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button,
  Drawer,
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import {
  DeleteOutlinedIcon,
  EditOutlinedIcon
} from '@acx-ui/icons'
import {
  useDebugRequestsMutation,
  useDeleteLagMutation,
  useGetLagListQuery,
  useSwitchDetailHeaderQuery
}                            from '@acx-ui/rc/services'
import { isOperationalSwitch, Lag, StackMember } from '@acx-ui/rc/utils'
import { filterByAccess }                        from '@acx-ui/user'


interface SwitchBlinkLEDsProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  switchId: string
  isStack: boolean
  stackMembers?: StackMember
}

export const SwitchBlinkLEDsDrawer = (props: SwitchBlinkLEDsProps) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const [applyBlinkLEDs] = useDebugRequestsMutation()


  const onClose = () => {
    setVisible(false)
  }


  const onApply = () => {
    setVisible(false)
  }


  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={onApply}>
        {$t({ defaultMessage: 'Start' })}
      </Button>
    </Space>
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Blink LEDs' })}
      visible={visible}
      onClose={onClose}
      width={644}
      footer={footer}
      children={
        <div>Duration</div>
        // <Table
        //   columns={columns}
        //   type='compact'
        //   dataSource={data}
        //   rowKey='name'
        //   actions={filterByAccess([{
        //     label: $t({ defaultMessage: 'Add LAG' }),
        //     disabled: !isOperational,
        //     onClick: () => {
        //       setModalVisible(true)
        //       setIsEditMode(false)
        //     }
        //   }])}
        // />
      }
    />
  )
}
