import React, { useState, useEffect } from 'react'


import {
  Switch,
  FormInstance,
  Space
} from 'antd'
import _                   from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams, Link } from 'react-router-dom'

import { GridRow, Button }    from '@acx-ui/components'
import { DeleteOutlinedIcon } from '@acx-ui/icons'
import {
  useGetDHCPProfileListQuery,
  useVenueDHCPProfileQuery,
  useApListQuery
} from '@acx-ui/rc/services'
import {  DHCPProfileAps, DHCPSaveData, DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import {
  useTenantLink
} from '@acx-ui/react-router-dom'

import useDHCPInfo                                               from './hooks/useDHCPInfo'
import { AntSelect, IconContainer, AddBtnContainer, StyledForm } from './styledComponents'


const { Option } = AntSelect
const defaultAPPayload = {
  fields: ['serialNumber', 'name', 'venueId'],
  pageSize: 10000
}
const VenueDHCPForm = (props: {
  form: FormInstance,
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = props.form
  const dhcpInfo = useDHCPInfo()

  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })
  const { data: dhcpProfileList } = useGetDHCPProfileListQuery({ params })
  const { data: apList } = useApListQuery({
    params,
    payload: {
      ...defaultAPPayload,
      filters: { venueId: params.venueId ? [params.venueId] : [] }
    }
  })

  const [selectedAPs, setSelectedAPs] = useState<string[]>([])

  const [gateways, setGateways] = useState<DHCPProfileAps[]>()
  const [dhcpServiceID, setDHCPServiceID] = useState('')
  const [isSimpleMode, setIsSimpleMode] = useState(true)

  const [serviceEnabled, setServiceEnabled] = useState<boolean|undefined>(true)


  const getSelectedDHCPMode = ()=> {
    if(dhcpProfileList && dhcpServiceID){
      return dhcpProfileList[_.findIndex(dhcpProfileList, { id: dhcpServiceID })].dhcpMode
    }else{
      return DHCPConfigTypeEnum.SIMPLE
    }
  }

  useEffect(() => {
    setIsSimpleMode(getSelectedDHCPMode() === DHCPConfigTypeEnum.SIMPLE)
  },[dhcpServiceID, dhcpProfileList])

  let natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []
  useEffect(() => {
    const initVal = getInitValue()
    setGateways(initVal.gateways)
    form.setFieldsValue(initVal)
    setServiceEnabled(initVal.enabled)
    setDHCPServiceID(dhcpInfo.id as string)
  }, [venueDHCPProfile, form, dhcpInfo.id, dhcpInfo.primaryDHCP.serialNumber,
    dhcpInfo.secondaryDHCP.serialNumber])

  const getInitValue = ()=>{
    const natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []
    return {
      enabled: venueDHCPProfile?.enabled,
      serviceProfileId: dhcpInfo?.id,
      primaryServerSN: dhcpInfo?.primaryDHCP.serialNumber,
      backupServerSN: dhcpInfo?.secondaryDHCP.serialNumber,
      gateways: natGatewayList
    }
  }

  const refreshList = ()=>{
    setSelectedAPs([
      form.getFieldsValue().primaryServerSN,
      form.getFieldsValue().backupServerSN,
      ...form.getFieldsValue().gateways.map((item:{ serialNumber:string }) => item.serialNumber)
    ])
    return []
  }
  const getOptionList = (sn:string)=>{
    if(apList?.data) {
      return _.filter(apList?.data, (o) => {

        return !_.some(selectedAPs, (ap)=>{
          return ap===o.serialNumber
        }) || o.serialNumber===sn

      })
    }
    return []
  }

  const gatewaysList = (gateways && gateways.length>0) ? gateways?.map((item,index)=>{
    const fieldsGateways = form.getFieldsValue().gateways
    const currentVal = fieldsGateways ? fieldsGateways[index] : null

    return <div key={index}><GridRow style={{ marginLeft: 0, marginRight: 0,
      marginTop: 0, marginBottom: 0 }}>
      <StyledForm.Item name={['gateways', index, 'serialNumber']}>
        <AntSelect onChange={() => {
          refreshList()
          const gatewayRawData = form.getFieldsValue().gateways
          setGateways([...gatewayRawData])
        }}
        placeholder={$t({ defaultMessage: 'Select AP...' })}>
          {getOptionList(form.getFieldsValue().gateways[index]
            && form.getFieldsValue().gateways[index].serialNumber).map(ap =>
            <Option key={ap.serialNumber} value={ap.serialNumber}>
              {ap.name}
            </Option>
          )}
        </AntSelect>
      </StyledForm.Item>
      {(gateways?.length > 1) && <IconContainer>
        <Button type='link'
          onClick={()=>{
            const gatewayRawData = form.getFieldsValue().gateways
            _.pullAt(gatewayRawData, [index])
            form.setFieldsValue({ gateways: gatewayRawData })
            setGateways([...gatewayRawData])
            refreshList()
          }}
          icon={<DeleteOutlinedIcon />} />
      </IconContainer>}
    </GridRow>
    {(gateways?.length===index+1) && <AddBtnContainer>
      <Button disabled={_.isEmpty(currentVal?.serialNumber)}
        onClick={()=>{
          form.setFieldsValue({ gateways: [...form.getFieldsValue().gateways, { }] })
          setGateways([...gateways, { serialNumber: '' , role: '' }])
        }}
        type='link'
        block>
        {$t({ defaultMessage: 'Add gateway' })}
      </Button>
    </AddBtnContainer>}</div>
  }) : <><GridRow style={{ marginLeft: 0, marginRight: 0,
    marginTop: 0, marginBottom: 0 }}>
    <StyledForm.Item name={['gateways', 0, 'serialNumber']}>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        onChange={() => {
          refreshList()
        }}
      >
        {getOptionList(form.getFieldsValue().gateways
          && form.getFieldsValue().gateways[0].serialNumber).map(ap =>
          <Option key={ap.serialNumber} value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
  </GridRow>
  <AddBtnContainer>
    <Button
      onClick={()=>{
        form.setFieldsValue({ gateways: [...form.getFieldsValue().gateways, { }] })
        setGateways([{ serialNumber: '' , role: '' }, { serialNumber: '' , role: '' }])
      }}
      type='link'
      block>
      {$t({ defaultMessage: 'Add gateway' })}
    </Button>
  </AddBtnContainer></>

  return <StyledForm
    layout='vertical'
    validateTrigger='onBlur'
    form={form}
    initialValues={{
      enabled: venueDHCPProfile?.enabled,
      serviceProfileId: dhcpInfo?.id,
      primaryServerSN: dhcpInfo?.primaryDHCP.serialNumber,
      backupServerSN: dhcpInfo?.secondaryDHCP.serialNumber,
      gateways: natGatewayList
    }}
  >
    <StyledForm.Item name='enabled'
      label={$t({ defaultMessage: 'Service State' })}
      valuePropName='checked'>
      <Switch
        onChange={(checked) => {
          setServiceEnabled(checked)
        }}
        defaultChecked={venueDHCPProfile?.enabled}
        checked={venueDHCPProfile?.enabled}/>
    </StyledForm.Item>

    <StyledForm.Item label={$t({ defaultMessage: 'DHCP service' })}
      hidden={!serviceEnabled}>
      <Space>
        <StyledForm.Item
          name='serviceProfileId'
          noStyle
          rules={[{ required: true, message: $t({ defaultMessage: 'DHCP service is required' }) }]}
        >
          <AntSelect onChange={(val)=>{
            setDHCPServiceID(val as string)
          }}
          placeholder={$t({ defaultMessage: 'Select Service...' })}>
            {dhcpProfileList?.map( (dhcp:DHCPSaveData) =>
              <Option key={dhcp.id} value={dhcp.id}>
                {dhcp.serviceName}
              </Option>
            )}
          </AntSelect>
        </StyledForm.Item>

        <Link style={{ marginLeft: 10 }}
          to={useTenantLink('/services/dhcp/create')}
          state={{
            origin: useTenantLink(`/venues/${params.venueId}/venue-details/services`),
            param: { showConfig: true }
          }}>
          {$t({ defaultMessage: 'Add DHCP for Wi-Fi Service' })}
        </Link>

      </Space>
    </StyledForm.Item>

    <StyledForm.Item label={$t({ defaultMessage: 'Primary Server' })}
      name='primaryServerSN'
      hidden={isSimpleMode || !serviceEnabled}
      rules={[{ required: isSimpleMode ? false : true }]}>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        onChange={() => {
          refreshList()
        }}>
        {getOptionList(form.getFieldsValue().primaryServerSN).map( ap =>
          <Option key={ap.serialNumber} value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    <StyledForm.Item label={$t({ defaultMessage: 'Secondary Server' })}
      hidden={isSimpleMode || !serviceEnabled}
      name='backupServerSN'>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        onChange={() => {
          refreshList()
        }}
      >
        {getOptionList(form.getFieldsValue().backupServerSN).map( ap =>
          <Option key={ap.serialNumber} value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    {!isSimpleMode && serviceEnabled &&
    <StyledForm.Item label={$t({ defaultMessage: 'Gateway' })}>
      {gatewaysList}
    </StyledForm.Item>}
  </StyledForm>
}

export default VenueDHCPForm
