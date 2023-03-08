import React, { useState } from 'react'

import {
  Form,
  Typography } from 'antd'
import { useIntl } from 'react-intl'

import {
  StepsForm,
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
  const [selected, setSelected] = useState<AccessSwitch[]>()

  const accessSwitchInfos = useWatch('accessSwitchInfos', form)
  const venueId = useWatch('venueId', form)

  const onClose = () => {
    setOpen(false)
  }

  const onSave = (values: Partial<AccessSwitch>) => {
    if (!selected || !accessSwitchInfos) return

    const newList = accessSwitchInfos.map(as => {
      const isSelected = selected.map(item => item.id).includes(as.id)
      if (isSelected) {
        return { ...as, ...values }
      }
      return as
    })
    setSelected(undefined)
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
    <StepsForm.Title>{$t({ defaultMessage: 'Access Switch Settings' })}</StepsForm.Title>
    <Typography.Paragraph>
      {$t({ defaultMessage: 'Set the configuration on these access switches:' })}
    </Typography.Paragraph>
    <Form.Item name='accessSwitchInfos' hidden />
    <AccessSwitchTable rowActions={rowActions}
      rowSelection={{ type: 'checkbox', selectedRowKeys: selected? selected.map(as=>as.id) : [] }}
      dataSource={accessSwitchInfos} />
    <AccessSwitchDrawer
      open={open}
      editRecords={selected}
      venueId={venueId}
      onClose={onClose}
      onSave={onSave} />
  </>)
}
