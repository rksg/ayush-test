import { useEffect, useState } from 'react'

import {
  Form,
  Input,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  StepsForm,
  TableProps,
  useStepFormContext
} from '@acx-ui/components'
import { AccessSwitchTable, AccessSwitchTableDataType } from '@acx-ui/rc/components'
import { AccessSwitch, DistributionSwitch }             from '@acx-ui/rc/utils'

import { NetworkSegmentationGroupFormData } from '..'

import { AccessSwitchDrawer } from './AccessSwitchDrawer'

export function AccessSwitchForm () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AccessSwitch[]>([])
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])

  const distributionSwitchInfos = form.getFieldValue(
    'distributionSwitchInfos'
  ) as DistributionSwitch[]
  const accessSwitchInfos = Form.useWatch('accessSwitchInfos', form) ||
    form.getFieldValue('accessSwitchInfos')
  const venueId = form.getFieldValue('venueId')

  useEffect(() => {
    setAccessSwitchData(accessSwitchInfos?.map(as => ({
      ...as,
      distributionSwitchName: distributionSwitchInfos
        ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
    })))
  }, [accessSwitchInfos, distributionSwitchInfos])

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
    <StepsForm.Title>{$t({ defaultMessage: 'Access Switch Settings' })}</StepsForm.Title>
    <Typography.Paragraph>
      {$t({ defaultMessage: 'Set the configuration on these access switches:' })}
    </Typography.Paragraph>
    <AccessSwitchTable rowActions={rowActions}
      rowSelection={{ type: 'checkbox', selectedRowKeys: selected.map(as=>as.id) }}
      editHandler={(as)=>{
        setSelected([as])
        setOpen(true)
      }}
      dataSource={accessSwitchData} />
    <Form.Item name='accessSwitchInfos'
      rules={[{
        validator: (_, asList) => {
          if (!asList || asList.length === 0) {
            return Promise.resolve()
          }
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
