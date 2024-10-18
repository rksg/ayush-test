import React from 'react'

import { ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider }                    from 'antd'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'SSID Type': boolean;
  'id':string
}


export function WlanDetailStep (props: {
  payload: string
}) {

  const data = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  const networkOptions = [
    {
      value: NetworkTypeEnum.OPEN,
      label: 'Open Network'
    }, {
      value: NetworkTypeEnum.PSK,
      label: 'Passphrase (PSK/SAE)'
    }, {
      value: NetworkTypeEnum.DPSK,
      label: 'Dynamic Pre-Shared Key (DPSK)'
    }, {
      value: NetworkTypeEnum.AAA,
      label: 'Enterprise AAA (802.1X)'
    }, {
      value: NetworkTypeEnum.CAPTIVEPORTAL,
      label: 'Captive Portal'
    }
  ]

  return <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{
      flex: '0 1 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>


      <span style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Montserrat' }}>
      Recommended SSID
      </span>
      <span style={{ fontSize: '12px', color: '#808284', margin: '5px 0px 30px 0px' }}
      // eslint-disable-next-line max-len
      >Based on your selection, below is the list of SSIDs and their recommended respective configurations.
      </span>


      {data &&
       data.map((item, index: number) => (
         <React.Fragment key={index}>
           <div style={{
             display: 'grid',
             gridTemplateColumns: '35px 1fr'
           }}>
             <div style={{ display: 'flex' }}>
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
                 margin: '0px 5px 5px 5px'
               }}>
                 {index + 1}
               </div>
             </div>
             <div >
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
                 name={['data', index, 'SSID Objective']}
                 initialValue={item['SSID Objective']}
                 hidden
               />

               <ProFormText label='SSID name'
                 name={['data', index, 'SSID Name']}
                 initialValue={item['SSID Name']}
                 children={item['SSID Name']}
               />
               <ProFormSelect
                 label='Network Type'
                 name={['data', index, 'SSID Type']}
                 initialValue={item['SSID Type']}
                 options={networkOptions}
               />

             </div>
           </div>

           <Divider dashed />
         </React.Fragment>
       ))}

    </div>
  </div>
}
