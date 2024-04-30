import { useState } from 'react'
import React        from 'react'

import { Checkbox, Divider, Form, Radio } from 'antd'
import { useForm }                        from 'antd/lib/form/Form'
import moment                             from 'moment'
import { defineMessage, useIntl }         from 'react-intl'

import {
  Button,
  DatePicker,
  Descriptions,
  Drawer
} from '@acx-ui/components'
import { DateFormatEnum, formatter }               from '@acx-ui/formatter'
import { SpaceWrapper }                            from '@acx-ui/rc/components'
import { usePatchEntitlementsActivationsMutation } from '@acx-ui/rc/services'
import { EntitlementActivations }                  from '@acx-ui/rc/utils'

interface ActivatePurchaseDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  activationData?: EntitlementActivations
}

enum RegionRadioButtonEnum {
  AS = 'AS',
  EU = 'EU',
  US = 'US'
}

const getRegions = () => {
  return [
    {
      label: defineMessage({ defaultMessage: 'Asia' }),
      value: RegionRadioButtonEnum.AS
    },
    {
      label: defineMessage({ defaultMessage: 'Europe' }),
      value: RegionRadioButtonEnum.EU
    },
    {
      label: defineMessage({ defaultMessage: 'North America' }),
      value: RegionRadioButtonEnum.US
    }]
}

export const ActivatePurchaseDrawer = (props: ActivatePurchaseDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, activationData } = props
  const [resetField, setResetField] = useState(false)
  const [isTermsAndConditionsChecked, setTermsAndConditions] = useState(false)
  const [form] = useForm()
  const [activatePurchase] = usePatchEntitlementsActivationsMutation()
  const isActivationEnddatePassed = moment(activationData?.spaEndDate).isBefore(new Date())

  const onClose = () => {
    setVisible(false)
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleActivate = async () => {
    try {
      await form.validateFields()
      let payload = {
        region: form.getFieldValue(['region']),
        startDate: formatter(DateFormatEnum.DateFormat)(form.getFieldValue(['startDate'])),
        orderAcxRegistrationCode: activationData?.orderAcxRegistrationCode
      }

      activatePurchase({ payload, params: { orderId: activationData?.orderId } })
        .then(() => {
          setVisible(false)
          resetFields()
        })
      setVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const regionList = getRegions().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const formContent = <Form layout='vertical'form={form} >
    <Form.Item colon={false}
      children={
        <Descriptions colon={false} labelWidthPercent={40} >
          <Descriptions.Item
            style={{ paddingBottom: '2px' }}
            label={$t({ defaultMessage: 'SPA Activation Code' })}
            children={<div style={{ fontWeight: 650 }}>
              {activationData?.orderAcxRegistrationCode}</div>}
          />
          <Descriptions.Item
            style={{ paddingBottom: '2px' }}
            label={$t({ defaultMessage: 'Part Number' })}
            children={<div style={{ fontWeight: 650 }}>
              {activationData?.productCode}</div>}
          />

          <Descriptions.Item
            style={{ paddingBottom: '2px' }}
            label={$t({ defaultMessage: 'Part Number Description' })}
            children={<div style={{ fontWeight: 650 }}>
              {activationData?.productName}</div>}
          />
          <Descriptions.Item
            style={{ paddingBottom: '2px' }}
            label={$t({ defaultMessage: 'Quantity' })}
            children={<div style={{ fontWeight: 650 }}>
              {activationData?.quantity}</div>}
          />
        </Descriptions>
      }/>
    <Divider />
    <Form.Item
      name='region'
      label={$t({ defaultMessage: 'Select the region for your RUCKUS One hosted cloud servicese' })}
      rules={[
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a region' })
        }
      ]}
    >
      <Radio.Group style={{ width: '100%' }}>
        <SpaceWrapper full direction='vertical' size='small'>
          {regionList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      name='startDate'
      label={$t({ defaultMessage:
            'Select Starting Date for your RUCKUS One hosted cloud services' })}
      style={{ marginTop: '30px' }}
      initialValue={isActivationEnddatePassed
        ? moment(activationData?.spaEndDate)
        : moment(new Date())}

      rules={[
        { required: true,
          message: $t({ defaultMessage: 'Please select starting date' })
        }
      ]}
      children={
        <DatePicker
          format={formatter(DateFormatEnum.DateFormat)}
          disabled={isActivationEnddatePassed}
          disabledDate={(current) => {
            return current && (current < moment().endOf('day') ||
            current > moment(activationData?.spaEndDate).endOf('day'))
          }}
          style={{ width: '300px' }}
        />
      }
    />
    <Form.Item
      label={$t({ defaultMessage:
        '(End Date is auto-calculated based on the selected Start Date)' })}
    />
  </Form>

  const footer =<div>
    <div style={{ marginBottom: '20px' }}>
      <Checkbox
        checked={isTermsAndConditionsChecked}
        style={{ marginBottom: '8px' }}
        onChange={(e)=>setTermsAndConditions(e.target.checked)} >
        {$t({ defaultMessage: 'I accept the Terms and Conditions.' })}
      </Checkbox>
      <div><label>{$t({ defaultMessage:
          'By checking accept, you hereby acknowledge and agree to the following' })}</label></div>
      <div><Button type='link'
        size={'small'}
        onClick={() => {
          setTermsAndConditions(true)
          const urlTaC = 'https://support.ruckuswireless.com/ruckus-one-terms-and-conditions'
          window.open(urlTaC, '_blank')
        }}
      >
        {$t({ defaultMessage: 'RUCKUS One Terms and Conditions.' })}
      </Button></div>
    </div>
    <Button
      onClick={handleActivate}
      disabled={!isTermsAndConditionsChecked}
      type='primary'>
      {$t({ defaultMessage: 'Activate' })}
    </Button>
    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Activate Purchase' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={485}
    >
      {formContent}
    </Drawer>
  )
}
