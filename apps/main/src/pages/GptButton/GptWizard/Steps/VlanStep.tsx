import React from 'react'

import { ProFormCheckbox, ProFormText } from '@ant-design/pro-form'
import { Divider }                      from 'antd'
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
  const data = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  return (
    <UI.Container>
      <UI.Header>
        <UI.Title>{$t({ defaultMessage: 'Recommended VLANs' })}</UI.Title>
        <UI.Description>
          { // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Now, let us set up the VLANs for your school network. Setting up VLANs effectively will help in managing and segmenting your network traffic efficiently in your educational environment. Here’s how you can structure your VLANs for different use cases.'
            })}
        </UI.Description>
      </UI.Header>

      {data.map((item, index) => (
        <React.Fragment key={index}>
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
                label={$t({ defaultMessage: 'VLAN ID' })}
                name={['data', index, 'VLAN ID']}
                initialValue={item['VLAN ID']}
                rules={[{ required: true }]}
              />
            </UI.VlanDetails>
            <Divider dashed />
          </UI.VlanContainer>
        </React.Fragment>
      ))}
    </UI.Container>
  )
}
