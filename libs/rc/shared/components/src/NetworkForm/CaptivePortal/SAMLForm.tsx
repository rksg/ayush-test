import React, { useContext, useEffect, useState } from 'react'

import { Button, Form, Input, Space } from 'antd'
import { useIntl }                    from 'react-intl'

import { Drawer, GridCol, GridRow, Select, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useGetSamlIdpProfileViewDataListQuery }             from '@acx-ui/rc/services'
import {
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  useConfigTemplate,
  SamlIdpProfileViewData
} from '@acx-ui/rc/utils'

import { AddSamlIdp }              from '../../policies/SamlIdp/AddSamlIdp'
import { SAMLDetailDrawer }        from '../../policies/SamlIdp/SamlDetailDrawer'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import { IdentityGroup }           from '../NetworkSettings/SharedComponent/IdentityGroup/IdentityGroup'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export const SAMLForm = () => {
  const { data, editMode, isRuckusAiMode, cloneMode } =
    useContext(NetworkFormContext)
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const isSamlSsoEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [createdSamlIdpId, setCreatedSamlIdpId] = useState<string | undefined>(undefined)

  const { samlIdpOptions , idpViewDataList } = useGetSamlIdpProfileViewDataListQuery({
    payload: {
      page: 1, pageSize: 10000, sortOrder: 'ASC', sortField: 'name'
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        samlIdpOptions: data?.data?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? [],
        idpViewDataList: data?.data
      }
    }
  })

  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const selectedSamlIdpProfilesId = Form.useWatch('samlIdpProfilesId', form)

  useEffect(() => {
    const setFormFields = (idp: SamlIdpProfileViewData | undefined) => {
      if (idp) {
        form.setFieldValue('samlIdpProfilesId', idp.id)
        form.setFieldValue('samlIdpProfilesName', idp.name)
      }
    }

    if (!idpViewDataList || idpViewDataList.length === 0) {
      return
    }

    if ((editMode || cloneMode) && data) {
      const idp = idpViewDataList.find((idp: SamlIdpProfileViewData) =>
        idp.wifiNetworkIds.includes(data.id ?? '')
      )
      setFormFields(idp)
    }

    if (createdSamlIdpId) {
      const idp = idpViewDataList.find((idp: SamlIdpProfileViewData) =>
        idp.id === createdSamlIdpId
      )
      setFormFields(idp)
      setCreatedSamlIdpId(undefined)
    }
  }, [idpViewDataList])

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsFormLegacy.Title
            children={$t({ defaultMessage: 'Onboarding' })}
          />
          <Space>
            <Form.Item
              label={$t({
                defaultMessage: 'Select Identity Provider (IdP) via SAML'
              })}
              name={'samlIdpProfilesId'}
              rules={[{ required: true }]}
              children={
                <Select
                  data-testid={'saml-idp-profile-select'}
                  style={{ width: '220px' }}
                  options={samlIdpOptions}
                />
              }
            />
            <Space split='|'>
              <Button
                type='link'
                disabled={!selectedSamlIdpProfilesId}
                onClick={() => {
                  setDetailDrawerVisible(true)
                }}
              >
                {$t({ defaultMessage: 'View Details' })}
              </Button>
              <Button
                type='link'
                data-testid={'saml-idp-profile-add-button'}
                onClick={() => {
                  setAddDrawerVisible(true)
                }}>
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
          {isWifiIdentityManagementEnable && !isTemplate && <IdentityGroup comboWidth='220px' />}
          <WlanSecurityFormItems />
          <RedirectUrlInput />
          <DhcpCheckbox />
          <BypassCaptiveNetworkAssistantCheckbox />
          <WalledGardenTextArea
            enableDefaultWalledGarden={false}
            required={isSamlSsoEnabled}
          />
        </GridCol>
        <GridCol col={{ span: 14 }}>
          <NetworkDiagram
            type={NetworkTypeEnum.CAPTIVEPORTAL}
            networkPortalType={GuestNetworkTypeEnum.SAML}
            wlanSecurity={data?.wlan?.wlanSecurity}
          />
        </GridCol>
      </GridRow>
      <Drawer
        title={$t({ defaultMessage: 'Add SAML Identity Provider' })}
        visible={addDrawerVisible}
        onClose={() => setAddDrawerVisible(false)}
        destroyOnClose={true}
        width={450}
        children={
          <AddSamlIdp
            isEmbedded={true}
            onClose={() => setAddDrawerVisible(false)}
            updateInstance={(createId: string) => {
              if(createId) {
                setCreatedSamlIdpId(createId)
                setAddDrawerVisible(false)
              }
            }}
          />
        }
        footer={
          // Workaround for add a footer to avoid drawer be hide when click outside
          <Button
            type='primary'
            style={{ display: 'none' }}
          >
            {$t({ defaultMessage: 'OK' })}
          </Button>
        }
      />
      <SAMLDetailDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        samlIdpProfileId={selectedSamlIdpProfilesId}
      />
      {!editMode && !isRuckusAiMode && (
        <GridRow>
          <GridCol col={{ span: 24 }}>
            <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
          </GridCol>
        </GridRow>
      )}
    </>
  )
}
