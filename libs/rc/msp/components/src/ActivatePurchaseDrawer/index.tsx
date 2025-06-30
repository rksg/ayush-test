import { useEffect, useState } from 'react'
import React                   from 'react'

import { Checkbox, Divider, Form, Radio, Space } from 'antd'
import _                                         from 'lodash'
import moment                                    from 'moment'
import { defineMessage, useIntl }                from 'react-intl'

import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  showActionModal
} from '@acx-ui/components'
import { DateFormatEnum, formatter }               from '@acx-ui/formatter'
import { usePatchEntitlementsActivationsMutation } from '@acx-ui/rc/services'
import { EntitlementActivations }                  from '@acx-ui/rc/utils'
import { useUserProfileContext }                   from '@acx-ui/user'

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

  const { data: userProfile } = useUserProfileContext()
  const { visible, setVisible, activationData } = props
  const [resetField, setResetField] = useState(false)
  const [isTermsAndConditionsChecked, setTermsAndConditions] = useState(false)
  const [currentRegion, setCurrentRegion] = useState(RegionRadioButtonEnum.US)
  const [form] = Form.useForm()
  const [activatePurchase] = usePatchEntitlementsActivationsMutation()
  const isActivationStartdatePassed = moment(activationData?.spaStartDate).isBefore(new Date())
  const acivationStartDate = activationData?.trial
    ? activationData.orderCreateDate
    : (isActivationStartdatePassed
      ? moment(activationData?.spaStartDate)
      : moment(new Date()))

  useEffect(()=>{
    if(userProfile){
      const region = _.find(userProfile?.allowedRegions,(item)=>{
        return item.current === true
      })
      const cRegion = region?.name === 'Asia' ? RegionRadioButtonEnum.AS
        : (region?.name as RegionRadioButtonEnum)
      setCurrentRegion(cRegion)
      form.setFieldValue(['region'], cRegion )
    }
  },[userProfile])

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
      const region = form.getFieldValue(['region'])
      let payload = {
        region: region,
        startDate: moment((form.getFieldValue(['startDate']))).format('YYYY-MM-DD'),
        orderAcxRegistrationCode: activationData?.orderAcxRegistrationCode
      }
      if (region !== currentRegion) {
        const selRegion = _.find(regionList,(item)=>{
          return item.value === region
        })
        showActionModal({
          title: $t({ defaultMessage: 'Select Region' }),
          type: 'confirm',
          /* eslint-disable max-len */
          content: $t({ defaultMessage: 'You have selected {selRegion} region for availability of the licenses, which is a different region from the instance you are currently logged in. {br}{br}Are you sure you want to continue?' },
            { selRegion: <b>{selRegion?.label}</b>, br: <br></br> }),
          okText: $t({ defaultMessage: 'Yes' }),
          cancelText: $t({ defaultMessage: 'No' }),
          onOk: () => {
            activatePurchase({ payload, params: { orderId: activationData?.orderId } }).unwrap()
            setVisible(false)
            resetFields()
          }
        })
      } else {
        activatePurchase({ payload, params: { orderId: activationData?.orderId } }).unwrap()
        setVisible(false)
        resetFields()
      }
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
      label={$t({ defaultMessage: 'Select the region for your RUCKUS One hosted cloud services' })}
      rules={[
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a region' })
        }
      ]}
    >
      <Radio.Group style={{ width: '100%' }}>
        <Space direction='vertical' size='small' style={{ width: '100%' }}>
          {regionList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio disabled={item.value !== currentRegion} value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )
          })}
        </Space>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      name='startDate'
      label={$t({ defaultMessage:
            'Select Starting Date for your RUCKUS One hosted cloud services' })}
      style={{ marginTop: '30px' }}
      initialValue={moment(acivationStartDate)}

      rules={[
        { required: true,
          message: $t({ defaultMessage: 'Please select starting date' })
        }
      ]}
      children={
        <DatePicker
          format={formatter(DateFormatEnum.DateFormat)}
          disabled={isActivationStartdatePassed || activationData?.trial}
          disabledDate={(current) => {
            return current && (current < moment().startOf('day') ||
            current > moment(activationData?.spaStartDate).endOf('day'))
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
