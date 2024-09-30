import { cssStr } from '@acx-ui/components';
import { CrownSolid } from '@acx-ui/icons';
import { ProFormCheckbox, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Divider } from 'antd';
import { ReactComponent as Logo } from '../../assets/gptDog.svg'
import React from 'react';

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'Checked': boolean;
}

export function WlanStep(props: {
  payload: string,
  description: string}) {
  const step1payload = JSON.parse(props.payload) as NetworkConfig[]
  const objectiveOptions = [
    {
      value: 'Internal',
      label: 'Internal'
    }, {
      value: 'Guest',
      label: 'Guest'
    }, {
      value: 'VIP',
      label: 'VIP'
    }, {
      value: 'Infrastructure',
      label: 'Infrastructure'
    }, {
      value: 'Personal',
      label: 'Personal'
    }, {
      value: 'Public',
      label: 'Public'
    }
  ]
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
     fontFamily: 'Montserrat',
   }}>
     Recommended Network Profiles
   </span>
   <></>


   <div style={{
     display: 'flex', padding: '15px',
     backgroundColor: ' #FEF6ED',
     flexGrow: 1,
     flexDirection: 'column',
     borderRadius: '8px',
     margin: '20px 0px'
   }}>
     <div style={{ fontSize: '14px', fontWeight: 600 }}>
       <CrownSolid style={{
         width: '20px',
         height: '20px',
         verticalAlign: 'text-bottom',
         color: cssStr('--acx-semantics-yellow-50')
       }} />
       <span style={{ marginLeft: '5px' }}>
         Recommended Network Profiles
       </span>

     </div>
     <div style={{
       fontSize: '14px',
       margin: '5px 0px 0px 25px'
     }}>
       {props.description}
     </div>


   </div>


   {step1payload.map((item, index) => (
     <React.Fragment key={index}>

       <div style={{
         display: 'grid',
         gridTemplateColumns: '45px 1fr'
       }}>
          <div style={{display:'flex'}}>
           <ProFormCheckbox
             name={['step1payload', index, 'Checked']}
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
             width={200}
             label='Network Name'
             name={['step1payload', index, 'SSID Name']}
             initialValue={item['SSID Name']}
           />
           <ProFormSelect
             tooltip={{
               title: (
                 <ul style={{ margin: 0, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <li>Internal: For employees, teachers, lecturers, and students.</li>
                   <li>Guest: For external guests, visitors, and customers.</li>
                   <li>VIP: For high-priority guests, visitors, and customers.</li>
                   <li>Infrastructure: For infrastructure devices, such as VoIP phones, barcode scanners, cameras, printers, security cameras, projectors, point-of-sale system, IoT devices, and smart home devices.</li>
                   <li>Personal: For home use, and personal devices, such as smartphones, tablets, and computers.</li>
                   <li>Public: For open public use without authentication.</li>
                 </ul>
               ),
               overlayStyle: { width: '700px' }


             }}
             width={200}
             label='Network Objective'
             name={['step1payload', index, 'SSID Objective']} // 设置 name 对应原始数据结构
             initialValue={item['SSID Objective']}
             options={objectiveOptions}
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
                 Recommended Network Profiles
               </span>

             </div>
             <div style={{
               fontSize: '12px',
               margin: '5px 0px 0px 25px'
             }}>
               {props.description}
             </div>
           </div>
         </div>
         <Divider dashed />
       </div>

     </React.Fragment>
   ))}
 </div>
</div>
}
