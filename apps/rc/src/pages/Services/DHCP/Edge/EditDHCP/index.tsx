import { useEffect, useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  PageHeader, showToast, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery, useUpdateEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSetting }                                              from '@acx-ui/rc/utils'

import { mockEdgeDhcpData } from '../__tests__/fixtures'

const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const formRef = useRef<StepsFormInstance<EdgeDhcpSetting>>()
  const edgeDhcpData = useGetEdgeDhcpServiceQuery({ params: { id: params.serviceId } })
  const [updateEdgeDhcp] = useUpdateEdgeDhcpServiceMutation()

  useEffect(() => {
    formRef.current?.setFieldsValue(mockEdgeDhcpData)
  }, [])
  // useEffect(() => {
  //   if(edgeDhcpData.data) {
  //     formRef.current?.setFieldsValue(edgeDhcpData.data)
  //   }
  // }, [edgeDhcpData])

  const handleEditEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = { ...data, id: params.serviceId }
      const pathVar = { id: params.serviceId }
      await updateEdgeDhcp({ payload, params: pathVar }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit DHCP for SmartEdge Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleEditEdgeDhcp}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      >
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default EditDhcp
