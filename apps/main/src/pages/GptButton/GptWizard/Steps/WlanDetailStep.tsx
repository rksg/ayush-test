import { NetworkTypeEnum } from '@acx-ui/rc/utils';
import { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Divider } from 'antd';
import React from 'react';

export function WlanDetailStep() {

   const step2payload = { //Mock Data
    requestId: '567ce50233af4e47a7354d2c47b3a8e6',
    actionType: 'WLAN',
    payload: '[{"SSID Name":"Guest","SSID Type":"aaa"},{"SSID Name":"Staff","SSID Type":"dpsk"}]'
  }

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
      Recommended SSID Profiles
    </span>
    <span style={{ fontSize: '12px', color: '#808284', margin: '5px 0px 30px 0px' }}>
      Based on your selection, below is the list of SSIDs and their recommended respective configurations.
    </span>


    {step2payload.payload && JSON.parse(step2payload.payload).map((item: { [x: string]: any; }, index: number) => (
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

         <ProFormText label='SSID name'
          name={['step2payload', index, 'SSID Name']}
          children={item['SSID Name']}
        />
        <ProFormSelect
          label='Network Type'
          name={['step2payload', index, 'SSID Type']}
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
