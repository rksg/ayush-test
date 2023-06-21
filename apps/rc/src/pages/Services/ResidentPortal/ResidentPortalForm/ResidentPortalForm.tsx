import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useAddResidentPortalMutation,
  useDeleteResidentPortalFaviconMutation,
  useDeleteResidentPortalLogoMutation,
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

import { loadResidentPortalFavIcon, loadResidentPortalLogo } from '../portalImageService'

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
  const tablePath = getServiceRoutePath({
    type: ServiceType.RESIDENT_PORTAL,
    oper: ServiceOperation.LIST
  })
  const linkToServices = useTenantLink(tablePath)
  const params = useParams()
  const { editMode = false } = props
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [ addResidentPortal ] = useAddResidentPortalMutation()
  const [ updateResidentPortal ] = useUpdateResidentPortalMutation()
  const [ deleteLogo ] = useDeleteResidentPortalLogoMutation()
  const [ deleteFavicon ] = useDeleteResidentPortalFaviconMutation()

  const {
    data: originalPortalData,
    isLoading,
    isFetching
  } = useGetResidentPortalQuery({ params }, { skip: !editMode })

  const formRef = useRef<StepsFormLegacyInstance<CreateResidentPortalFormFields>>()

  const initialValues: Partial<CreateResidentPortalFormFields> = {
    textTitle: $t({ defaultMessage: 'Resident Portal' }),
    textLogin: $t({ defaultMessage: 'Welcome to Your Portal' }),
    tenantSetDpsk: false
  }

  const [areImagesLoading, setImagesLoading] = useState<boolean>(true)
  const [logoImage, setLogoImageString] = useState<string>('')
  const [favIconImage, setFavIconImageString] = useState<string>('')

  useEffect(() => {
    // Only set form values once the images are loaded - otherwise the form component won't be
    // ready for the values yet.
    if (originalPortalData && !areImagesLoading && editMode) {
      formRef.current?.setFieldsValue(transferSaveDataToFormFields(originalPortalData))
    }
  }, [originalPortalData, areImagesLoading, editMode])

  // Load Logo and FavIcon
  useEffect(() => {
    const fetchLogo = async () => {
      if(!logoImage) {
        await loadResidentPortalLogo(params)
          .then((base64String) => {
            if(base64String && base64String !== 'data:') {
              setLogoImageString(base64String)
            }})
          .catch(() => { setLogoImageString('') })
      }
      if(!favIconImage) {
        await loadResidentPortalFavIcon(params)
          .then((base64String) => {
            if(base64String && base64String !== 'data:') {
              setFavIconImageString(base64String)
            }})
          .catch(() => { setFavIconImageString('') })
      }
    }

    if(editMode) {
      setImagesLoading(true)
      fetchLogo().finally(() => {
        setImagesLoading(false)
      })
    } else {
      setImagesLoading(false)
    }
  }, [editMode, params])

  // Save Form Data //
  const saveData = async (data: CreateResidentPortalFormFields) => {

    const residentPortalSaveData = transferFormFieldsToSaveData(data)

    try {
      const portalConfiguration =
        new Blob([JSON.stringify(residentPortalSaveData)], { type: 'application/json' })
      const formData = new FormData()

      if (editMode) {
        formData.append('changes', portalConfiguration, '')
        if(data.fileLogo?.isRemoved){
          await deleteLogo({ params }).unwrap()
        } else if(data.fileLogo?.file) {
          formData.append('logo', data.fileLogo.file)
        }

        if(data.fileFavicon?.isRemoved){
          await deleteFavicon({ params }).unwrap()
        } else if(data.fileFavicon?.file) {
          formData.append('favIcon', data.fileFavicon.file)
        }
        await updateResidentPortal({ params, payload: formData }).unwrap()
      } else {
        formData.append('portal', portalConfiguration, '')

        if(data.fileLogo?.file) {
          formData.append('logo', data.fileLogo.file)
        }
        if(data.fileFavicon?.file) {
          formData.append('favIcon', data.fileFavicon.file)
        }
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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: tablePath
          }
        ] : [
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: tablePath
          }
        ]}
      />
      <Loader states={[{ isLoading: (isLoading || areImagesLoading), isFetching }]}>
        <StepsFormLegacy<CreateResidentPortalFormFields>
          formRef={formRef}
          onCancel={() => navigate(linkToServices)}
          onFinish={saveData}>
          <StepsFormLegacy.StepForm<CreateResidentPortalFormFields>
            name='details'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialValues}
            preserve={true}>
            <ResidentPortalSettingsForm
              existingLogo={{
                fileSrc: logoImage,
                filename: originalPortalData?.uiConfiguration?.files?.logoFileName }}
              existingFavicon={{
                fileSrc: favIconImage,
                filename: originalPortalData?.uiConfiguration?.files?.favIconFileName }} />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
