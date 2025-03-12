import { FunctionComponent, useEffect, useState } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'
import { NodeProps }      from 'reactflow'

import { Button, Drawer, Loader }                                                                       from '@acx-ui/components'
import { EyeOpenSolid }                                                                                 from '@acx-ui/icons'
import {  useLazyGetActionByIdQuery }                                                                   from '@acx-ui/rc/services'
import { ActionType, ActionTypeTitle, GenericActionData, useGetActionDefaultValueByType, WorkflowUrls } from '@acx-ui/rc/utils'
import { hasPermission }                                                                                from '@acx-ui/user'
import { getOpsApi }                                                                                    from '@acx-ui/utils'

import { WorkflowActionPreviewModal } from '../../../WorkflowActionPreviewModal'

import { useWorkflowStepActions } from './useWorkflowStepActions'
import {
  AupSettings,
  DataPromptSettings,
  DisplayMessageSetting,
  DpskSettings,
  MacRegistrationSettings,
  CertTemplateSettings
} from './WorkflowActionSettingForm'



export interface StepDrawerProps {
  isEdit: boolean,
  actionId?: string,
  workflowId: string
  visible: boolean,
  actionType: ActionType,
  onClose: () => void,

  priorNode?: NodeProps
}

const actionFormMap: Record<ActionType, FunctionComponent> = {
  [ActionType.AUP]: AupSettings,
  [ActionType.DATA_PROMPT]: DataPromptSettings,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageSetting,
  [ActionType.DPSK]: DpskSettings,
  [ActionType.MAC_REG]: MacRegistrationSettings,
  [ActionType.CERT_TEMPLATE]: CertTemplateSettings
}

export default function StepDrawer (props: StepDrawerProps) {
  const { $t } = useIntl()
  const {
    workflowId: policyId, visible, onClose,
    actionType, priorNode,
    isEdit, actionId
  } = props
  const defaultValue = useGetActionDefaultValueByType(actionType)
  const ActionForm = actionFormMap[actionType]

  const [ formInstance ] = Form.useForm()

  const { createStepWithActionMutation: createStep, patchActionMutation } = useWorkflowStepActions()
  const [ isPreviewOpen, setIsPreviewOpen ] = useState(false)
  const [actionData, setActionData] = useState<GenericActionData | undefined>()
  const [ getActionById, {
    isLoading: isActionLoading,
    isFetching: isActionFetching,
    isError: isActionError
  } ] = useLazyGetActionByIdQuery()


  useEffect(() => {
    formInstance.resetFields()

    if (!isEdit) {
      formInstance.setFieldsValue(defaultValue)
      return
    }

    if (!actionId) return

    getActionById({ params: { policyId, actionId } })
      .then((result) => {
        if (result?.data === undefined) return

        const data = { ...result.data, actionId }
        setActionData(data)
        formInstance.setFieldsValue(data)
      })

  }, [formInstance, actionId, isEdit])

  const onSave = async () => {
    try {
      const formContent = await formInstance.validateFields()

      isEdit
        ? actionData && await patchActionMutation(actionData, formContent).then(onClose)
        : await new Promise((resolve) => {
          const onSuccess = () => {
            onClose()
            resolve(true)
          }
          const onError = () => resolve(true)

          createStep(policyId, actionType, formContent, priorNode?.id, onSuccess, onError)
        })
    } catch (ignore) {

    }
  }

  return (<>
    <Drawer
      title={$t(ActionTypeTitle[actionType])}
      destroyOnClose
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <Loader
          states={[
            { isLoading: isActionLoading, isFetching: isActionFetching }
          ]}
        >
          <Form<GenericActionData>
            disabled={isActionError}
            form={formInstance}
            layout={'vertical'}
          >
            <Row>
              <Col span={23}>
                <ActionForm />
              </Col>
            </Row>
          </Form>
        </Loader>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: isEdit
              ? $t({ defaultMessage: 'Save Step' })
              : $t({ defaultMessage: 'Add Step' })
          }}
          onSave={onSave}
          onCancel={onClose}
          showSaveButton={!isActionError &&
            hasPermission({ rbacOpsIds: isEdit? [getOpsApi(WorkflowUrls.patchAction)] :
              [getOpsApi(WorkflowUrls.createAction)] })}
          extra={
            <Button
              type={'link'}
              icon={<EyeOpenSolid/>}
              onClick={() => {
                formInstance.validateFields()
                  .then(() => setIsPreviewOpen(true))
                  .catch(() => {})
              }}
            >
              {$t({ defaultMessage: 'Preview' })}
            </Button>
          }
        />
      }
      footerStyle={{
        backgroundColor: '#f8f8fa',
        margin: '0px',
        padding: '20px'
      }}
    />

    {isPreviewOpen &&
      <WorkflowActionPreviewModal
        workflowId={policyId}
        actionData={{
          ...formInstance.getFieldsValue(),
          actionType
        }}
        onClose={() => setIsPreviewOpen(false)}
      />
    }
  </>)
}
