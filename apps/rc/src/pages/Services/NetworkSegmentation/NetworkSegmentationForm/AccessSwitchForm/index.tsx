import React, { useState } from 'react'

import {
  Form,
  Input,
  Typography } from 'antd'
import { useIntl } from 'react-intl'

import {
  StepsFormNew,
  TableProps,
  useStepFormContext
} from '@acx-ui/components'
import { AccessSwitch } from '@acx-ui/rc/utils'

import { NetworkSegmentationGroupForm } from '..'
import { useWatch }                     from '../../useWatch'

import { AccessSwitchDrawer } from './AccessSwitchDrawer'
import { AccessSwitchTable }  from './AccessSwitchTable'


export function AccessSwitchForm () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AccessSwitch[]>([])

  const accessSwitchInfos = useWatch('accessSwitchInfos', form)
  const venueId = useWatch('venueId', form)

  const onClose = () => {
    setOpen(false)
  }

  const onSave = (values: Partial<AccessSwitch>) => {
    if (!accessSwitchInfos) return

    const newList = accessSwitchInfos.map(as => {
      const isSelected = selected.map(item => item.id).includes(as.id)
      if (isSelected) {
        return { ...as, ...values }
      }
      return as
    })
    setSelected([])
    setOpen(false)

    form.setFieldValue('accessSwitchInfos', newList)
  }

  const rowActions: TableProps<AccessSwitch>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected(selectedRows)
        setOpen(true)
      }
    }
  ]

  return (<>
    <StepsFormNew.Title>{$t({ defaultMessage: 'Access Switch Settings' })}</StepsFormNew.Title>
    <Typography.Paragraph>
      {$t({ defaultMessage: 'Set the configuration on these access switches:' })}
    </Typography.Paragraph>
    <AccessSwitchTable rowActions={rowActions}
      rowSelection={{ type: 'checkbox', selectedRowKeys: selected.map(as=>as.id) }}
      dataSource={accessSwitchInfos} />
    <Form.Item name='accessSwitchInfos'
      rules={[{
        validator: (_, asList) => {
          const checkFn = (as: AccessSwitch) =>
            as.vlanId && as.uplinkInfo?.uplinkId && as.webAuthPageType
          return asList.every(checkFn) ? Promise.resolve() :
            Promise.reject(new Error($t({ defaultMessage:
            'Please fill out the configuration for all of the access switches.' })))
        }
      }]}
      children={<Input type='hidden'/>} />
    <AccessSwitchDrawer
      open={open}
      editRecords={selected}
      venueId={venueId}
      onClose={onClose}
      onSave={onSave} />
  </>)
}
