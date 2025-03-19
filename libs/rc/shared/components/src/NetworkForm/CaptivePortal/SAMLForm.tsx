import React, { useContext, useEffect } from 'react'

import { Button, Form, Input, Space } from 'antd'
import { DefaultOptionType }          from 'antd/lib/select'
import { useIntl }                    from 'react-intl'

import { GridCol, GridRow, Select, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { useGetSamlIdpProfileViewDataListQuery }     from '@acx-ui/rc/services'
import {
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import { IdentityGroup }           from '../NetworkSettings/SharedComponent/IdentityGroup/IdentityGroup'

import { DhcpCheckbox }                   from './DhcpCheckbox'
import { RedirectUrlInput }               from './RedirectUrlInput'
import {
  BypassCaptiveNetworkAssistantCheckbox
} from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems } from './SharedComponent/WlanSecurity/WlanSecuritySettings'


export const SAMLForm = () => {

  const {
    data,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const idpViewDataList = useGetSamlIdpProfileViewDataListQuery({
    payload: {
      page: 1, pageSize: 10000, sortOrder: 'ASC'
    }
  })

  const { $t } = useIntl()
  const form = Form.useFormInstance()

  useEffect(() => {
    const setData = async () => {
      if ((editMode || cloneMode) && data) {
        const idp = idpViewDataList.data?.data.find((idp) => {
          return idp.wifiNetworkIds.includes(data.id ?? '')
        })
        if (idp) {
          form.setFieldValue('samlIdpProfilesId', idp.id)
          form.setFieldValue('samlIdpProfilesName', idp.name)
        }
      }
    }
    setData()
  }, [])

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title children={$t({ defaultMessage: 'Onboarding' })} />
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'Select Identity Provider (IdP) via SAML' })}
            name={['samlIdpProfilesId']}
            rules={
              [{ required: true }]
            }
            children={
              <Select
                data-testid={'saml-idp-profile-select'}
                style={{ width: '400px' }}
                placeholder={'Select...'}
                onChange={(value, option) => {
                  form.setFieldValue('samlIdpProfilesName', (option as DefaultOptionType).label)
                }}
                options={idpViewDataList.data?.data?.map(item => ({
                  label: item.name, value: item.id
                }))}
              />
            }
          />
          <Space split='|'>
            <Button
              type='link'
              disabled={false}
              onClick={() => {}}>
              {$t({ defaultMessage: 'View Details' })}
            </Button>
            <Button
              type='link'
              onClick={() => {}}
            >
              {$t({ defaultMessage: 'Add' })}
            </Button>
          </Space>
        </Space>
        <Form.Item
          noStyle
          name={'samlIdpProfilesName'}
          hidden
          children={<Input hidden />}
        />
        {
          (isWifiIdentityManagementEnable && !isTemplate) &&
            <IdentityGroup />
        }
        <WlanSecurityFormItems />
        <RedirectUrlInput></RedirectUrlInput>
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.GuestPass}
          wlanSecurity={data?.wlan?.wlanSecurity} />
      </GridCol>
    </GridRow>
    {!(editMode) && !(isRuckusAiMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>)
}
