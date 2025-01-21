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
import { Features }                                                            from '@acx-ui/feature-toggle'
import { AccessSwitchTable, AccessSwitchTableDataType, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { AccessSwitch, DistributionSwitch, PersonalIdentityNetworkFormData }   from '@acx-ui/rc/utils'

import { AccessSwitchDrawer } from './AccessSwitchDrawer'

export function AccessSwitchForm () {
  const { $t } = useIntl()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)

  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()

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
      {isEdgePinEnhanceReady
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'Ensure that the uplink port and VLAN ID are properly configured on the connected access switches.' })
        : $t({ defaultMessage: 'Set the configuration on these access switches:' })}
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