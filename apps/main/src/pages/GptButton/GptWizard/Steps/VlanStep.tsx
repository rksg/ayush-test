
import React from 'react'

import { ProFormCheckbox, ProFormText } from '@ant-design/pro-form'
import { Divider }                      from 'antd'

import { cssStr } from '@acx-ui/components'


import { ReactComponent as Logo } from '../../assets/gptDog.svg'


type NetworkConfig = {
  'Purpose': string;
  'VLAN ID': string;
  'VLAN Name': string;
  'Checked': boolean;
  'id':string
}

export function VlanStep ( props: {
    payload: string
  }
) {
  const step3payload = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  return <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{
      flex: '0 1 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <span style={{
        fontSize: '24px',
        fontWeight: 600,
        fontFamily: 'Montserrat'
      }}>
     Recommended VLANs
      </span>
      <span style={{ fontSize: '12px', color: '#808284', margin: '5px 0px 30px 0px' }}
      // eslint-disable-next-line max-len
      >Now, let us set up the VLANs for your school network. Setting up VLANs effectively will help in managing and segmenting your network traffic efficiently in your educational environment. Here’s how you can structure your VLANs for different use cases.
      </span>


      {step3payload.map((item, index) => (
        <React.Fragment key={index}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '45px 1fr'
          }}>
            <div style={{ display: 'flex' }}>
              <ProFormCheckbox
                name={['step3payload', index, 'Checked']}
                initialValue={true}
              ></ProFormCheckbox>
              <div style={{
                display: 'inline-block',
                border: '1px solid',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                textAlign: 'center',
                lineHeight: '20px',
                fontSize: '10px',
                fontWeight: '600',
                margin: '7px 5px 5px 5px'
              }}>
                {index + 1}
              </div>
            </div>
            <div >

              <ProFormText
                name={['step3payload', index, 'id']}
                initialValue={item['id']}
                hidden
              />
              <ProFormText
                name={['step3payload', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden
              />

              <ProFormText
                label='VLAN Name'
                name={['step3payload', index, 'VLAN Name']}
                initialValue={item['VLAN Name']}
              />

              <div style={{
                display: 'flex',
                backgroundColor: '#F7F7F7',
                padding: '10px 20px',
                flexGrow: 1,
                flexDirection: 'column',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  <Logo style={{
                    width: '20px',
                    height: '20px',
                    verticalAlign: 'text-bottom',
                    color: cssStr('--acx-semantics-yellow-50')
                  }} />
                  <span style={{ marginLeft: '5px' }}>
                 Purpose
                  </span>

                </div>
                <div style={{
                  fontSize: '12px',
                  margin: '5px 0px 0px 25px'
                }}>
                  {item['Purpose']}
                </div>
              </div>
              <ProFormText label='VLAN ID'
                name={['step3payload', index, 'VLAN ID']}
                initialValue={item['VLAN ID']}
              />
            </div>
            <Divider dashed />
          </div>

        </React.Fragment>
      ))}
    </div>
  </div>
}
