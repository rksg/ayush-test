import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useEdgeDhcpActions
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import {
  EdgeDhcpSettingFormData,
  LeaseTimeType
} from '@acx-ui/rc/utils'

import { EdgeDhcpForm } from '../DHCPForm'


const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { updateEdgeDhcpProfile, isEdgeDhcpProfileUpdating } = useEdgeDhcpActions()
  const {
    data: edgeDhcpData,
    isLoading: isEdgeDhcpDataLoading
  } = useGetEdgeDhcpServiceQuery({ params: { id: params.serviceId } })

  useEffect(() => {
    if(edgeDhcpData) {
      form.resetFields()
      form.setFieldsValue(edgeDhcpData)
      form.setFieldValue(
        'enableSecondaryDNSServer',
        !!form.getFieldValue('secondaryDnsIp')
      )
      form.setFieldValue(
        'leaseTimeType',
        edgeDhcpData.leaseTime === -1 ? LeaseTimeType.INFINITE : LeaseTimeType.LIMITED
      )
      form.setFieldValue(
        'usedForNSG',
        (edgeDhcpData.dhcpPools?.length ?? -1) > 0
      )
    }
  }, [edgeDhcpData])

  const handelEdit = async (data: EdgeDhcpSettingFormData) =>
    updateEdgeDhcpProfile(params.serviceId || '', data)

  return (
    <EdgeDhcpForm
      form={form}
      title={$t({ defaultMessage: 'Edit DHCP for SmartEdge Service' })}
      submitButtonLabel={$t({ defaultMessage: 'Apply' })}
      onFinish={handelEdit}
      isSubmiting={isEdgeDhcpProfileUpdating}
      isDataLoading={isEdgeDhcpDataLoading}
    />
  )
}

export default EditDhcp
