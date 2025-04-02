import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import {
  useAddEthernetPortProfileTemplateMutation,
  useCreateEthernetPortProfileMutation,
  useUpdateEthernetPortProfileRadiusIdMutation
} from '@acx-ui/rc/services'
import { EthernetPortProfileFormType, useConfigTemplate, useConfigTemplateMutationFnSwitcher } from '@acx-ui/rc/utils'

import { EthernetPortProfileForm, requestPreProcess } from '../EthernetPortProfileForm'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

interface AddEthernetPortProfileFormProps {
  isEmbedded?: boolean
  onClose?: ()=>void
  updateInstance?: (createId:string)=>void
}


export const AddEthernetPortProfile = (props: AddEthernetPortProfileFormProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isTemplate } = useConfigTemplate()
  const { onClose, isEmbedded, updateInstance } = props
  const isWiredClientVisibilityEnabled = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const [ createEthernetPortProfile ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useCreateEthernetPortProfileMutation,
    useTemplateMutationFn: useAddEthernetPortProfileTemplateMutation
  })

  const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()

  const handleAddEthernetPortProfile = async (data: EthernetPortProfileFormType) => {
    try {
      const payload = requestPreProcess(isWiredClientVisibilityEnabled, data)
      const createResult =
        await createEthernetPortProfile({ payload }).unwrap()
      const createId = createResult.response?.id
      if (createId && !isTemplate) {
        if (payload.authRadiusId) {
          updateEthernetPortProfileRadiusId({ params: {
            id: createId,
            radiusId: payload.authRadiusId
          } })
        }

        if (payload.accountingRadiusId) {
          updateEthernetPortProfileRadiusId({ params: {
            id: createId,
            radiusId: payload.accountingRadiusId
          } })
        }

        updateInstance?.(createId)
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <Row>
      <Col span={12}>
        <EthernetPortProfileForm
          submitButtonLabel={$t({ defaultMessage: 'Add' })}
          onFinish={handleAddEthernetPortProfile}
          form={form}
          onCancel={onClose}
          isEmbedded={isEmbedded}
        />
      </Col>
    </Row>
  )
}