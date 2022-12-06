import { useContext, useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { GridCol, GridRow, StepsForm }  from '@acx-ui/components'
import { useGetPortalProfileListQuery } from '@acx-ui/rc/services'
import { Demo, Portal }                 from '@acx-ui/rc/utils'

import Photo              from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered            from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo               from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import WiFi4eu            from '../../../../assets/images/portal-demo/WiFi4euBanner.svg'
import PortalDemo         from '../../../Services/Portal/PortalDemo'
import NetworkFormContext from '../NetworkFormContext'

import PortalServiceModal from './PortalServiceModal'



const PortalInstance = (props:{
  updatePortalData?:(value:Demo)=>void
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const networkData = useContext(NetworkFormContext).data
  const socialIdentities = networkData?.guestPortal?.socialIdentities
  const socials={ facebookEnabled: false, googleEnabled: false,
    twitterEnabled: false, linkedInEnabled: false, smsEnabled: false }
  if(networkData?.guestPortal?.enableSmsLogin){
    socials.smsEnabled = true
  }
  if(socialIdentities){
    socials.facebookEnabled = socialIdentities.facebook ? true : false
    socials.googleEnabled = socialIdentities.google ? true : false
    socials.twitterEnabled = socialIdentities.twitter ? true : false
    socials.linkedInEnabled = socialIdentities.linkedin ? true : false
  }
  const portalServiceID = useWatch(['guestPortal','serviceId'])
  const { data } = useGetPortalProfileListQuery({ params })
  const [demoValue, setDemoValue]= useState({} as Demo)
  const portalServices = data?.map(m => ({ label: m.serviceName, value: m.id })) ?? []
  const [portalList, setPortalList]= useState(portalServices)
  const [portalData, setPortalData]= useState([] as Portal[])
  const setPortal = (value:string)=>{
    const currentPortal = _.find(portalData,{ id: value })
    const tempValue={ ...currentPortal?.demo as Demo,
      poweredImg: currentPortal?.demo.poweredImg || Powered,
      logo: currentPortal?.demo.logo || Logo,
      photo: currentPortal?.demo.photo || Photo,
      wifi4EU: currentPortal?.demo.wifi4EU || WiFi4eu }
    setDemoValue(tempValue)
    props.updatePortalData?.(tempValue)
  }
  useEffect(()=>{
    if(data){
      setPortalData([...data as Portal[]])
      setPortalList(portalServices)
    }
  },[data])
  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsForm.Title>{$t({ defaultMessage: 'Portal Web Page' })}</StepsForm.Title>
          <Form.Item
            label={$t({ defaultMessage: 'Define the captive portal web page.' })}
          />
          <Form.Item
            name={['guestPortal','serviceId']}
            label={$t({ defaultMessage: 'Guest Portal Service' })}
            rules={[
              { required: true }
            ]}
            children={<Select
              options={[
                ...portalList
              ]}
              onChange={(v)=>{
                setPortal(v)
              }}
            />}
          />
          <Form.Item>
            <PortalServiceModal updateInstance={(data)=>{
              const idNow = Date.now()
              portalData.push({ ...data, id: data.id || idNow+'' })
              portalList.push({
                label: data.serviceName, value: data.id || idNow+'' })
              setPortalList([...portalList])
              setPortalData([...portalData])
              form.setFieldValue(['guestPortal','serviceId'], data.id || idNow+'')
              setDemoValue(data.demo)
            }}/>
          </Form.Item>
        </GridCol>
      </GridRow>
      {portalServiceID&&<GridRow>
        <PortalDemo value={demoValue}
          isPreview={true}
          fromNetwork={true}
          networkViewType={networkData?.guestPortal?.guestNetworkType}
          networkSocial={socials}
        />
      </GridRow>}
    </>
  )
}

export default PortalInstance
