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

import { Button, Modal, ModalType, StepsFormLegacy }                from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }   from '@acx-ui/feature-toggle'
import { useGetDpskListQuery, useGetEnhancedDpskTemplateListQuery } from '@acx-ui/rc/services'
import {
  WlanSecurityEnum,
  DpskSaveData,
  transformDpskNetwork,
  DpskNetworkType,
  transformAdvancedDpskExpirationText,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  ServiceType,
  ServiceOperation,
  useConfigTemplate,
  useTemplateAwareServicePermission
} from '@acx-ui/rc/utils'

import { DpskForm }       from '../../services/DpskForm/DpskForm'
import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './../NetworkMoreSettings/NetworkMoreSettingsForm'
import { CloudpathServerForm }     from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function DpskSettingsForm (props: { defaultSelectedDpsk?: string }) {
  const { defaultSelectedDpsk } = props
  const { editMode, cloneMode, data, isRuckusAiMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const form = Form.useFormInstance()
  const dpskWlanSecurity = useWatch('dpskWlanSecurity', form)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate

  useEffect(()=>{
    // TODO: Remove deprecated codes below when RadSec feature is delivery
    if(!supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
    if(!editMode) {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [data])

  useEffect(()=>{
    if(supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
  }, [data?.id])

  // only create mode
  useEffect(()=>{
    if(!editMode && !cloneMode && defaultSelectedDpsk) {
      form.setFieldValue('dpskServiceProfileId', defaultSelectedDpsk)
    }
  }, [editMode, cloneMode, defaultSelectedDpsk])

  const setFieldsValue = () => {
    data && form.setFieldsValue({
      isCloudpathEnabled: data.authRadius?true:false,
      dpskServiceProfileId: data?.dpskServiceProfileId,
      dpskWlanSecurity: data?.wlan?.wlanSecurity,
      enableAccountingService: data.enableAccountingService,
      authRadius: data.authRadius,
      enableAuthProxy: data.enableAuthProxy,
      enableAccountingProxy: data.enableAccountingProxy,
      accountingRadius: data.accountingRadius,
      accountingRadiusId: data.accountingRadiusId||data.accountingRadius?.id,
      authRadiusId: data.authRadiusId||data.authRadius?.id
    })
  }

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm/>
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram
          wlanSecurity={dpskWlanSecurity}/>
      </Col>
    </Row>
    {!(editMode) && !(isRuckusAiMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm
          wlanData={data} />
      </Col>
    </Row>}
  </>)

}

function SettingsForm () {
  const form = Form.useFormInstance()
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const isCloudpathEnabled = useWatch('isCloudpathEnabled')
  const dpskWlanSecurity = useWatch('dpskWlanSecurity')
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const isSupportDpsk3NonProxyMode = useIsSplitOn(Features.WIFI_DPSK3_NON_PROXY_MODE_TOGGLE)

  const onCloudPathChange = (e: RadioChangeEvent) => {
    form.setFieldValue(e.target.value ? 'dpskServiceProfileId' : 'cloudpathServerId', '')

    setData && setData({ ...data, isCloudpathEnabled: e.target.value })
  }

  const handleDpsk3NonProxyMode = (
    dpskWlanSecurity: WlanSecurityEnum,
    isCloudpathEnabled: boolean
  ) => {
    if(dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed && isCloudpathEnabled) {
      setData && setData({ ...data, enableAccountingProxy: false, enableAuthProxy: false })
      form.setFieldsValue({
        enableAccountingProxy: false,
        enableAuthProxy: false
      })
    }
  }
  useEffect(()=>{
    !supportRadsec && form.setFieldsValue({ ...data })
  },[data])

  useEffect(()=>{
    supportRadsec && form.setFieldsValue({ ...data })
  },[data?.id])

  useEffect(() => {
    if (!isSupportDpsk3NonProxyMode && dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed)
      form.setFieldValue('isCloudpathEnabled', false)

    handleDpsk3NonProxyMode(dpskWlanSecurity, isCloudpathEnabled)

  }, [dpskWlanSecurity, isCloudpathEnabled])

  useEffect(() => {
    form.setFieldValue('wlanSecurity', dpskWlanSecurity)
    form.setFieldValue(['wlan', 'wlanSecurity'], dpskWlanSecurity)
  }, [dpskWlanSecurity])

  const isWpaDsae3Toggle = useIsSplitOn(Features.WIFI_EDA_WPA3_DSAE_TOGGLE)
  const isBetaDPSK3FeatureEnabled = useIsTierAllowed(TierFeatures.BETA_DPSK3)

  // eslint-disable-next-line max-len
  const securityDescription = <> { $t({ defaultMessage: 'WPA2/WPA3 mixed mode supports the high-end WPA3 which is the highest level of Wi-Fi security available and WPA2 which is still common and provides good security. The WPA2/WPA3 mixed mode only will apply to the ‘supported’ AP models. This Network will not be applied to the Non-Supported AP models.' }) } </>

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsFormLegacy.Title>{ $t({ defaultMessage: 'DPSK Settings' }) }</StepsFormLegacy.Title>
        <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name='dpskWlanSecurity'
          initialValue={WlanSecurityEnum.WPA2Personal}
          extra={dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed ? securityDescription : null}
        >
          <Select>
            <Option value={WlanSecurityEnum.WPA2Personal}>
              { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
            </Option>
            <Option value={WlanSecurityEnum.WPAPersonal}>
              { $t({ defaultMessage: 'WPA' }) }</Option>
            {
              isBetaDPSK3FeatureEnabled
              && isWpaDsae3Toggle && <Option value={WlanSecurityEnum.WPA23Mixed}>
                { $t({ defaultMessage: 'WPA2/WPA3 mixed mode' }) }</Option>
            }
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
              <Radio
                value={true}
                disabled={
                  (!isSupportDpsk3NonProxyMode &&
                    dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed) || editMode
                }>
                {(dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed)?
                  $t({ defaultMessage: 'Use RADIUS Server(Cloudpath Server Only)' }) :
                  $t({ defaultMessage: 'Use RADIUS Server' })
                }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </div>
      <div>
        {isCloudpathEnabled ?
          <CloudpathServerForm
            dpskWlanSecurity={dpskWlanSecurity}
          /> :
          <DpskServiceSelector />}
      </div>
    </Space>
  )
}

function DpskServiceSelector () {
  const intl = useIntl()
  const form = Form.useFormInstance()
  const $t = intl.$t
  const [ dpskOptions, setDpskOptions ] = useState<DefaultOptionType[]>([])
  const [ selectedDpsk, setSelectedDpsk ] = useState<DpskSaveData>()
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const { data: dpskList } = useConfigTemplateQueryFnSwitcher<TableResult<DpskSaveData>>({
    useQueryFn: useGetDpskListQuery,
    useTemplateQueryFn: useGetEnhancedDpskTemplateListQuery
  })

  const dpskServiceProfileId = useWatch('dpskServiceProfileId')
  // eslint-disable-next-line max-len
  const hasAddDpskPermission = useTemplateAwareServicePermission(ServiceType.DPSK, ServiceOperation.CREATE)

  const findService = (serviceId: string) => {
    return dpskList?.data.find((dpsk: DpskSaveData) => dpsk.id === serviceId)
  }

  const onDpskModalClose = () => {
    setDpskModalVisible(false)
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
      { hasAddDpskPermission && <Button
        type='link'
        style={{ marginBottom: '16px' }}
        onClick={() => setDpskModalVisible(true)}
      >
        { $t({ defaultMessage: 'Add DPSK Service' }) }
      </Button> }
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
      <Modal
        title={$t({ defaultMessage: 'Add DPSK service' })}
        visible={dpskModalVisible}
        type={ModalType.ModalStepsForm}
        children={<DpskForm
          modalMode={true}
          modalCallBack={(result) => {
            if (result) {
              form.setFieldValue('dpskServiceProfileId', result.id)
            }
            onDpskModalClose()
          }}
        />}
        onCancel={onDpskModalClose}
        width={1200}
        destroyOnClose={true}
      />
    </>
  )
}
