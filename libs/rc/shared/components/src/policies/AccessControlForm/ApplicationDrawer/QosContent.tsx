import React from 'react'

import { Form, FormInstance, Select } from 'antd'
import { useIntl }                    from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'

import {
  appRateStrategyLabelMapping,
  appRateTypeLabelMapping,
  RateStrategyEnum,
  RateTypeEnum
} from './ApplicationRuleContent'

import { DrawerFormItem } from './index'

export interface QosContentProps {
  drawerForm: FormInstance
}

const QosContent = (props: QosContentProps) => {
  const { $t } = useIntl()
  const { drawerForm } = props

  const maxUplinkRateContent = <GridRow>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        name={['uplinkMarking', 'value']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RateTypeEnum.IEEE802_1P}
        children={<Select
          onChange={(value) => drawerForm.setFieldValue(['uplinkMarking', 'value'], value)}
          options={Object.keys(RateTypeEnum).map((key) => {
            return (
              { value: key, label: $t(appRateTypeLabelMapping[key as RateTypeEnum]) }
            )
          })} />}
      />
    </GridCol>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        name={['uplinkMarking', 'strategy']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RateStrategyEnum.BACKGROUND}
        children={<Select
          onChange={(value) => drawerForm.setFieldValue(['uplinkMarking', 'strategy'], value)}
          options={Object.keys(RateStrategyEnum).map((key) => {
            return (
              { value: key, label: $t(appRateStrategyLabelMapping[key as RateStrategyEnum]) }
            )
          })} />}
      />
    </GridCol>
  </GridRow>

  const maxDownlinkRateContent = <GridRow>
    <GridCol col={{ span: 24 }}>
      <Form.Item
        name={['downlinkPriority', 'value']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RateStrategyEnum.VOICE}
        children={<Select
          onChange={(value) => drawerForm.setFieldValue(['downlinkPriority', 'value'], value)}
          options={Object.keys(RateStrategyEnum).map((key) => {
            return (
              { value: key, label: $t(appRateStrategyLabelMapping[key as RateStrategyEnum]) }
            )
          })} />}
      />
    </GridCol>
  </GridRow>

  return <>
    <DrawerFormItem
      name='uplinkMarking'
      style={{ width: '100%' }}
      wrapperCol={{ span: 24 }}
      label={$t({ defaultMessage: 'Uplink Marking' })}
    >
      {maxUplinkRateContent}
    </DrawerFormItem>
    <DrawerFormItem
      name='downlinkPriority'
      style={{ width: '100%' }}
      wrapperCol={{ span: 24 }}
      label={$t({ defaultMessage: 'Downlink Priority' })}
    >
      {maxDownlinkRateContent}
    </DrawerFormItem>
  </>
}

export default QosContent
