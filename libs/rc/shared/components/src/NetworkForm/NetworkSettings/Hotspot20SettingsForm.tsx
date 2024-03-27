import { useContext, useEffect, useState } from 'react'

import { Input, Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, StepsFormLegacy }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { InformationSolid }                                                     from '@acx-ui/icons'
import { useAddWifiOperatorMutation, useGetWifiOperatorListQuery }              from '@acx-ui/rc/services'
import { AAAWlanSecurityEnum, ManagementFrameProtectionEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { useParams }                                                            from '@acx-ui/react-router-dom'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }              from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import WifiOperatorDrawer from './WifiOperatorDrawer'

const { Option } = Select

export function Hotspot20SettingsForm () {
  const { editMode, data } = useContext(NetworkFormContext)

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <Hotspot20Form />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
    {!(editMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function Hotspot20Form () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const { editMode, cloneMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const wpa2Description = <FormattedMessage
    /* eslint-disable max-len */
    defaultMessage={`
      WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006.
      WPA2 should be selected unless you have a specific reason to choose otherwise.
      <highlight>
        6GHz radios are only supported with WPA3.
      </highlight>
    `}
    /* eslint-enable */
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  const wpa3Description = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  })

  const form = Form.useFormInstance()
  useEffect(() => {
    if (!editMode && !cloneMode) {
      if (!wlanSecurity || !Object.keys(AAAWlanSecurityEnum).includes(wlanSecurity)) {
        form.setFieldValue(['wlan', 'wlanSecurity'], WlanSecurityEnum.WPA2Enterprise)
        // eslint-disable-next-line max-len
        form.setFieldValue(['wlan', 'managementFrameProtection'], ManagementFrameProtectionEnum.Disabled)
      }
    }

    if (wlanSecurity === WlanSecurityEnum.WPA3){
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }

  }, [cloneMode, editMode, form, wlanSecurity])

  const handleWlanSecurityChanged = (v: WlanSecurityEnum) => {
    const managementFrameProtection = (v === WlanSecurityEnum.WPA3)
      ? ManagementFrameProtectionEnum.Required
      : ManagementFrameProtectionEnum.Disabled

    form.setFieldValue(['wlan', 'managementFrameProtection'], managementFrameProtection)
  }
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsFormLegacy.Title>{
          $t({ defaultMessage: 'Hotspot 2.0 Settings' }) }</StepsFormLegacy.Title>
        {triBandRadioFeatureFlag &&
          <Form.Item
            label='Security Protocol'
            name={['wlan', 'wlanSecurity']}
            extra={
              wlanSecurity === WlanSecurityEnum.WPA2Enterprise
                ? wpa2Description
                : wpa3Description
            }
          >
            <Select onChange={handleWlanSecurityChanged}>
              <Option value={WlanSecurityEnum.WPA2Enterprise}>
                { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
              </Option>
              <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
            </Select>
          </Form.Item>
        }
        <Form.Item name={['wlan', 'managementFrameProtection']} noStyle>
          <Input type='hidden' />
        </Form.Item>
      </div>
      <div>
        <Hotspot20Service />
      </div>
    </Space>
  )

  function Hotspot20Service () {
    const { $t } = useIntl()
    const params = useParams()
    // const { setData, data } = useContext(NetworkFormContext)
    const [showOperatorDrawer, setShowOperatorDrawer] = useState(false)
    // const [showProviderDrawer, setShowProviderDrawer] = useState(false)
    const [wifiOperatorId, setWifiOperatorId] = useState('')
    const [identityProviderId, setIdentityProviderId] = useState('')
    const [operatorForm] = Form.useForm()

    const [ createWifiOperator ] = useAddWifiOperatorMutation()

    const handleOperatorChange = (operatorId: string) => {
      setWifiOperatorId(operatorId)
    }

    const handleProviderChange = (providerId: string) => {
      setIdentityProviderId(providerId)
    }

    useEffect(() => {
      form.setFieldValue(['hotspot20Operator'], wifiOperatorId)
    }, [wifiOperatorId])

    const { operatorSelectOptions = [] } = useGetWifiOperatorListQuery(
      {
        payload: {
          fields: ['name', 'id'],
          pageSize: 100,
          sortField: 'name',
          sortOrder: 'ASC'
        }
      }, {
        selectFromResult: ({ data }) => {
          return {
            operatorSelectOptions: data?.data.map(item => ({ value: item.name, key: item.id }))
          }
        }
      })

    const handleAddOperator = () => {
      setShowOperatorDrawer(true)
    }

    const handleSaveWifiOperator = async () => {
      try {
        await operatorForm.validateFields()
        const formData = operatorForm.getFieldsValue()
        const payload = { ...formData,
          domainNames: formData.domainNames.split(/\r?\n/)
        }
        await createWifiOperator({
          params,
          payload
        }).unwrap().then((res)=>{
          setWifiOperatorId(res.response?.id as string)
        })
        operatorForm.resetFields()
        handleCloseWifiOperator()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }

    const handleCloseWifiOperator = async () => {
      setShowOperatorDrawer(false)
    }

    const handleAddProvider = () => {
      // setShowProviderDrawer(true)
    }

    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'Wi-Fi Operator' })}
            name='hotspot20Operator'
            style={{ width: '553px' }}
            rules={[
              { required: true },
              { validator: (_, value) => {
                if (value === 'Select...') {
                  return Promise.reject($t({ defaultMessage: 'Please select the Wi-Fi operator' }))
                }
                return Promise.resolve()
              } }
            ]}>
            <Select placeholder={$t({ defaultMessage: 'Select...' })}
              onChange={handleOperatorChange}
              options={operatorSelectOptions} />
          </Form.Item>

          <Button type='link'
            onClick={handleAddOperator}
            children={$t({ defaultMessage: 'Add' })}
            style={{ paddingTop: '10px' }} />
        </Space>

        <Space>
          <Form.Item
            label='Identity Provider'
            name='hotspot20Identity'
            style={{ width: '553px' }}
            rules={[
              { required: true },
              { validator: (_, value) => {
                if (value === 'Select...') {
                  return Promise.reject(
                    $t({ defaultMessage: 'Please select the identity provider' }))
                }
                return Promise.resolve()
              } }
            ]}
          >
            <Select placeholder={$t({ defaultMessage: 'Select...' })}
              onChange={handleProviderChange}
              value={identityProviderId} />
          </Form.Item>

          <Button type='link'
            onClick={handleAddProvider}
            children={$t({ defaultMessage: 'Add' })}
            style={{ paddingTop: '10px' }} />
        </Space>

        <WifiOperatorDrawer
          visible={showOperatorDrawer}
          drawerForm={operatorForm}
          handleClose={handleCloseWifiOperator}
          handleSave={handleSaveWifiOperator}
        />
      </Space>
    )
  }
}