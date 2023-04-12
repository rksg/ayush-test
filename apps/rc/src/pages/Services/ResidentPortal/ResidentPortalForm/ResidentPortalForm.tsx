import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddResidentPortalMutation, useGetResidentPortalQuery, useUpdateResidentPortalMutation } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  ResidentPortal
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import ResidentPortalSettingsForm from './ResidentPortalSettingsForm'
import { CreateResidentPortalFormFields, transferFormFieldsToSaveData, transferSaveDataToFormFields } from './formParsing'

interface ResidentPortalFormProps {
  editMode?: boolean
}

export default function ResidentPortalForm (props: ResidentPortalFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink(
    getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST }))
  const params = useParams()
  const { editMode = false } = props

  const [ addResidentPortal ] = useAddResidentPortalMutation()
  const [ updateResidentPortal ] = useUpdateResidentPortalMutation()

  const {
    data: originalPortalData,
    isLoading,
    isFetching
  } = useGetResidentPortalQuery({ params }, { skip: !editMode })

  const formRef = useRef<StepsFormInstance<CreateResidentPortalFormFields>>()

  const initialValues: Partial<CreateResidentPortalFormFields> = {
    textTitle: $t({defaultMessage: 'Resident Portal'}),
    textLogin: $t({defaultMessage: 'Welcome to Your Portal'})
  }

  useEffect(() => {
    if (originalPortalData && editMode) {
      formRef.current?.setFieldsValue(transferSaveDataToFormFields(originalPortalData))
    }
  }, [originalPortalData, editMode])

  const saveData = async (data: CreateResidentPortalFormFields) => {
    
    const residentPortalSaveData = transferFormFieldsToSaveData(data)

    let result: ResidentPortal

    try {

      const portalConfiguration = new Blob([JSON.stringify(residentPortalSaveData)], {type: 'application/json'})
      const formData = new FormData()

      if (editMode) {        
        formData.append('changes', portalConfiguration, '')
        result = await updateResidentPortal({ params, payload: formData}).unwrap()
      } else {
        formData.append('portal', portalConfiguration, '')
        result = await addResidentPortal({ payload: formData }).unwrap()
      }

      navigate(linkToServices, {replace: true})
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Resident Portal' })
          : $t({ defaultMessage: 'Add Resident Portal' })
        }
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST })
          }
        ]}
      />
      <Loader states={[{ isLoading, isFetching }]}>
        <StepsForm<CreateResidentPortalFormFields>
          formRef={formRef}
          onCancel={() => navigate(linkToServices)}
          onFinish={saveData}
        >
          <StepsForm.StepForm<CreateResidentPortalFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={true}
          >
            <ResidentPortalSettingsForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}
