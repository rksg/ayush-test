import React, { useEffect, useState, useContext } from 'react'

import {
  Divider,
  Form,
  Select,
  Button
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useGetDirectoryServerViewDataListQuery
}                           from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import DirectoryServerDrawer       from '../../policies/DirectoryServer/DirectoryServerForm/DirectoryServerDrawer'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import { IdentityGroup }           from '../NetworkSettings/SharedComponent/IdentityGroup/IdentityGroup'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'
import * as UI                                   from './styledComponents'
const defaultPayload = {
  fields: [
    'id',
    'name',
    'type',
    'wifiNetworkIds'
  ],
  pageSize: 64,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function DirectoryServerForm ({ directoryServerDataRef } :
  { directoryServerDataRef: React.MutableRefObject<{ id:string, name:string }> }) {

  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ directoryServerData, setDirectoryServerData] =
    useState<{ id:string, name:string }>({ id: '', name: '' })
  const [ directoryServerList, setDirectoryServerList] = useState<DefaultOptionType[]>([])
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)

  const { data: directoryServerListFromServer } =
    useGetDirectoryServerViewDataListQuery({ payload: defaultPayload })

  const setDirectoryServerValue = (id: string, name:string) => {
    const selectedData = { id, name }
    directoryServerDataRef.current = selectedData
    setDirectoryServerData(selectedData)
  }

  const onChange = (value: string) => {
    const serverList = directoryServerListFromServer?.data ?? []
    const currentValue = serverList.find(
      (server) => server.id === value
    )
    if (currentValue) {
      setDirectoryServerValue(currentValue.id, `${currentValue.name} (${currentValue.type})`)
      setVisible(false)
    }
  }

  const addDirectoryServerCallback = (option: DefaultOptionType) => {
    directoryServerDataRef.current = { id: option.value as string, name: option.label as string }
    setDirectoryServerList((preState) => {
      return [option, ...preState]
    })
    setDirectoryServerValue(option.value as string, option.label as string)
    form.setFieldsValue({ directoryServerId: option.value })
  }

  useEffect(() => {
    const serverList = directoryServerListFromServer?.data ?? []

    if (serverList.length > 0) {
      setDirectoryServerList(
        serverList.map((server) => {
          return { label: `${server.name} (${server.type})` , value: server.id }
        })
      )
      if (directoryServerDataRef?.current.id) {
        const currentServerData = serverList.find(
          (server) => server.id === directoryServerDataRef.current.id
        )
        currentServerData &&
        setDirectoryServerValue(
          currentServerData.id,
          `${currentServerData.name} (${currentServerData.type})`
        )
      } else if((editMode || cloneMode) && data?.id) {
        const currentServerData = serverList.find(
          (server) => server.wifiNetworkIds.includes(data.id!)
        )
        if (currentServerData) {
          setDirectoryServerValue(
            currentServerData.id,
            `${currentServerData.name} (${currentServerData.type})`)
          form.setFieldValue('directoryServerId', currentServerData.id!)
        }
      }
    }
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
    }

  }, [directoryServerListFromServer, data])

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <UI.FieldSpace>
          <Form.Item
            name={'directoryServerId'}
            rules={[
              { required: true, message: $t(validationMessages.DirectoryServerNotSelected) }
            ]}
            label={$t({ defaultMessage: 'Select Directory Server' })}
            initialValue=''
            children={
              <Select
                data-testid={'directory-server-select'}
                value={directoryServerData.id}
                onChange={onChange}
                options={[
                  {
                    label: $t({ defaultMessage: 'Select...' }), value: ''
                  },
                  ...directoryServerList
                ]}
                placeholder={$t({ defaultMessage: 'Select...' })}
              />

            }
          />
          <UI.TypeSpace split={<Divider type='vertical' />}>
            <Button type='link'
              disabled={!directoryServerData.id}
              onClick={() => {
                setDetailDrawerVisible(true)
                visible && setVisible(false)
              }}>
              {$t({ defaultMessage: 'Profile Detail' })}
            </Button>
            <Button type='link'
              onClick={() => {
                setVisible(true)
                detailDrawerVisible && setDetailDrawerVisible(false)
              }}>
              {$t({ defaultMessage: 'Add Server' })}
            </Button>
          </UI.TypeSpace>
        </UI.FieldSpace>
        {isWifiIdentityManagementEnable && !isTemplate && <IdentityGroup comboWidth='220px' />}
        <WlanSecurityFormItems />
        <RedirectUrlInput />
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.Directory}
          wlanSecurity={data?.wlan?.wlanSecurity}
        />
      </GridCol>
    </GridRow>
    <DirectoryServerDrawer
      visible={visible}
      setVisible={setVisible}
      callbackFn={addDirectoryServerCallback}
    />
    <DirectoryServerDrawer
      visible={detailDrawerVisible}
      readMode
      setVisible={setDetailDrawerVisible}
      policyId={directoryServerData.id}
      policyName={directoryServerData.name.replace(/ \([^)]*\)/, '')}
    />
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>)

}
