import { useEffect, useState, useRef } from 'react'

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
import { useTenantLink }                                                        from '@acx-ui/react-router-dom'
import { TenantLink }                                                           from '@acx-ui/react-router-dom'

import { AntSelect, AntLabel, IconContainer, AddBtnContainer, StyledForm } from './styledComponents'


const { Option } = AntSelect

export default function DHCPForm () {
  const { $t } = useIntl()

  const params = useParams()

  const [gateways, setGateways] = useState([{}])



  const [form] = StyledForm.useForm()

  const linkToAddServices = useTenantLink('/services')


  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params: { venueId: params.venueId }
  })

  const { data } = useGetDHCPProfileListQuery({ params })

  const { data: apList } = useApListQuery({ params })

  const onChange = (index: number, serialNumber: string)=>{
    let tempArray = [...gateways]
    tempArray[index] = { ...tempArray[index], serialNumber }
    form.setFieldsValue({ gateways: tempArray })
    return setGateways(tempArray)
  }

  useEffect(() => {
    if (data) {
      // formRef?.current?.resetFields()
      form.setFieldsValue({
        "PrimaryServer":"150000000400",
        "BackupServer":"200002007012",
        "gateways":[{"serialNumber":"150000000401"},{"serialNumber":"150000000403"}]
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const gatewaysList = gateways.map((item,index)=>{
	  return <><Row key={index}>
      <StyledForm.Item name={['gateways', index, 'serialNumber']}>
        <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
          {apList?.data?.map( ap =>
            <Option value={ap.serialNumber}>
              {ap.name}
            </Option>
          )}
        </AntSelect>
      </StyledForm.Item>
      <IconContainer>
        <DeleteTwoTone onClick={()=>{
          _.pullAt(gateways, [index])
          form.setFieldsValue({ gateways: gateways })
          setGateways([...gateways])
        }}
        style={{ fontSize: 17, marginLeft: 10, cursor: 'pointer' }} />
      </IconContainer>
    </Row>
    {(gateways.length===index+1) && <AddBtnContainer>
      <Button onClick={()=>{
        form.setFieldsValue({ gateways: [...gateways, { }] })
        setGateways([...gateways, { }])
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
    form={form}
    onFinish={() => {
      form.validateFields()
      form.setFieldsValue(
        {
          PrimaryServer: '150000000402',
          gateways: [
            { serialNumber: '150000000401' },
            { serialNumber: '150000000403' }]
        }
      )
      setGateways([
        { serialNumber: '150000000401' },
        { serialNumber: '150000000403' }])


    }}
  >
    <StyledForm.Item name='enabled'
      label='Service State'
      valuePropName='checked'>
      <Switch
        defaultChecked={venueDHCPProfile?.enabled}
        checked={venueDHCPProfile?.enabled}/>
    </StyledForm.Item>

    <StyledForm.Item label={$t({ defaultMessage: 'DHCP service' })} name='name'>
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
        {apList?.data?.map( ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
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
      <AntSelect placeholder={$t({ defaultMessage: 'Select AP...' })}>
        {apList?.data?.map( ap =>
          <Option value={ap.serialNumber}>
            {ap.name}
          </Option>
        )}
      </AntSelect>
    </StyledForm.Item>
    <StyledForm.Item label={$t({ defaultMessage: 'Secondary Server' })}
      name='BackupServer'>
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
    <StyledForm.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type='primary' onClick={() => form.submit()}>
        Submit
      </Button>
    </StyledForm.Item>
  </StyledForm>
}
