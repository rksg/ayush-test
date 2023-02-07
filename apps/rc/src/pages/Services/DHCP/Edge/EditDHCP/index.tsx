import { useEffect, useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader,
  PageHeader, showToast, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery, useUpdateEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSetting }                                              from '@acx-ui/rc/utils'



const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const formRef = useRef<StepsFormInstance<EdgeDhcpSetting>>()
  const {
    data: edgeDhcpData,
    isLoading: isEdgeDhcpDataLoading
  } = useGetEdgeDhcpServiceQuery({ params: { id: params.serviceId } })
  const [updateEdgeDhcp] = useUpdateEdgeDhcpServiceMutation()

  useEffect(() => {
    if(edgeDhcpData) {
      formRef.current?.resetFields()
      formRef.current?.setFieldsValue(edgeDhcpData)
    }
  }, [edgeDhcpData])

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
      <Loader states={[{ isLoading: isEdgeDhcpDataLoading }]}>
        <StepsForm
          formRef={formRef}
          editMode={true}
          onFinish={handleEditEdgeDhcp}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        >
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}

export default EditDhcp
