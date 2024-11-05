import React, { useState } from 'react'

import { ProFormCheckbox, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Button, Divider }                             from 'antd'
import { useIntl }                                     from 'react-intl'

import { cssStr }                  from '@acx-ui/components'
import { CrownSolid, RuckusAiDog } from '@acx-ui/icons'


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


  const tooltipItems = [
    {
      label: $t({ defaultMessage: 'Internal' }),
      description: $t({ defaultMessage: 'For employees, teachers, lecturers, and students.' })
    },
    {
      label: $t({ defaultMessage: 'Guest' }),
      description: $t({ defaultMessage: 'For external guests, visitors, and customers.' })
    },
    {
      label: $t({ defaultMessage: 'VIP' }),
      description: $t({ defaultMessage: 'For high-priority guests, visitors, and customers.' })
    },
    {
      label: $t({ defaultMessage: 'Infrastructure' }),
      // eslint-disable-next-line max-len
      description: $t({ defaultMessage: 'For infrastructure devices, such as VoIP phones, barcode scanners, cameras, printers, security cameras, projectors, point-of-sale system, IoT devices, and smart home devices.' })
    },
    {
      label: $t({ defaultMessage: 'Personal' }),
      // eslint-disable-next-line max-len
      description: $t({ defaultMessage: 'For home use, and personal devices, such as smartphones, tablets, and computers.' })
    },
    {
      label: $t({ defaultMessage: 'Public' }),
      description: $t({ defaultMessage: 'For open public use without authentication.' })
    }
  ]

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
            <div style={{ marginTop: '5px' }}>
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
                  overlayStyle: { minWidth: '600px' },
                  title: (<>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      lineHeight: '16px',
                      color: cssStr('--acx-neutrals-40'),
                      marginBottom: '5px'
                    }}>
                      {$t({ defaultMessage: 'Network Objective Description' })}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: cssStr('--acx-neutrals-40'),
                      marginBottom: '10px'
                    }} >
                      {// eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Network Objective defines the purpose and access level of different types of network connections within an organization.' })}
                    </div>
                    <ul style={{
                      margin: 0, padding: '0 20px',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      {tooltipItems.map((item, index) => (
                        <li key={index}>
                          <span><strong>{item.label}</strong>: {item.description}</span>
                        </li>
                      ))}
                    </ul></>
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
                  <RuckusAiDog
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
