import { useContext, useEffect } from 'react'

import {
  Form,
  Radio,
  RadioChangeEvent,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy }     from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { useConfigTemplate }                     from '@acx-ui/rc/utils'

import { GuestNetworkTypeDescription, GuestNetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                                     from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                                     from '../NetworkFormContext'
import { RadioDescription }                                   from '../styledComponents'

export function PortalTypeForm () {
  const portalType = Form.useWatch(['guestPortal', 'guestNetworkType'])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <TypesForm />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={portalType}/>
      </GridCol>
    </GridRow>
  )
}


function TypesForm () {
  const {
    data,
    setData,
    editMode,
    isRuckusAiMode,
    cloneMode,
    modalMode,
    createType
  } = useContext(NetworkFormContext)
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isDirectoryServerEnabledFF = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_DIRECTORY_SERVER_TOGGLE)
  const isSAMLSSOEnable = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)
  const isDirectoryServerEnabled = !isRuckusAiMode && isDirectoryServerEnabledFF
  const onChange = (e: RadioChangeEvent) => {
    setData && setData({ ...data, guestPortal:
       { ...data?.guestPortal, guestNetworkType: e.target.value as GuestNetworkTypeEnum } })
  }
  const intl = useIntl()
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
    }
  }, [data])
  useEffect(()=>{
    if(createType){
      form.setFieldValue(['guestPortal', 'guestNetworkType'], GuestNetworkTypeEnum.GuestPass)
    }
  },[createType])

  return (
    <>
      <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Portal Type' })}</StepsFormLegacy.Title>
      <Form.Item
        name={['guestPortal', 'guestNetworkType']}
        initialValue={GuestNetworkTypeEnum.ClickThrough}
        label={intl.$t({ defaultMessage:
          'Select the way users gain access to the network through the captive portal' })}
        rules={[{ required: true }]}
      >
        <Radio.Group onChange={onChange}
          // eslint-disable-next-line max-len
          disabled={(editMode || cloneMode || (isRuckusAiMode ? false : (modalMode && !!createType)))}>
          <Space direction='vertical'>
            <Radio value={GuestNetworkTypeEnum.ClickThrough}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.ClickThrough]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.ClickThrough]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.SelfSignIn}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.SelfSignIn]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.SelfSignIn]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.Cloudpath}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.Cloudpath]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.Cloudpath]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.HostApproval}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.HostApproval]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.HostApproval]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.GuestPass}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.GuestPass]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.GuestPass]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.WISPr}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.WISPr]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.WISPr]}
              </RadioDescription>
            </Radio>
            {
              isDirectoryServerEnabled && !isTemplate &&
              <Radio value={GuestNetworkTypeEnum.Directory}>
                {GuestNetworkTypeLabel[GuestNetworkTypeEnum.Directory]}
                <RadioDescription>
                  {GuestNetworkTypeDescription[GuestNetworkTypeEnum.Directory]}
                </RadioDescription>
              </Radio>
            }
            {
              (isSAMLSSOEnable || true) && !isTemplate &&
              <Radio value={GuestNetworkTypeEnum.SAML}>
                {GuestNetworkTypeLabel[GuestNetworkTypeEnum.SAML]}
                <RadioDescription>
                  {GuestNetworkTypeDescription[GuestNetworkTypeEnum.SAML]}
                </RadioDescription>
              </Radio>
            }
          </Space>
        </Radio.Group>
      </Form.Item>
    </>
  )
}
