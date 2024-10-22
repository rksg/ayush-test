import React, { useState } from 'react'

import { ProFormCheckbox, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Button, Divider }                             from 'antd'
import { useIntl }                                     from 'react-intl'

import { cssStr }     from '@acx-ui/components'
import { CrownSolid } from '@acx-ui/icons'

import { ReactComponent as Logo } from '../../assets/gptDog.svg'

import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'Checked': boolean;
  'id': string;
}

export function WlanStep (props: { payload: string; description: string }) {
  const { $t } = useIntl()
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>(initialData)

  const objectiveOptions = [
    { value: 'Internal', label: $t({ defaultMessage: 'Internal' }) },
    { value: 'Guest', label: $t({ defaultMessage: 'Guest' }) },
    { value: 'VIP', label: $t({ defaultMessage: 'VIP' }) },
    { value: 'Infrastructure', label: $t({ defaultMessage: 'Infrastructure' }) },
    { value: 'Personal', label: $t({ defaultMessage: 'Personal' }) },
    { value: 'Public', label: $t({ defaultMessage: 'Public' }) }
  ]

  const addNetworkProfile = () => {
    const newProfile: NetworkConfig = {
      'Purpose': '',
      'SSID Name': '',
      'SSID Objective': 'Internal',
      'Checked': false,
      'id': ''
    }
    setData([...data, newProfile])
  }

  return (
    <UI.Container>
      <UI.HeaderWithAddButton>
        <UI.Title>{$t({ defaultMessage: 'Recommended Network Profiles' })}</UI.Title>
        <Button
          type='link'
          size='small'
          disabled={data.length >= 5}
          onClick={addNetworkProfile}>
          {$t({ defaultMessage: 'Add Network Profile' })}
        </Button>
      </UI.HeaderWithAddButton>

      <UI.HighlightedBox>
        <UI.HighlightedTitle>
          <CrownSolid
            style={{
              width: '20px',
              height: '20px',
              verticalAlign: 'text-bottom',
              color: cssStr('--acx-semantics-yellow-50')
            }}
          />
          <span>{$t({ defaultMessage: 'Recommended Network Profiles' })}</span>
        </UI.HighlightedTitle>
        <UI.HighlightedDescription>{props.description}</UI.HighlightedDescription>
      </UI.HighlightedBox>

      {data?.map((item, index) => (
        <React.Fragment key={index}>
          <UI.VlanContainer>
            <UI.CheckboxContainer>
              <ProFormCheckbox name={['data', index, 'Checked']} initialValue={true} />
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <div>
              <ProFormText
                name={['data', index, 'id']}
                initialValue={item['id']}
                hidden />
              <ProFormText
                name={['data', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden />
              <ProFormText
                width={200}
                rules={[{ required: true }]}
                label={$t({ defaultMessage: 'Network Name' })}
                name={['data', index, 'SSID Name']}
                initialValue={item['SSID Name']}
              />
              <ProFormSelect
                allowClear={false}
                tooltip={{
                  overlayStyle: { width: '700px' },
                  title: (
                    <ul style={{
                      margin: 0, padding: '0 20px',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      <li>{// eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Internal: For employees, teachers, lecturers, and students.' })}</li>
                      <li>{// eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Guest: For external guests, visitors, and customers.' })}</li>
                      <li>{// eslint-disable-next-line max-len
                        $t({ defaultMessage: 'VIP: For high-priority guests, visitors, and customers.' })}</li>
                      <li>{ // eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Infrastructure: For infrastructure devices, such as VoIP phones, barcode scanners, cameras, printers, security cameras, projectors, point-of-sale system, IoT devices, and smart home devices.' })}</li>
                      <li>{ // eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Personal: For home use, and personal devices, such as smartphones, tablets, and computers.' })}</li>
                      <li>{ // eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Public: For open public use without authentication.' })}</li>
                    </ul>
                  )
                }}
                width={200}
                label={$t({ defaultMessage: 'Network Objective' })}
                name={['data', index, 'SSID Objective']}
                initialValue={item['SSID Objective']}
                options={objectiveOptions}
              />
              {item['Purpose'] && <UI.PurposeContainer>
                <UI.PurposeHeader>
                  <Logo
                    style={{
                      width: '20px',
                      height: '20px',
                      verticalAlign: 'text-bottom',
                      color: cssStr('--acx-semantics-yellow-50')
                    }}
                  />
                  <span>{$t({ defaultMessage: 'Purpose' })}</span>
                </UI.PurposeHeader>
                <UI.PurposeText>{item['Purpose']}</UI.PurposeText>
              </UI.PurposeContainer>}
            </div>
          </UI.VlanContainer>
          <Divider dashed />
        </React.Fragment>
      ))}
    </UI.Container>
  )
}
