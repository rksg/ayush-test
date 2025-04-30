import React, { useContext } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Select, StepsFormLegacy }                                 from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, useConfigTemplate } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import {
  BypassCaptiveNetworkAssistantCheckbox
} from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems } from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export function WorkflowForm () {

  const { data, editMode, isRuckusAiMode, cloneMode } =
    useContext(NetworkFormContext)
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  // SANTODO: implement editing logic

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsFormLegacy.Title
            children={$t({ defaultMessage: 'Settings' })}
          />
          {/*SANTODO: Check with backend*/}
          <Form.Item
            label={$t({ defaultMessage: 'Workflow' })}
            name={''}
            rules={[{ required: true }]}
            children={
              <Select
                data-testid={'workflow-profile-select'}
                options={[
                  { label: 'Workflow-1', value: 1 },
                  { label: 'Workflow-2', value: 2 }
                ]}
              />
            }
          />
          <WlanSecurityFormItems />
          <BypassCaptiveNetworkAssistantCheckbox />
          <WalledGardenTextArea
            enableDefaultWalledGarden={false}
          />
        </GridCol>
        {/*SANTODO: Change the image once George provide it to you.*/}
        <GridCol col={{ span: 14 }}>
          <NetworkDiagram
            type={NetworkTypeEnum.CAPTIVEPORTAL}
            networkPortalType={GuestNetworkTypeEnum.SAML}
            wlanSecurity={data?.wlan?.wlanSecurity}
          />
        </GridCol>
      </GridRow>
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
