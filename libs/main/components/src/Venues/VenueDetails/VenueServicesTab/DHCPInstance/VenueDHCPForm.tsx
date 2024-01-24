import React, { useState, useEffect, useImperativeHandle, Ref, forwardRef } from 'react'


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
import {  DHCPProfileAps, DHCPSaveData, DHCPConfigTypeEnum, ApDeviceStatusEnum, APExtended, DHCP_LIMIT_NUMBER } from '@acx-ui/rc/utils'
import {
  useTenantLink
} from '@acx-ui/react-router-dom'

import useDHCPInfo                                               from './hooks/useDHCPInfo'
import { AntSelect, IconContainer, AddBtnContainer, StyledForm } from './styledComponents'


const { Option } = AntSelect
const defaultAPPayload = {
  fields: ['serialNumber', 'name', 'venueId', 'apStatusData', 'deviceStatus'],
  pageSize: 10000
}
const VenueDHCPForm = (props: {
  form: FormInstance,
}, ref: Ref<unknown> | undefined) => {
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
  const [isHierarchical, setIsHierarchical] = useState(false)

  const [serviceEnabled, setServiceEnabled] = useState<boolean|undefined>(true)

  const getSelectedDHCPMode = ()=> {
    if(dhcpProfileList && dhcpServiceID){
      return dhcpProfileList[_.findIndex(dhcpProfileList,
        { id: dhcpServiceID })].dhcpMode
    }else{
      return DHCPConfigTypeEnum.SIMPLE
    }
  }
  const isMaxNumberReached = ()=>{
    return dhcpProfileList&&dhcpProfileList.length >= DHCP_LIMIT_NUMBER
  }

  useEffect(() => {
    setIsSimpleMode(getSelectedDHCPMode() === DHCPConfigTypeEnum.SIMPLE)
    setIsHierarchical(getSelectedDHCPMode() === DHCPConfigTypeEnum.HIERARCHICAL)
  },[dhcpServiceID, dhcpProfileList])

  let natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []
  useEffect(() => {
    const initVal = getInitValue()
    setGateways(initVal.gateways ?? [])
    form.setFieldsValue(initVal)
    setServiceEnabled(initVal.enabled)
    setDHCPServiceID(dhcpInfo.id as string)
    refreshList()
  }, [venueDHCPProfile, form, dhcpInfo.id, dhcpInfo.primaryDHCP.serialNumber,
    dhcpInfo.secondaryDHCP.serialNumber, apList])


  const resetForm = ()=>{
    const initVal = getInitValue()
    setGateways(initVal.gateways ?? [])
    form.setFieldsValue(initVal)
    setServiceEnabled(initVal.enabled)
    setDHCPServiceID(dhcpInfo.id as string)
    refreshList()
  }
  useImperativeHandle(ref, () => ({
    resetForm: resetForm
  }))

  const getInitValue = ()=>{
    const natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []
    return {
      enabled: venueDHCPProfile?.enabled,
      serviceProfileId: dhcpInfo?.id,
      primaryServerSN: _.find(apList?.data, (ap)=> ap.serialNumber===
        dhcpInfo?.primaryDHCP.serialNumber, 0)?dhcpInfo?.primaryDHCP.serialNumber:'',
      backupServerSN: _.find(apList?.data, (ap)=> ap.serialNumber===
        dhcpInfo?.secondaryDHCP.serialNumber, 0)?dhcpInfo?.secondaryDHCP.serialNumber:'',
      gateways: natGatewayList
    }
  }

  const refreshList = ()=>{
    let selectAPList = [
      form.getFieldsValue().primaryServerSN,
      form.getFieldsValue().backupServerSN
    ]
    if(form.getFieldsValue().gateways){
      // eslint-disable-next-line max-len
      const gatewaySelects = form.getFieldsValue().gateways.map((item:{ serialNumber:string }) => item.serialNumber)
      selectAPList = selectAPList.concat(gatewaySelects)
    }

    setSelectedAPs(selectAPList)
  }
  const getOptionList = (sn:string, notForGateway?:boolean)=>{
    if(apList?.data) {
      return _.filter(apList?.data, (o) => {
        const isHierarchical = getSelectedDHCPMode() === DHCPConfigTypeEnum.HIERARCHICAL
        let skipForH = false
        if(notForGateway===true
          && isHierarchical && o.apStatusData
          && o.apStatusData.lanPortStatus
          && o.apStatusData.lanPortStatus?.length <= 1){
          skipForH = true
        }
        return (!_.some(selectedAPs, (ap)=>{
          return ap===o.serialNumber
        }) || o.serialNumber===sn)
        && o.deviceStatus===ApDeviceStatusEnum.OPERATIONAL
        && !skipForH
      })
    }
    return []
  }

  const getAPDetail = (sn:string)=>{
    return _.find(apList?.data, { serialNumber: sn })
  }

  const blankOption = <Option key={''} value={''}>
    {$t({ defaultMessage: 'Select AP...' })}
  </Option>
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
          {blankOption}
          {getOptionList(form.getFieldsValue().gateways
            && form.getFieldsValue().gateways[index]
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
        {blankOption}
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
            // eslint-disable-next-line max-len
            const mode = dhcpProfileList && dhcpProfileList[_.findIndex(dhcpProfileList, { id: val as string })].dhcpMode
            if(mode === DHCPConfigTypeEnum.HIERARCHICAL){
              const primaryServer = getAPDetail(form.getFieldsValue().primaryServerSN)
              const secondary = getAPDetail(form.getFieldsValue().backupServerSN)
              const resetField = (server: APExtended | undefined, fieldName:string)=>{
                if(server
                  && server.apStatusData
                  && server.apStatusData.lanPortStatus
                  && server.apStatusData.lanPortStatus?.length <= 1){
                  form.setFieldValue(fieldName, '')
                }
              }
              resetField(primaryServer, 'primaryServerSN')
              resetField(secondary, 'backupServerSN')
              form.setFieldValue('gateways', undefined)
            }
            refreshList()
          }}
          placeholder={$t({ defaultMessage: 'Select Service...' })}>
            {dhcpProfileList?.map( (dhcp:DHCPSaveData) =>
              <Option key={dhcp.id} value={dhcp.id}>
                {dhcp.serviceName}
              </Option>
            )}
          </AntSelect>
        </StyledForm.Item>

        <Link style={isMaxNumberReached() ?
          { marginLeft: 10, cursor: 'not-allowed', color: 'var(--acx-neutrals-40)' }:
          { marginLeft: 10 }}
        onClick={(e)=>{
          if(isMaxNumberReached()){
            e.preventDefault()
            e.stopPropagation()
          }
        }}
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
        {blankOption}
        {getOptionList(form.getFieldsValue().primaryServerSN, true).map( ap =>
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
        {blankOption}
        {getOptionList(form.getFieldsValue().backupServerSN, true).map( ap =>
          <Option key={ap.serialNumber} value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    {!isSimpleMode
    && !isHierarchical
    && serviceEnabled &&
    <StyledForm.Item label={$t({ defaultMessage: 'Gateway' })}>
      {gatewaysList}
    </StyledForm.Item>}
  </StyledForm>
}

export default forwardRef(VenueDHCPForm)
