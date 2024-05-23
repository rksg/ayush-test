import { Form }      from 'antd'
import { RcFile }    from 'antd/lib/upload'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, StepsForm } from '@acx-ui/components'
import {
  useCreateActionMutation,
  useGetActionByIdQuery,
  usePatchActionMutation,
  useUploadURLMutation
} from '@acx-ui/rc/services'
import { ActionDefaultValueMap, ActionType, GenericActionData } from '@acx-ui/rc/utils'


import { AupSettings }          from './AupSettings'
import { DataPromptActionForm } from './DataPromptActionForm'


const actionFormMap = {
  [ActionType.AUP]: AupSettings,
  // [ActionType.SPLIT]: SplitOptionSettingForm,
  [ActionType.USER_SELECTION_SPLIT]: () => <></>,
  [ActionType.DATA_PROMPT]: DataPromptActionForm,
  [ActionType.DPSK]: () => <></>,
  [ActionType.DISPLAY_MESSAGE]: () => <></>
}

export interface ActionGenericFormProps {
  actionType: ActionType,
  actionId?: string,
  isEdit?: boolean,
  modalCallback?: () => void
}

export default function ActionGenericForm (props: ActionGenericFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { actionType, modalCallback, actionId, isEdit } = props
  const [form] = Form.useForm()
  const ActionSettingsForm = actionFormMap[actionType]

  const [ createAction ] = useCreateActionMutation()
  const [ patchAction ] = usePatchActionMutation()
  const [ getUploadURL ] = useUploadURLMutation()

  const { data, isLoading } = useGetActionByIdQuery(
    { params: { actionId } },
    { skip: !isEdit || !actionId }
  )

  const defaultValue = Object.entries(ActionDefaultValueMap[actionType])
    .reduce((acc: Record<string, string | boolean>, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'boolean') {
        acc[key] = value
      } else {
        acc[key] = $t(value)
      }
      return acc
    }, {})

  const handleCreateAction = async (formData: GenericActionData) => {
    await processUploadFile(formData)

    return createAction({ payload: {
      ...formData,
      actionType
    } }).unwrap()
  }

  const findDiff = (originalObject: GenericActionData, updatedObject: GenericActionData) => {
    console.log('Original = ', originalObject)
    console.log('Updated = ', updatedObject)
    const differences: Partial<Record<keyof GenericActionData, object>> = {}

    Object.keys(updatedObject).forEach((key) => {
      const typedKey = key as keyof GenericActionData
      if (originalObject[typedKey] !== updatedObject[typedKey]) {
        Object.assign(differences, { [typedKey]: updatedObject[typedKey] })
      }
    })

    return { ...differences, _links: undefined }
  }

  const handleUpdateAction = async (formData: GenericActionData) => {
    const patchData = findDiff(data!, formData)
    console.log('diff', patchData)

    await processUploadFile(patchData as unknown as GenericActionData)

    if (Object.values(patchData).every((value) => value === undefined)) return

    return patchAction({ params: { actionId }, payload: { ...patchData } }).unwrap()
  }

  const processUploadFile = async (formData: GenericActionData) => {
    const fileFieldKeys = ['aupFileLocation'] as const

    for (const fieldKey of fileFieldKeys) {
      if (formData[fieldKey] !== undefined) {
        try {
          const file: RcFile = formData[fieldKey]!
          console.log('Process File :: ', file)
          const uploadResource = await getUploadUrl(file)

          console.log('Upload id = ', uploadResource.fileId)
          console.log('Upload url = ', uploadResource.signedUrl)

          await handleUploadFile(file, uploadResource.signedUrl)
          Object.assign(formData, { [fieldKey]: uploadResource.fileId })
        } catch (e) {
          // FIXME: Toast error while uploading the file resource
        }
      }
    }
  }

  const getUploadUrl = async (file: RcFile) => {
    return await getUploadURL({
      params,
      payload: { fileExtension: file.name.split('.')[1] }
    }).unwrap()
  }

  const handleUploadFile = async (file: RcFile, url: string) => {
    return await fetch(url, { method: 'put', body: file, headers: { 'Content-Type': '' } })
      .then((res) => {
        console.log('then', res)
      })
      .catch((ex) => {
        console.log('catch', ex)
      })
  }

  const saveData = async (formData: GenericActionData) => {
    const result = isEdit
      ? await handleUpdateAction(formData)
      : await handleCreateAction(formData)

    modalCallback?.()
    console.log('Saving data = ', formData, ' and get result = ', result)
  }

  return (
    <Loader
      states={[{ isLoading }]}
    >
      <StepsForm<GenericActionData>
        preserve={false}
        form={form}
        initialValues={isEdit ? data : defaultValue}
        onFinish={saveData}
        onCancel={modalCallback}
        buttonLabel={{
          submit: isEdit
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
      >
        <StepsForm.StepForm>
          <ActionSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
