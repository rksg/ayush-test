import { useEffect, useState, useContext, useRef } from 'react'


import {
  Form,
  Select,
  Button,
  Space
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components/macro'


import { GridCol, GridRow, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { useGetDirectoryServerViewDataListQuery }     from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum
}                                                   from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import DirectoryServerDrawer       from '../../policies/DirectoryServer/DirectoryServerForm/DirectoryServerDrawer'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'


const defaultPayload = {
  fields: [
    'id',
    'name',
    'host',
    'port',
    'type',
    'domainName',
    'wifiNetworkIds'

  ],
  pageSize: 10,
  sortField: 'name',
  sortOrder: 'ASC'
}

/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
export function DirectoryServerForm ({ setDirectoryServerIdToNetworkForm } : { setDirectoryServerIdToNetworkForm: Function }) {

  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const addedDirectoryServerUnderEditMode = useRef<string>('')
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ selectedDirectory, setSelectedDirectory] = useState('')
  const [ directoryServerOptionsList, setDirectoryServerOptionsList] = useState<DefaultOptionType[]>([])
  // eslint-disable-next-line max-len
  const { data: directoryServerListFromServer } = useGetDirectoryServerViewDataListQuery({ payload: defaultPayload })

  const setDirectoryServerValue = (serverId?: string) => {
    if (serverId) {
      setSelectedDirectory(serverId)
      setDirectoryServerIdToNetworkForm(serverId)
    }
  }

  useEffect(() => {
    const directoryServerList = directoryServerListFromServer?.data ?? []

    if (directoryServerList) {
      setDirectoryServerOptionsList([
        { label: $t({ defaultMessage: 'Select...' }), value: '' },
        ...(directoryServerList && directoryServerList.map((server) => {
          return { label: `${server.name} (${server.type})` , value: server.id }
        }) )
      ])
    }

    if((editMode || cloneMode) && data){
      const wifiNetworkId = data?.id ?? ''
      if (addedDirectoryServerUnderEditMode.current){
        setDirectoryServerValue(addedDirectoryServerUnderEditMode.current)
      } else {
        setDirectoryServerValue(directoryServerList.find((server) => server.wifiNetworkIds.includes(wifiNetworkId))?.id)
      }
    }

  }, [directoryServerListFromServer, data])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addDirectoryServerCallback = (option: DefaultOptionType, gatewayIps: string[]) : void => {
    setDirectoryServerOptionsList([...directoryServerOptionsList, option])
    setDirectoryServerValue(option.value as string)
    addedDirectoryServerUnderEditMode.current = option.value as string
  }

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <ModifiedSpace>
          <Form.Item
            required
            rules={[
              { required: true, message: $t(validationMessages.DirectoryServerNotSelected) }
            ]}
            label={$t({ defaultMessage: 'Select Directory Server' })}
            children={
              <Select
                data-testid={'directory-server-select'}
                value={selectedDirectory}
                onChange={(value) => {
                  setDirectoryServerValue(value)
                }}
                options={directoryServerOptionsList}
              />

            }
          />
          <Tooltip>
            <Button type='link'
              onClick={() => setVisible(true)}>
              {$t({ defaultMessage: 'Add Server' })}
            </Button>
          </Tooltip>
        </ModifiedSpace>
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
      // We just need to add but not edit server in this form, so keep it false.
      // Otherwise it won't send any request.
      editMode={false}
      callbackFn={addDirectoryServerCallback}
    />
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>)

}
/* eslint-enable no-unused-vars */

const ModifiedSpace = styled(Space)`
  .ant-space-item:first-child {
    width: 100%;
  }
`