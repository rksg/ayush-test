import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { useAddResidentPortalMutation,
  useGetResidentPortalQuery,
  useUpdateResidentPortalMutation } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  getServiceListRoutePath
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CreateResidentPortalFormFields,
  transferFormFieldsToSaveData,
  transferSaveDataToFormFields } from './formParsing'
import ResidentPortalSettingsForm from './ResidentPortalSettingsForm'

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

  const formRef = useRef<StepsFormLegacyInstance<CreateResidentPortalFormFields>>()

  const initialValues: Partial<CreateResidentPortalFormFields> = {
    textTitle: $t({ defaultMessage: 'Resident Portal' }),
    textLogin: $t({ defaultMessage: 'Welcome to Your Portal' })
  }

  useEffect(() => {
    if (originalPortalData && editMode) {
      formRef.current?.setFieldsValue(transferSaveDataToFormFields(originalPortalData))
    }
  }, [originalPortalData, editMode])

  const saveData = async (data: CreateResidentPortalFormFields) => {

    const residentPortalSaveData = transferFormFieldsToSaveData(data)

    try {
      const portalConfiguration =
        new Blob([JSON.stringify(residentPortalSaveData)], { type: 'application/json' })
      const formData = new FormData()

      if (editMode) {
        formData.append('changes', portalConfiguration, '')
        await updateResidentPortal({ params, payload: formData }).unwrap()
      } else {
        formData.append('portal', portalConfiguration, '')
        await addResidentPortal({ payload: formData }).unwrap()
      }

      navigate(linkToServices, { replace: true })
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
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: getServiceRoutePath(
              { type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST })
          }
        ]}
      />
      <Loader states={[{ isLoading, isFetching }]}>
        <StepsFormLegacy<CreateResidentPortalFormFields>
          formRef={formRef}
          onCancel={() => navigate(linkToServices)}
          onFinish={saveData}
        >
          <StepsFormLegacy.StepForm<CreateResidentPortalFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={true}
          >
            <ResidentPortalSettingsForm />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
