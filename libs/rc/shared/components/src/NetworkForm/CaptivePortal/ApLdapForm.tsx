import { useContext } from 'react'

import {
  Form,
  Select
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridCol, GridRow, StepsFormLegacy, PasswordInput } from '@acx-ui/components'
import {
  NetworkSaveData,
  trailingNorLeadingSpaces,
  passphraseRegExp
}                                                   from '@acx-ui/rc/utils'

import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'

/* eslint-disable no-unused-vars */
export function APLDAPForm () {

  const {
    data,
    editMode,
    cloneMode,
    setData
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const params = useParams()
  const { useWatch } = Form
  const form = Form.useFormInstance()


  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <Form.Item
          rules={[
            { required: true }
          ]}
          label={$t({ defaultMessage: 'Select Directory Server' })}
          initialValue=''
          children={<Select>
            <Select.Option value={''}>
              {$t({ defaultMessage: 'Select...' })}
            </Select.Option>
          </Select>}
        ></Form.Item>
        <Form.Item
          initialValue={'NONE'}
          label={$t({ defaultMessage: 'Secure your network' })}
          children={
            <Select
              placeholder={$t({ defaultMessage: 'None' })}

            >
            </Select>
          }
        ></Form.Item>
        <Form.Item
          name={['wlan', 'passphrase']}
          label={'Passphrase'}
          rules={[
            { required: true, min: 8 },
            { max: 64 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) },
            { validator: (_, value) => passphraseRegExp(value) }
          ]}
          validateFirst
          extra={$t({ defaultMessage: '8 characters minimum' })}
          children={<PasswordInput />}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name='pskProtocol'
        //   initialValue={WlanSecurityEnum.WPA2Personal}
        //   extra={securityDescription()}
        >
          <Select>
          </Select>
        </Form.Item>
        <RedirectUrlInput />
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea enableDefaultWalledGarden={false} />
      </GridCol>
    </GridRow>
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>)

}
/* eslint-enable no-unused-vars */