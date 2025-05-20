/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { RcFile }  from 'antd/lib/upload'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { baseUrlFor }                   from '@acx-ui/config'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useGetPortalQuery,
  useGetPortalTemplateQuery,
  useCreatePortalMutation,
  useCreatePortalTemplateMutation,
  useUpdatePortalMutation,
  useUpdatePortalTemplateMutation,
  useUploadURLMutation,
  useUploadBgImageMutation,
  useUploadLogoMutation,
  useUploadPhotoMutation,
  useUploadPoweredImgMutation,
  useUploadBgImageTemplateMutation,
  useUploadLogoTemplateMutation,
  useUploadPhotoTemplateMutation,
  useUploadPoweredImgTemplateMutation
} from '@acx-ui/rc/services'
import {
  defaultAlternativeLang,
  defaultComDisplay,
  Portal,
  ServiceOperation,
  ServiceType,
  useServiceListBreadcrumb,
  useServicePageHeaderTitle,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  useServicePreviousPath,
  Demo,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { getImageDownloadUrl } from '@acx-ui/utils'

import { PortalDemoDefaultSize, getImageBase64 } from '../PortalDemo/commonUtils'

import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'

const Photo = baseUrlFor('/assets/images/portal/PortalPhoto.jpg')
const Powered = baseUrlFor('/assets/images/portal/PoweredLogo.png')
const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

export const initialPortalData: Portal = {
  network: [],
  content: {
    bgColor: '#FFFFFF',
    bgImage: '',
    welcomeText: undefined,
    welcomeColor: '#333333',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: undefined,
    secondaryColor: '#333333',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: '#EC7100',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: defaultComDisplay,
    displayLangCode: 'en',
    alternativeLang: defaultAlternativeLang,
    alternativeLangCode: []
  }
}

export const PortalForm = (props: {
  editMode?: boolean;
  networkView?: boolean;
  backToNetwork?: (value?: Portal) => void;
}) => {
  const { networkView, backToNetwork } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.PORTAL, ServiceOperation.LIST)
  const routeToList = useTenantLink(getServiceRoutePath({
    type: ServiceType.PORTAL,
    oper: ServiceOperation.LIST
  }))
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const editMode = props.editMode && !networkView
  const [portalData, setPortalData] = useState<Portal>(initialPortalData)
  const [currentLang, setCurrentLang] = useState(
    {} as { [key: string]: string }
  )
  const formRef = useRef<StepsFormLegacyInstance<Portal>>()
  const [uploadURL] = useUploadURLMutation()
  const [uploadBgImage] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUploadBgImageMutation,
    useTemplateMutationFn: useUploadBgImageTemplateMutation
  })
  const [uploadLogo] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUploadLogoMutation,
    useTemplateMutationFn: useUploadLogoTemplateMutation
  })
  const [uploadPhoto] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUploadPhotoMutation,
    useTemplateMutationFn: useUploadPhotoTemplateMutation
  })
  const [uploadPoweredImg] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUploadPoweredImgMutation,
    useTemplateMutationFn: useUploadPoweredImgTemplateMutation
  })
  const { data, isLoading, isFetching } = useConfigTemplateQueryFnSwitcher<Portal>({
    useQueryFn: useGetPortalQuery,
    useTemplateQueryFn: useGetPortalTemplateQuery,
    skip: !editMode,
    enableRbac: isEnabledRbacService
  })
  const [ createPortal ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useCreatePortalMutation,
    useTemplateMutationFn: useCreatePortalTemplateMutation
  })
  const [ updatePortal ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdatePortalMutation,
    useTemplateMutationFn: useUpdatePortalTemplateMutation
  })

  const breadcrumb = useServiceListBreadcrumb(ServiceType.PORTAL)
  const pageTitle = useServicePageHeaderTitle(!!editMode, ServiceType.PORTAL)

  const getImageUrl = async (data: string) => {
    return await getImageDownloadUrl(isEnabledRbacService, data)
  }

  const updateFileId = async (file: RcFile) => {
    let fileId = ''
    await uploadURL({
      params,
      payload: { fileExtension: file.name.split('.')[1] }
    })
      .unwrap()
      .then(async (res) => {
        await fetch(res.signedUrl, {
          method: 'put',
          body: file,
          headers: {
            'Content-Type': ''
          }
        }).then(() => {
          fileId = res.fileId
        })
      })
    return fileId
  }

  const uploadFile = async (data: Portal, serviceId?:string) => {
    try {
      const currentParams = { ...params, serviceId: params.serviceId || serviceId }
      if (data.bgFile) {
        await uploadBgImage({ params: currentParams, payload: { image: await getImageBase64(data.bgFile) } }).unwrap()
      }
      if (data.logoFile) {
        await uploadLogo({ params: currentParams, payload: { image: await getImageBase64(data.logoFile) } }).unwrap()
      }
      if (data.photoFile) {
        await uploadPhoto({ params: currentParams, payload: { image: await getImageBase64(data.photoFile) } }).unwrap()
      }
      if (data.poweredFile) {
        await uploadPoweredImg({ params: currentParams, payload: { image: await getImageBase64(data.poweredFile) } }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      throw error
    }
  }

  const handleAddPortalService = async (data: Portal) => {
    try {

      const imageContent = isEnabledRbacService ? {
        logo: '', photo: '', poweredImg: '', bgImage: ''
      } : {
        logo:
        data?.content?.logo &&
        data?.content?.logo.indexOf('https://storage') >= 0
          ? data?.content?.logo?.split('/')[6].split('?')[0]
          : '',
        photo:
        data?.content?.photo &&
        data?.content?.photo.indexOf('https://storage') >= 0
          ? data?.content?.photo?.split('/')[6].split('?')[0]
          : '',
        poweredImg:
        data?.content?.poweredImg &&
        data?.content?.poweredImg.indexOf('https://storage') >= 0
          ? data?.content?.poweredImg?.split('/')[6].split('?')[0]
          : '',
        bgImage:
        data?.content?.bgImage &&
        data?.content?.bgImage.indexOf('https://storage') >= 0
          ? data?.content?.bgImage?.split('/')[6].split('?')[0]
          : ''
      }
      const serviceName = data.name ?? data.serviceName
      const nameData = (isEnabledRbacService || isTemplate) ?
        { name: serviceName } : { serviceName }
      const payload = {
        ...nameData,
        content: {
          ...data.content,
          ...imageContent
        }
      }

      if (!isEnabledRbacService) {
        if (portalData.bgFile) {
          payload.content.bgImage = await updateFileId(portalData.bgFile)
        }
        if (portalData.logoFile) {
          payload.content.logo = await updateFileId(portalData.logoFile)
        }
        if (portalData.photoFile) {
          payload.content.photo = await updateFileId(portalData.photoFile)
        }
        if (portalData.poweredFile) {
          payload.content.poweredImg = await updateFileId(portalData.poweredFile)
        }
      } else if (editMode){
        await uploadFile(portalData)
      }

      if (editMode) {
        await updatePortal({
          params: { tenantId: params.tenantId, serviceId: params.serviceId },
          payload,
          enableRbac: isEnabledRbacService
        }).unwrap()

        if (backToNetwork) {
          // const newContent = await getRefreshImageUrl(params.serviceId || '', payload.content as Demo)
          data.content = { ...payload.content } as Demo
        }
      } else {
        try {
          const result = await createPortal({
            params: { tenantId: params.tenantId },
            payload,
            enableRbac: isEnabledRbacService
          }).unwrap() as { response: { id: string } }
          // upload files
          if (isEnabledRbacService) {
            await uploadFile(portalData, result.response?.id)
          }

          data.id = result.response?.id
          data.content = payload.content as Demo

        } catch (error){
          console.log('[Create Portal Service Porfile Error]', error) // eslint-disable-line no-console
        }
      }
      networkView
        ? backToNetwork?.(data)
        : navigate(routeToList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const updateSaveData = (saveData: Partial<Portal>) => {
    setPortalData({ ...portalData, ...saveData })
  }

  useEffect(() => {
    const fetchData = async (data: Portal) => {
      const formatData = {
        ...data,
        content: {
          ...data.content,
          logo: data.content?.logo
            ? await getImageUrl(data.content.logo)
            : Logo,
          photo: data.content?.photo
            ? await getImageUrl(data.content.photo)
            : Photo,
          poweredImg: data.content?.poweredImg
            ? await getImageUrl(data.content.poweredImg)
            : Powered,
          bgImage: data.content?.bgImage
            ? await getImageUrl(data.content.bgImage)
            : ''
        }
      } as Portal
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(formatData)
      updateSaveData(formatData)
    }
    if (data) {
      fetchData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <>
      {!networkView && (
        <PageHeader
          title={pageTitle}
          breadcrumb={breadcrumb}
        />
      )}
      <PortalFormContext.Provider
        value={{
          editMode,
          portalData,
          setPortalData,
          currentLang,
          setCurrentLang
        }}
      >
        <Loader states={[{ isLoading, isFetching }]}>
          <StepsFormLegacy<Portal>
            formRef={formRef}
            editMode={editMode}
            onCancel={() =>
              networkView ? backToNetwork?.() : navigate(previousPath)
            }
            onFinish={async (data) => {
              const currentContent = (data.content ?? initialPortalData.content) as Demo
              if (
                (currentContent.componentDisplay.wifi4eu &&
                !currentContent.wifi4EUNetworkId?.trim()) ||
              (currentContent.componentDisplay.termsConditions &&
                !currentContent.termsCondition?.trim())
              ) {
                return false
              }
              if (currentContent.welcomeText === undefined) {
                currentContent.welcomeText = currentLang.welcomeText
              }
              if (currentContent.secondaryText === undefined) {
                currentContent.secondaryText = currentLang.secondaryText
              }
              return handleAddPortalService(data)
            }}
          >
            <StepsFormLegacy.StepForm
              name='settings'
              title={$t({ defaultMessage: 'Settings' })}
              initialValues={initialPortalData}
            >
              <PortalSettingForm
                resetDemoField={() => {
                  formRef.current?.setFieldsValue({
                    content: { ...(portalData.content as Demo) }
                  })
                }}
              />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </Loader>
      </PortalFormContext.Provider>
    </>
  )
}

export default PortalForm
