import { ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { Divider } from 'antd';
import React from 'react';

export function VlanStep()  {

  const step3payload = {
    requestId: '567ce50233af4e47a7354d2c47b3a8e6',
    actionType: 'VLAN',
    payload: '[{"VLAN Name":"VLAN1","VLAN ID":"100"},{"VLAN Name":"VLAN2","VLAN ID":"200"}]'
  }


  return         <div style={{ display: 'flex', flexDirection: 'column' }}>
  <div style={{
    flex: '0 1 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>

    <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
      Recommended Settings for ICX
    </span>
    <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
      Optimal VLAN settings suggested by RuckusGPT to enhance network performance and management for ICX devices.
    </span>


    {step3payload.payload && JSON.parse(step3payload.payload).map((item: { [x: string]: any; }, index: number) => (

      <React.Fragment key={index}>
        <ProFormCheckbox
          name={['step3payload', index, 'Checked']}
          initialValue={true}
        ></ProFormCheckbox>
        <ProFormText label='VLAN ID'
          name={['step3payload', index, 'VLAN ID']}
          initialValue={item['VLAN ID']}
        />
        <ProFormText
          label='VLAN Name'
          name={['step3payload', index, 'VLAN Name']}
          initialValue={item['VLAN Name']}
        />
        <Divider dashed />
      </React.Fragment>
    ))}

  </div>
</div>
}
