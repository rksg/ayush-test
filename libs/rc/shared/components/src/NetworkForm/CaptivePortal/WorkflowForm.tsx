import React, { useContext, useEffect } from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import {
  GridCol,
  GridRow,
  Select,
  StepsFormLegacy,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetWorkflowProfilesQuery,
  useGetWorkflowProfileBoundNetworkQuery
} from '@acx-ui/rc/services'
import {
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  WifiNetworkMessages,
  useConfigTemplate,
  Radius
} from '@acx-ui/rc/utils'

import { AAAInstance }             from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

import {
  BypassCaptiveNetworkAssistantCheckbox
} from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems } from './SharedComponent/WlanSecurity/WlanSecuritySettings'

const { useWatch } = Form

export function WorkflowForm () {
  const labelWidth = '250px'
  const { data, setData, editMode, isRuckusAiMode, cloneMode } =
    useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const [
    workflowId,
    enableAccountingService,
    accountingRadius
  ] = [
    useWatch<string>(['guestPortal', 'workflowId']),
    useWatch<boolean>(['enableAccountingService']),
    useWatch<Radius>('accountingRadius')
  ]

  const onChange = (value: boolean, fieldName: string) => {
    form.setFieldValue(fieldName, value)
    if (supportRadsec) {
      setData && setData({
        ...data,
        [fieldName]: value,
        accountingRadius: accountingRadius,
        accountingRadiusId: accountingRadius?.id
      })
    } else {
      setData && setData({
        ...data,
        [fieldName]: value
      })
    }
  }

  const { workflowProfileOptions } = useGetWorkflowProfilesQuery({
    payload: {
      page: '0',
      pageSize: '2000',
      defaultPageSize: 2000,
      total: 0,
      sortField: 'name',
      sortOrder: 'ASC',
      sort: 'name,asc',
      filters: {
        publishedChildren: true
      }
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        workflowProfileOptions: data?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? []
      }
    }
  })

  const { data: boundProfile } = useGetWorkflowProfileBoundNetworkQuery({
    payload: {
      page: '0',
      pageSize: '10',
      defaultPageSize: 10,
      total: 0,
      filters: {
        assignmentResourceType: 'NETWORK',
        assignmentResourceId: data?.id ?? ''
      }
    }
  })

  const { $t } = useIntl()

  useEffect(() => {
    if((editMode || cloneMode) && data ) {
      form.setFieldsValue({ ...data })
      // Initialize Workflow dropdown under edit/clone mode
      if (boundProfile) {
        if(boundProfile.length < 1 || boundProfile[0].links.length < 1) {
          return
        }
        const link = boundProfile[0].links[0]
        // Parsing id from URL
        // URL pattern: https://api.int.ruckus.cloud/workflows/03508fd8-de89-4133-a8df-3bb9eb73d3fe
        const profileId = link.href.match(/([a-z0-9\-]{36})$/i)
        if (profileId && profileId.length > 0) {
          form.setFieldValue(['guestPortal', 'workflowId'], profileId[0])
        }
      }
    }
  }, [boundProfile])

  useEffect(()=>{
    if(accountingRadius){
      if (supportRadsec && accountingRadius.radSecOptions?.tlsEnabled) {
        onChange(true, 'enableAccountingProxy')
      }
    }
  },[supportRadsec, accountingRadius])

  useEffect(() => {
    if (workflowId) {
      form.setFieldValue(['guestPortal', 'workflowName'],
        workflowProfileOptions.find(option => option.value === workflowId)?.label
      )
    }
  }, [workflowId])

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsFormLegacy.Title
            children={$t({ defaultMessage: 'Settings' })}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Workflow' })}
            name={['guestPortal', 'workflowId']}
            rules={[{ required: true }]}
            children={
              <Select
                data-testid={'workflow-profile-select'}
                options={workflowProfileOptions}
              />
            }
          />
          <Form.Item name={['guestPortal', 'workflowName']} hidden/>
          <WlanSecurityFormItems />
          <BypassCaptiveNetworkAssistantCheckbox />
          <WalledGardenTextArea enableDefaultWalledGarden={false} />
          <div>
            <UI.FieldLabel width={labelWidth}>
              <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
              <Form.Item
                name='enableAccountingService'
                valuePropName='checked'
                style={{ marginTop: '-5px', marginBottom: '0' }}
                initialValue={false}
                children={<Switch
                  onChange={(value) => onChange(value,'enableAccountingService')}
                />}
              />
            </UI.FieldLabel>
            {enableAccountingService && <>
              <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
                type='accountingRadius'
                networkType={data?.type}
              />
              <UI.FieldLabel width={labelWidth}>
                <Space align='start'>
                  { $t({ defaultMessage: 'Proxy Service' }) }
                  <Tooltip.Question
                    placement='bottom'
                    title={$t(WifiNetworkMessages.ENABLE_PROXY_IN_CAPTIVE_PORTAL_TOOLTIP)}
                    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                  />
                </Space>
                <Form.Item
                  name='enableAccountingProxy'
                  valuePropName='checked'
                  initialValue={false}
                  children={<Switch
                    data-testid='enable-accounting-proxy'
                    onChange={(value)=>onChange(value,'enableAccountingProxy')}
                    disabled={supportRadsec && accountingRadius?.radSecOptions?.tlsEnabled}
                  />}
                />
              </UI.FieldLabel>
            </>}
          </div>
        </GridCol>
        <GridCol col={{ span: 14 }}>
          <NetworkDiagram
            type={NetworkTypeEnum.CAPTIVEPORTAL}
            networkPortalType={GuestNetworkTypeEnum.Workflow}
            wlanSecurity={data?.wlan?.wlanSecurity}
            forceHideAAAButton={true}
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
