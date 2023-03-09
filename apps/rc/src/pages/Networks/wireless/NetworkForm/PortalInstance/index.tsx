import { useContext, useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { GridCol, GridRow, StepsForm }                            from '@acx-ui/components'
import { useGetPortalLangMutation, useGetPortalProfileListQuery } from '@acx-ui/rc/services'
import { Demo, Portal, TableResult }                              from '@acx-ui/rc/utils'
import { loadImageWithJWT }                                       from '@acx-ui/utils'

import Photo              from '../../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered            from '../../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo               from '../../../../../assets/images/portal-demo/RuckusCloud.svg'
import PortalDemo         from '../../../../Services/Portal/PortalDemo'
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
  const portalServiceID = useWatch('portalServiceProfileId')
  const { data } = useGetPortalProfileListQuery({ params })
  const [demoValue, setDemoValue]= useState({} as Demo)
  const portalServices = data?.data?.map(m => ({ label: m.serviceName, value: m.id })) ?? []
  const [portalList, setPortalList]= useState(portalServices)
  const [portalData, setPortalData]= useState([] as Portal[])
  const setPortal = async (value:string)=>{
    const currentPortal = _.find(portalData,{ id: value })
    const content = currentPortal?.content as Demo
    const tempValue={ ...content,
      poweredImg: content.poweredImg?
        await loadImageWithJWT(content.poweredImg):Powered,
      logo: content.logo?await loadImageWithJWT(content.logo):Logo,
      photo: content.photo?await loadImageWithJWT(content.photo): Photo,
      bgImage: content.bgImage?await loadImageWithJWT(content.bgImage):'' ,
      wifi4EUNetworkId: content.wifi4EUNetworkId || '' }
    setDemoValue(tempValue)
    props.updatePortalData?.(tempValue)
  }
  useEffect(()=>{
    const fetchData= async (data: TableResult<Portal>) =>{
      setPortalData([...data.data as Portal[]])
      setPortalList(data?.data?.map(m => ({ label: m.serviceName, value: m.id })))
      if(networkData?.portalServiceProfileId){
        form.setFieldValue('portalServiceProfileId',networkData.portalServiceProfileId)
        const currentPortal = _.find(data.data,{ id: networkData.portalServiceProfileId })
        const content = currentPortal?.content as Demo
        const tempValue={ ...content,
          poweredImg: content.poweredImg?
            await loadImageWithJWT(content.poweredImg):Powered,
          logo: content.logo?await loadImageWithJWT(content.logo):Logo,
          photo: content.photo?await loadImageWithJWT(content.photo): Photo,
          bgImage: content.bgImage?await loadImageWithJWT(content.bgImage):'' ,
          wifi4EUNetworkId: content.wifi4EUNetworkId || '' }
        setDemoValue(tempValue)
      }
    }
    if(data){
      fetchData(data)
    }
  },[data])
  const [getPortalLang] = useGetPortalLangMutation()
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })
  useEffect(()=>{
    if(demoValue.displayLangCode){
      getPortalLang({ params: { ...params, messageName:
      demoValue.displayLangCode+'.json' } }).unwrap().then((res)=>{
        setPortalLang(res)
      })
    }

  }, [demoValue])
  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsForm.Title>{$t({ defaultMessage: 'Portal Web Page' })}</StepsForm.Title>
          <Form.Item
            label={$t({ defaultMessage: 'Define the captive portal web page.' })}
          />
          <Form.Item
            name='portalServiceProfileId'
            label={$t({ defaultMessage: 'Guest Portal Service' })}
            rules={[
              { required: true }
            ]}
            initialValue={''}
            children={<Select
              options={[
                { label: $t({ defaultMessage: 'Select Portal' }), value: '' },
                ...portalList
              ]}
              onChange={(v)=>{
                setPortal(v)
              }}
            />}
          />
          <Form.Item>
            <PortalServiceModal updateInstance={async (data)=>{
              portalData.push({ ...data, id: data.id })
              portalList.push({
                label: data.serviceName, value: data.id })
              setPortalList([...portalList])
              setPortalData([...portalData])
              form.setFieldValue('portalServiceProfileId', data.id)
              props.updatePortalData?.(data.content)
              setDemoValue({ ...data.content,
                poweredImg: data.content.poweredImg?
                  await loadImageWithJWT(data.content.poweredImg):Powered,
                logo: data.content.logo?await loadImageWithJWT(data.content.logo):Logo,
                photo: data.content.photo?await loadImageWithJWT(data.content.photo): Photo,
                bgImage: data.content.bgImage?await loadImageWithJWT(data.content.bgImage):'' })
            }}
            portalCount={portalData.length}
            />
          </Form.Item>
        </GridCol>
      </GridRow>
      {portalServiceID&&demoValue.componentDisplay&&
      <GridRow style={{ height: 648, paddingBottom: 40 }}>
        <PortalDemo value={demoValue}
          isPreview={true}
          fromNetwork={true}
          networkViewType={networkData?.guestPortal?.guestNetworkType}
          networkSocial={socials}
          viewPortalLang={portalLang}
        />
      </GridRow>}
    </>
  )
}

export default PortalInstance
