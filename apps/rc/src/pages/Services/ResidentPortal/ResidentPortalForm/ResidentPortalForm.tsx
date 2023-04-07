import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateDpskMutation, useGetDpskQuery, useUpdateDpskMutation } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation,
  DpskSaveData,
  DeviceNumberType
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

interface ResidentPortalFormProps {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (result?: DpskSaveData) => void
}

export default function ResidentPortalForm (props: ResidentPortalFormProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const linkToServices = useTenantLink(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))
  const params = useParams()
  const { editMode = false, modalMode = false, modalCallBack } = props

//   const [ createDpsk ] = useCreateDpskMutation()
//   const [ updateDpsk ] = useUpdateDpskMutation()
//   const {
//     data: dataFromServer,
//     isLoading,
//     isFetching
//   } = useGetDpskQuery({ params }, { skip: !editMode })
//   const formRef = useRef<StepsFormInstance<CreateDpskFormFields>>()
//   const initialValues: Partial<CreateDpskFormFields> = {
//     passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
//     passphraseLength: 18,
//     deviceNumberType: DeviceNumberType.UNLIMITED
//   }
    // TODO: these are just for stubbing the page -- remove them
    const isLoading = true
    const isFetching = true

//   useEffect(() => {
//     if (dataFromServer && editMode) {
//       formRef.current?.setFieldsValue(transferSaveDataToFormFields(dataFromServer))
//     }
//   }, [dataFromServer, editMode])

//   const saveData = async (data: CreateDpskFormFields) => {
//     const dpskSaveData = transferFormFieldsToSaveData(data)
//     let result: DpskSaveData

//     try {
//       if (editMode) {
//         result = await updateDpsk({ params, payload: _.omit(dpskSaveData, 'id') }).unwrap()
//       } else {
//         result = await createDpsk({ payload: dpskSaveData }).unwrap()
//       }

//       modalMode ? modalCallBack?.(result) : navigate(linkToServices, { replace: true })
//     } catch (error) {
//       console.log(error) // eslint-disable-line no-console
//     }
//   }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
            // TODO: verify labels with Mockups
          ? $t({ defaultMessage: 'Edit Resident Portal' })
          : $t({ defaultMessage: 'Add Resident Portal' })
        }
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST })
          }
        ]}
      />}
      <Loader states={[{ isLoading, isFetching }]}>
        {/* <StepsForm<CreateDpskFormFields>
          formRef={formRef}
          onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToServices)}
          onFinish={saveData}
        >
          <StepsForm.StepForm<CreateDpskFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={modalMode ? false : true}
          >
            <DpskSettingsForm />
          </StepsForm.StepForm>
        </StepsForm> */}
      </Loader>
    </>
  )
}
