import React, { useState } from 'react'

import { DeleteTwoTone } from '@ant-design/icons'
import {
  Switch,
  Row,
  Button,
  FormInstance
} from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetDHCPProfileListQuery, useVenueDHCPProfileQuery, useApListQuery } from '@acx-ui/rc/services'
import {  DHCPProfileAps }                                                      from '@acx-ui/rc/utils'
import { TenantLink }                                                           from '@acx-ui/react-router-dom'

import { AntSelect, AntLabel, IconContainer, AddBtnContainer, StyledForm } from './styledComponents'


const { Option } = AntSelect

const VenueDHCPForm = React.forwardRef((props, formRef:React.Ref<FormInstance> | undefined) => {
  const { $t } = useIntl()

  const params = useParams()

  const [form] = StyledForm.useForm()

  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params: { venueId: params.venueId }
  })

  const { data: dhcpProfileList } = useGetDHCPProfileListQuery({ params })

  const { data: apList } = useApListQuery({ params })

  const primaryServerSN = venueDHCPProfile?.dhcpServiceAps[
    _.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'PrimaryServer' })].serialNumber
  const backupServerSN = venueDHCPProfile?.dhcpServiceAps[
    _.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'BackupServer' })].serialNumber
  const natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []

  const [gateways, setGateways] = useState<DHCPProfileAps[]>(natGatewayList)



  const gatewaysList = gateways.map((item,index)=>{
	  return <><Row key={index}>
      <StyledForm.Item name={['gateways', index, 'serialNumber']}>
        <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
          defaultValue={item.serialNumber}>
          {apList?.data?.map( ap =>
            <Option value={ap.serialNumber}>
              {ap.name}
            </Option>
          )}
        </AntSelect>
      </StyledForm.Item>
      <IconContainer>
        <DeleteTwoTone onClick={()=>{
          const gatewayRawData = form.getFieldsValue().gateways

          _.pullAt(gatewayRawData, [index])
          form.setFieldsValue({ gateways: gatewayRawData })
          setGateways([...gatewayRawData])
        }}
        style={{ fontSize: 17, marginLeft: 10, cursor: 'pointer' }} />
      </IconContainer>
    </Row>
    {(gateways.length===index+1) && <AddBtnContainer>
      <Button onClick={()=>{
        form.setFieldsValue({ gateways: [...form.getFieldsValue().gateways, { }] })
        setGateways([...gateways, { serialNumber: '' , role: '' }])
      }}
      type='link'
      block>
        {$t({ defaultMessage: 'Add gateway' })}
      </Button>
    </AddBtnContainer>}</>
	 })

  return <StyledForm
    layout='vertical'
    validateTrigger='onBlur'
    initialValues={{
      serviceID: venueDHCPProfile?.serviceProfileId,
      enabled: venueDHCPProfile?.enabled,
      BackupServer: backupServerSN,
      PrimaryServer: primaryServerSN,
      gateways
    }}
    form={form}
    ref={formRef}
  >
    <StyledForm.Item name='enabled'
      label='Service State'
      valuePropName='checked'>
      <Switch
        defaultChecked={venueDHCPProfile?.enabled}
        checked={venueDHCPProfile?.enabled}/>
    </StyledForm.Item>

    <StyledForm.Item label={$t({ defaultMessage: 'DHCP service' })} name='serviceID'>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        defaultValue={venueDHCPProfile?.serviceProfileId}>
        {dhcpProfileList?.map( dhcp =>
          <Option value={dhcp.id}>
            {dhcp.serviceName}
          </Option>
        )}
      </AntSelect>
      <TenantLink style={{ marginLeft: 10 }}
        to={`/services/dhcp/${venueDHCPProfile?.serviceProfileId}/detail`}>
        {$t({ defaultMessage: 'Add DHCP for Wi-Fi Service' })}
      </TenantLink>

    </StyledForm.Item>
    <StyledForm.Item label={$t({ defaultMessage: 'Primary Server' })}
      name='PrimaryServer'
      rules={[{ required: true }]}>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        defaultValue={primaryServerSN}>
        {apList?.data?.map( ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    <StyledForm.Item label={$t({ defaultMessage: 'Secondary Server' })}
      name='BackupServer'>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}
        defaultValue={backupServerSN}>
        {apList?.data?.map( ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>

    <AntLabel>
      {$t({ defaultMessage: 'Gateway' })}
    </AntLabel>
    {gatewaysList}
  </StyledForm>
})

export default VenueDHCPForm
