import { useContext, useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'
import { useParams }        from 'react-router-dom'

import { Modal, ModalType, StepsForm }                 from '@acx-ui/components'
import { useIsSplitOn, Features }                      from '@acx-ui/feature-toggle'
import { useSwitchPortProfilesListQuery }              from '@acx-ui/rc/services'
import { PortProfileUI, validateDuplicatePortProfile } from '@acx-ui/rc/utils'
import { validationMessages }                          from '@acx-ui/utils'

import PortProfileContext  from './PortProfileContext'
import { PortProfileStep } from './PortProfileStep'
import { SelectModelStep } from './SelectModelStep'

import { getPortProfileIdIfModelsMatch } from '.'

const payload = {
  fields: [
    'id'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function PortProfileModal (props: {
  visible: boolean,
  onSave:(values: PortProfileUI)=>void,
  onCancel?: ()=>void
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { visible, onSave, onCancel } = props
  const [form] = Form.useForm()
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [duplicatePortProfileMsg, setDuplicatePortProfileMsg] = useState(false)
  const {
    editMode,
    portProfileList,
    portProfileSettingValues,
    setPortProfileSettingValues
  } = useContext(PortProfileContext)

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { data: portProfilesList } = useSwitchPortProfilesListQuery({
    params: { tenantId },
    payload,
    enableRbac: isSwitchRbacEnabled
  })

  useEffect(()=>{
    form.resetFields()
  }, [form, visible])

  const onSaveModel = async (data: PortProfileUI) => {
    if(data.models && data.models.length > 0){
      const models = new Set(data.models)
      const sameModelPortProfileIds =
      getPortProfileIdIfModelsMatch(portProfileList,
        { ...portProfileSettingValues, models: Array.from(models) } )

      if(portProfilesList?.data){
        const duplicateResult = validateDuplicatePortProfile(
          sameModelPortProfileIds, portProfilesList.data)

        if (duplicateResult) {
          setDuplicatePortProfileMsg(true)
          return false
        } else {
          setDuplicatePortProfileMsg(false)
        }
      }

      setPortProfileSettingValues({ ...portProfileSettingValues, models: Array.from(models) })
      setNoModelMsg(false)
      return true
    }

    setNoModelMsg(true)
    return false
  }

  const onSavePortProfile = async (data: PortProfileUI) => {
    if(data.models && data.models.length > 0){
      const portProfileId = new Set(data.portProfileId)
      const sameModelPortProfileIds =
      getPortProfileIdIfModelsMatch(portProfileList,
        { ...portProfileSettingValues, models: Array.from(portProfileId) } )

      if(portProfilesList?.data){
        const duplicateResult = validateDuplicatePortProfile(
          sameModelPortProfileIds, portProfilesList.data)

        if (duplicateResult) {
          setDuplicatePortProfileMsg(true)
          return false
        } else {
          setDuplicatePortProfileMsg(false)
        }
      }

      setPortProfileSettingValues({
        ...portProfileSettingValues, portProfileId: Array.from(portProfileId) })
      return true
    }

    setNoModelMsg(true)
    return false
  }

  const onFinish = async (data: PortProfileUI) => {
    onSave(data)
  }

  return (
    <Modal
      visible={visible}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={editMode ?
        $t({ defaultMessage: 'Edit Port Profile' }) : $t({ defaultMessage: 'Add Port Profile' })}
      data-testid='PortProfileModal'
    >
      <StepsForm
        editMode={editMode}
        onCancel={onCancel}
        onFinish={onFinish}
        style={{ paddingBlockEnd: 0 }}
      >
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Select Models' })}
          onFinish={onSaveModel}
        >
          <div>
            <label style={{ color: 'var(--acx-neutrals-60)' }}>
              {$t({ defaultMessage: 'Select family and model to be configured:' })}
            </label>
          </div>
          {noModelMsg &&
              <Typography.Text type='danger'>
                {$t({ defaultMessage: 'No model selected' })}
              </Typography.Text>
          }
          {duplicatePortProfileMsg &&
            <Typography.Text type='danger'>
              {$t(validationMessages.SwitchPortProfilesDuplicateInvalid)}
            </Typography.Text>
          }
          <SelectModelStep />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Port Profiles' })}
          onFinish={onSavePortProfile}
        >
          <PortProfileStep />
        </StepsForm.StepForm>
      </StepsForm>
    </Modal>
  )
}