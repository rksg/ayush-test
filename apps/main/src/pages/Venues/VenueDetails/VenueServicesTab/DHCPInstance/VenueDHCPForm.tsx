import React, { useState, useEffect } from 'react'

import { DeleteTwoTone } from '@ant-design/icons'
import {
  Switch,
  Row,
  Button,
  FormInstance,
  Space
} from 'antd'
import _                   from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams, Link } from 'react-router-dom'

import { useGetDHCPProfileListQuery, useVenueDHCPProfileQuery, useApListQuery } from '@acx-ui/rc/services'
import {  DHCPProfileAps }                                                      from '@acx-ui/rc/utils'
import {
  useTenantLink
} from '@acx-ui/react-router-dom'

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

  const [gateways, setGateways] = useState<DHCPProfileAps[]>()


  useEffect(() => {
    const natGatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []
    setGateways(natGatewayList)

    form.setFieldsValue({
      serviceId: venueDHCPProfile?.serviceProfileId,
      primaryServerSN: primaryServerSN,
      backupServerSN: backupServerSN,
      gateways: natGatewayList
    })
  }, [venueDHCPProfile, dhcpProfileList, apList, primaryServerSN, backupServerSN, form])


  const gatewaysList = (gateways && gateways.length>0) ? gateways?.map((item,index)=>{
    const currentVal = form.getFieldsValue().gateways[index]
    return <><Row key={index}>
      <StyledForm.Item name={['gateways', index, 'serialNumber']}>
        <AntSelect onChange={() => {
          const gatewayRawData = form.getFieldsValue().gateways
          setGateways([...gatewayRawData])
        }}
        placeholder={$t({ defaultMessage: 'Select AP...' })}>
          {apList?.data?.map(ap =>
            <Option value={ap.serialNumber}>
              {ap.name}
            </Option>
          )}
        </AntSelect>
      </StyledForm.Item>
      {(gateways?.length > 1) && <IconContainer>
        <Button type='text'
          onClick={()=>{
            const gatewayRawData = form.getFieldsValue().gateways
            _.pullAt(gatewayRawData, [index])
            form.setFieldsValue({ gateways: gatewayRawData })
            setGateways([...gatewayRawData])
          }}
          icon={<DeleteTwoTone />} />
      </IconContainer>}
    </Row>
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
    </AddBtnContainer>}</>
  }) : <><Row>
    <StyledForm.Item name={['gateways', 0, 'serialNumber']}>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
        {apList?.data?.map(ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
  </Row>
  <AddBtnContainer>
    <Button onClick={()=>{
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
    ref={formRef}
  >
    <StyledForm.Item name='enabled'
      label='Service State'
      valuePropName='checked'>
      <Switch
        defaultChecked={venueDHCPProfile?.enabled}
        checked={venueDHCPProfile?.enabled}/>
    </StyledForm.Item>

    <StyledForm.Item label={$t({ defaultMessage: 'DHCP service' })}>
      <Space>
        <StyledForm.Item
          name='serviceId'
          noStyle
          rules={[{ required: true, message: 'Username is required' }]}
        >
          <AntSelect placeholder={$t({ defaultMessage: 'Select Service...' })}>
            {dhcpProfileList?.map( dhcp =>
              <Option value={dhcp.id}>
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
      rules={[{ required: true }]}>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
        {apList?.data?.map( ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    <StyledForm.Item label={$t({ defaultMessage: 'Secondary Server' })}
      name='backupServerSN'>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
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
