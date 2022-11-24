import { useEffect, useState } from 'react'

import { Col, Form, Row, Select } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { StepsForm }                    from '@acx-ui/components'
import { useGetPortalProfileListQuery } from '@acx-ui/rc/services'
import { Demo, Portal }                 from '@acx-ui/rc/utils'

import Photo      from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered    from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo       from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import WiFi4eu    from '../../../../assets/images/portal-demo/WiFi4euBanner.svg'
import PortalDemo from '../../../Services/Portal/PortalDemo'

import PortalServiceModal from './PortalServiceModal'


const PortalInstance = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const portalServiceID = useWatch('portalServiceID')
  const { data } = useGetPortalProfileListQuery({ params })
  const [demoValue, setDemoValue]= useState({} as Demo)
  const portalServices = data?.map(m => ({ label: m.serviceName, value: m.id })) ?? []
  const [portalList, setPortalList]= useState(portalServices)
  const [portalData, setPortalData]= useState([] as Portal[])
  const setPortal = (value:string)=>{
    const currentPortal = _.find(portalData,{ id: value })
    setDemoValue({ ...currentPortal?.demo as Demo,
      poweredImg: currentPortal?.demo.poweredImg || Powered,
      logo: currentPortal?.demo.logo || Logo,
      photo: currentPortal?.demo.photo || Photo,
      wifi4EU: currentPortal?.demo.wifi4EU || WiFi4eu })
  }
  useEffect(()=>{
    if(data){
      setPortalData([...data as Portal[]])
      setPortalList(portalServices)
    }
  },[data])
  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title>{$t({ defaultMessage: 'Portal Web Page' })}</StepsForm.Title>
          <Form.Item
            name='portalServiceDes'
            label={$t({ defaultMessage: 'Define the captive portal web page.' })}
          />
          <Form.Item
            name='portalServiceID'
            label={$t({ defaultMessage: 'Guest Portal Service' })}
            children={<Select
              options={[
                ...portalList
              ]}
              onChange={(v)=>setPortal(v)}
            />}
          />
          <PortalServiceModal updateInstance={(data)=>{
            portalData.push({ ...data, id: data.id || Date.now()+'' })
            portalList.push({
              label: data.serviceName, value: data.id || Date.now()+'' })
            setPortalList([...portalList])
            setPortalData([...portalData])
            form.setFieldValue('portalServiceID', data.id || Date.now()+'')
            setDemoValue(data.demo)
          }}/>
        </Col>
      </Row>
      {portalServiceID&&<Row>
        <PortalDemo value={demoValue} isPreview={true} fromNetwork={true}/>
      </Row>}
    </>
  )
}

export default PortalInstance
