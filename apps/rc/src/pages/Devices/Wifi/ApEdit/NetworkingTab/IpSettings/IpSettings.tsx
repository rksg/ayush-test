import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Radio, Row, Space, Typography } from 'antd'
import { defineMessage, useIntl }                          from 'react-intl'
import { useParams }                                       from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance }                                      from '@acx-ui/components'
import { useApViewModelQuery, useGetApNetworkSettingsQuery, useUpdateApNetworkSettingsMutation } from '@acx-ui/rc/services'
import { APNetworkSettings, networkWifiIpRegExp, subnetMaskIpRegExp }                            from '@acx-ui/rc/utils'

import { ApEditContext } from '../..'

enum IpTypeEnum {
  DYNAMIC = 'DYNAMIC',
  STATIC = 'STATIC'
}

export function IpSettings () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const formRef = useRef<StepsFormLegacyInstance<APNetworkSettings>>()

  const getApIpSettings = useGetApNetworkSettingsQuery({ params: { serialNumber } })
  const [updateApIpSettings, { isLoading: isUpdatingApIpSettings }] =
    useUpdateApNetworkSettingsMutation()

  const apViewModelPayload = {
    fields: ['name', 'serialNumber', 'apMac', 'IP', 'apStatusData.APSystem'],
    filters: { serialNumber: [serialNumber] }
  }
  const { data: currentAP, isLoading: isLoadingApViewModel, isFetching: isFetchingApViewModel }
    = useApViewModelQuery({
      params: { tenantId, serialNumber }, payload: apViewModelPayload
    })

  const [initData, setInitData] = useState({} as APNetworkSettings)
  const [currentIpType, setCurrentIpType] = useState('DYNAMIC')
  const [formInitializing, setFormInitializing] = useState(true)
  const [dynamicIpAddr, setDynamicIpAddr] = useState('')
  const [dynamicDns1, setDynamicDns1] = useState('')
  const [dynamicDns2, setDynamicDns2] = useState('')

  const apIpTypes= [
    {
      type: IpTypeEnum.DYNAMIC,
      text: defineMessage({ defaultMessage: 'Dynamic' })
    }, {
      type: IpTypeEnum.STATIC,
      text: defineMessage({ defaultMessage: 'Static' })
    }
  ]

  useEffect(() => {

    if (currentAP && getApIpSettings && !getApIpSettings.isLoading) {
      const { primaryDnsServer, secondaryDnsServer,
        gateway, ipType, netmask } = currentAP.apStatusData?.APSystem || {}

      setDynamicIpAddr(currentAP.IP || '')
      setDynamicDns1(primaryDnsServer || '')
      setDynamicDns2(secondaryDnsServer || '')

      let ipSettings = getApIpSettings.data
      if (!ipSettings) { // Do not config yet, use viewmodel data
        if (ipType === 'static') {
          ipSettings = {
            ipType: IpTypeEnum.STATIC,
            ip: currentAP.IP || '',
            netmask: netmask || '',
            gateway: gateway || '',
            primaryDnsServer: primaryDnsServer || '',
            secondaryDnsServer: secondaryDnsServer || ''
          }
        } else {
          ipSettings = {
            ipType: IpTypeEnum.DYNAMIC,
            ip: '',
            netmask: '',
            gateway: '',
            primaryDnsServer: '',
            secondaryDnsServer: ''
          }
        }
      }
      setCurrentIpType(ipSettings.ipType || IpTypeEnum.DYNAMIC)
      setInitData(ipSettings)
      setFormInitializing(false)
    }

  }, [getApIpSettings?.isLoading, currentAP])


  const handleUpdateIpSettings = async (values: APNetworkSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      const payload = {
        ...values
      }

      if (payload?.secondaryDnsServer?.trim() === '') {
        delete payload.secondaryDnsServer
      }

      //console.log('IP settings - payload: ', payload)
      await updateApIpSettings({
        params: { serialNumber },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    const ipType = form?.getFieldValue('ipType') || IpTypeEnum.DYNAMIC

    setCurrentIpType(ipType)

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: isDirty,
      hasError: checkFormIsInvalid(form as StepsFormLegacyInstance, ipType)
    })

    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      updateIpSettings: () => handleUpdateIpSettings(form?.getFieldsValue()),
      discardIpSettingsChanges: () => handleDiscard()
    })
  }

  const checkFormIsInvalid = (form: StepsFormLegacyInstance, ipType: string) => {
    if (ipType === IpTypeEnum.DYNAMIC) {
      return false
    }
    return form?.getFieldsError().map(item => item.errors).flat().length > 0
  }

  const handleDiscard = () => {
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApIpSettings || isLoadingApViewModel || isFetchingApViewModel
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleChange}
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        <Form.Item
          name='ipType'
          label={$t({ defaultMessage: 'IP Settings' })}
        >
          <Radio.Group>
            <Space direction='vertical'>
              {apIpTypes.map(({ type, text }) => (
                <Radio key={type} value={type}>
                  {$t(text)}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        {currentIpType === IpTypeEnum.DYNAMIC && (
          <Typography>
            <Typography.Title level={3}>{$t({ defaultMessage: 'IP Address' })}</Typography.Title>
            <Typography.Paragraph>{dynamicIpAddr}</Typography.Paragraph>
            <Typography.Title level={3}>{$t({ defaultMessage: 'DNS' })}</Typography.Title>
            <Typography.Paragraph>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ padding: 0, margin: 0 }}>{dynamicDns1}</li>
                <li style={{ padding: 0, margin: 0 }}>{dynamicDns2}</li>
              </ul>
            </Typography.Paragraph>
          </Typography>
        )}
        {currentIpType === IpTypeEnum.STATIC && (
          <Row>
            <Col span={6}>
              <Form.Item
                name='ip'
                label={$t({ defaultMessage: 'IP Address' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='netmask'
                label={$t({ defaultMessage: 'Network Mask' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => subnetMaskIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='gateway'
                label={$t({ defaultMessage: 'Gateway' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='primaryDnsServer'
                label={$t({ defaultMessage: 'Primary DNS' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiIpRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='secondaryDnsServer'
                label={$t({ defaultMessage: 'Secondary DNS' })}
                rules={[
                  { validator: (_, value) => networkWifiIpRegExp(value) }
                ]}
                children={<Input />}
              />
            </Col>
          </Row>
        )}
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>

  )
}
