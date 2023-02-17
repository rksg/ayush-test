import { useContext, useEffect, useState } from 'react'

import { Radio, RadioChangeEvent, Space, Typography } from 'antd'
import {
  Col,
  Form,
  Row,
  Select
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Button, StepsForm }             from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useGetDpskListQuery }           from '@acx-ui/rc/services'
import {
  WlanSecurityEnum,
  DpskSaveData,
  transformDpskNetwork,
  DpskNetworkType,
  transformAdvancedDpskExpirationText
} from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './../NetworkMoreSettings/NetworkMoreSettingsForm'
import { CloudpathServerForm }     from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function DpskSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        isCloudpathEnabled: data.isCloudpathEnabled,
        dpskServiceProfileId: data?.dpskServiceProfileId,
        dpskWlanSecurity: data?.wlan?.wlanSecurity,
        enableAccountingService: data.accountingRadius,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId,
        authRadiusId: data.authRadiusId
      })
    }
  }, [data])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const form = Form.useFormInstance()
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const isCloudpathEnabled = useWatch('isCloudpathEnabled')

  const onCloudPathChange = (e: RadioChangeEvent) => {
    form.setFieldValue(e.target.value ? 'dpskServiceProfileId' : 'cloudpathServerId', '')

    setData && setData({ ...data, isCloudpathEnabled: e.target.value })
  }
  const disableAAA = !useIsSplitOn(Features.POLICIES)||true
  return (
    <>
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <StepsForm.Title>{ $t({ defaultMessage: 'DPSK Settings' }) }</StepsForm.Title>
          <Form.Item
            label={$t({ defaultMessage: 'Security Protocol' })}
            name='dpskWlanSecurity'
            initialValue={WlanSecurityEnum.WPA2Personal}
          >
            <Select>
              <Option value={WlanSecurityEnum.WPA2Personal}>
                { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
              </Option>
              <Option value={WlanSecurityEnum.WPAPersonal}>
                { $t({ defaultMessage: 'WPA' }) }</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name='isCloudpathEnabled'
            initialValue={false}
          >
            <Radio.Group onChange={onCloudPathChange}>
              <Space direction='vertical'>
                <Radio value={false} disabled={editMode}>
                  { $t({ defaultMessage: 'Use the DPSK Service' }) }
                </Radio>
                <Radio value={true} disabled={editMode||disableAAA}>
                  { $t({ defaultMessage: 'Use Cloudpath Server' }) }
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
        <div>
          {isCloudpathEnabled ? <CloudpathServerForm /> : <DpskServiceSelector />}
        </div>
      </Space>
      {!editMode && <NetworkMoreSettingsForm wlanData={data} />}
    </>
  )
}

function DpskServiceSelector () {
  const intl = useIntl()
  const $t = intl.$t
  const [ dpskOptions, setDpskOptions ] = useState<DefaultOptionType[]>([])
  const [ selectedDpsk, setSelectedDpsk ] = useState<DpskSaveData>()
  const { data: dpskList } = useGetDpskListQuery({})
  const dpskServiceProfileId = useWatch('dpskServiceProfileId')

  const findService = (serviceId: string) => {
    return dpskList?.data.find((dpsk: DpskSaveData) => dpsk.id === serviceId)
  }

  useEffect(() => {
    if (dpskList?.data) {
      setDpskOptions(dpskList.data.map((dpsk: DpskSaveData) => {
        return { label: dpsk.name, value: dpsk.id }
      }))
    }
  }, [dpskList])

  useEffect(() => {
    if (dpskServiceProfileId && !selectedDpsk && dpskList) {
      setSelectedDpsk(findService(dpskServiceProfileId))
    }
  }, [dpskServiceProfileId, selectedDpsk, dpskList])

  const onServiceChange = (value: string) => {
    setSelectedDpsk(findService(value))
  }

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'DPSK Service' })}
        name='dpskServiceProfileId'
        rules={[{ required: true }]}
        initialValue={''}
      >
        <Select
          onChange={onServiceChange}
          options={[
            { label: $t({ defaultMessage: 'Select service...' }), value: '' },
            ...dpskOptions
          ]}
        >
        </Select>
      </Form.Item>
      <Button type='link' style={{ marginBottom: '16px' }}>
        { $t({ defaultMessage: 'Add DPSK Service' }) }
      </Button>
      { selectedDpsk &&
        <>
          <Form.Item label={$t({ defaultMessage: 'Passphrase Format' })}>
            <Typography.Paragraph>
              {transformDpskNetwork(intl, DpskNetworkType.FORMAT, selectedDpsk.passphraseFormat)}
            </Typography.Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Passphrase Length' })}>
            <Typography.Paragraph>
              {transformDpskNetwork(intl, DpskNetworkType.LENGTH, selectedDpsk.passphraseLength)}
            </Typography.Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Passphrase Expiration' })}>
            <Typography.Paragraph>
              {
                transformAdvancedDpskExpirationText(intl, {
                  expirationType: selectedDpsk.expirationType,
                  expirationDate: selectedDpsk.expirationDate,
                  expirationOffset: selectedDpsk.expirationOffset
                })
              }
            </Typography.Paragraph>
          </Form.Item>
        </>
      }
    </>
  )
}
