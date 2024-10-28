import React, { useEffect, useState } from 'react'

import { ProFormCheckbox, ProFormText } from '@ant-design/pro-form'
import { Button, Divider }              from 'antd'
import { useIntl }                      from 'react-intl'

import { cssStr } from '@acx-ui/components'

import { ReactComponent as Logo } from '../../assets/gptDog.svg'

import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'VLAN ID': string;
  'VLAN Name': string;
  'Checked': boolean;
  'id': string;
}

export function VlanStep (props: { payload: string }) {
  const { $t } = useIntl()
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>(initialData)
  const [configuredFlags, setConfiguredFlags] = useState<boolean[]>(Array(data.length).fill(false))

  useEffect(() => {
    if (initialData !== data) {
      setData(initialData)
      setConfiguredFlags(Array(data.length).fill(false))
    }

  }, [props.payload])


  const handleAddVlan = () => {
    const newVlan: NetworkConfig = {
      'Purpose': '',
      'VLAN ID': '',
      'VLAN Name': '',
      'Checked': true,
      'id': ''
    }
    setData([...data, newVlan])
  }

  return (
    <UI.Container>
      <UI.Header>
        <UI.HeaderWithAddButton>
          <UI.Title>{$t({ defaultMessage: 'Recommended VLANs' })}</UI.Title>
          <Button type='link'
            size='small'
            disabled={data.length >= 5}
            onClick={handleAddVlan}>
            {$t({ defaultMessage: 'Add VLAN' })}
          </Button>
        </UI.HeaderWithAddButton>
        <UI.Description>
          { // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Now, let us set up the VLANs for your school network. Setting up VLANs effectively will help in managing and segmenting your network traffic efficiently in your educational environment. Here’s how you can structure your VLANs for different use cases.'
            })}
        </UI.Description>
      </UI.Header>

      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          <UI.VlanContainer>
            <UI.CheckboxContainer>
              <ProFormCheckbox
                name={['data', index, 'Checked']}
                initialValue={true}
              />
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <UI.VlanDetails>
              <ProFormText
                name={['data', index, 'id']}
                initialValue={item['id']}
                hidden
              />
              <ProFormText
                name={['data', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden
              />

              <ProFormText
                width={200}
                label={$t({ defaultMessage: 'VLAN Name' })}
                name={['data', index, 'VLAN Name']}
                initialValue={item['VLAN Name']}
                rules={[{ required: true }]}
              />

              <UI.PurposeContainer>
                <UI.PurposeHeader>
                  <Logo style={{
                    width: '20px',
                    height: '20px',
                    verticalAlign: 'text-bottom',
                    color: cssStr('--acx-semantics-yellow-50') }} />
                  <span>{$t({ defaultMessage: 'Purpose' })}</span>
                </UI.PurposeHeader>
                <UI.PurposeText>{item['Purpose']}</UI.PurposeText>
              </UI.PurposeContainer>

              <ProFormText
                width={200}
                label={$t({ defaultMessage: 'VLAN ID' })}
                name={['data', index, 'VLAN ID']}
                initialValue={item['VLAN ID']}
                rules={[{ required: true }]}
              />
              <UI.ConfigurationContainer
                onClick={() => {
                  // setModalId(item['id'])
                  // setModalName(item['SSID Name'])
                  // setModalType(ssidTypes[index])
                  // setNetworkModalVisible(true)
                  // setConfiguredIndex(index)
                }}>

                <UI.ConfigurationHeader>
                  <div>
                    {$t({ defaultMessage: 'Port Configurations' })}
                  </div>

                  <div style={{ display: 'flex' }}>
                    {configuredFlags[index] ?
                      <UI.ConfiguredButton>
                        <UI.CollapseCircleSolidIcons/>
                        <div>{$t({ defaultMessage: 'Configured' })}</div>
                      </UI.ConfiguredButton> :
                      <UI.SetupButton>
                        {$t({ defaultMessage: 'Setup Ports' })}
                      </UI.SetupButton>}
                    <UI.ArrowChevronRightIcons />
                  </div>
                </UI.ConfigurationHeader>
                <div>
                  {$t({ defaultMessage: 'Ports have not been set yet. ' })}
                </div>
              </UI.ConfigurationContainer>
            </UI.VlanDetails>
          </UI.VlanContainer>
          <Divider dashed />
        </React.Fragment>
      ))}
    </UI.Container>
  )
}
