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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetPortalQuery,
  useLazyGetPortalQuery,
  useGetPortalTemplateQuery,
  useLazyGetPortalTemplateQuery,
  useCreatePortalMutation,
  useCreatePortalTemplateMutation,
  useUpdatePortalMutation,
  useUpdatePortalTemplateMutation,
  useUploadURLMutation,
  useUploadBgImageMutation,
  useUploadLogoMutation,
  useUploadPhotoMutation,
  useUploadPoweredImgMutation
} from '@acx-ui/rc/services'
import {
  defaultAlternativeLang,
  defaultComDisplay,
  Portal,
  ServiceOperation,
  ServiceType,
  useServiceListBreadcrumb,
  useServicePageHeaderTitle,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplateLazyQueryFnSwitcher,
  useServicePreviousPath,
  PortalSaveData,
  Demo
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import { getImageDownloadUrl } from '@acx-ui/utils'

import { PortalDemoDefaultSize, getImageBase64 } from '../PortalDemo/commonUtils'

import Photo             from './assets/images/portal-demo/PortalPhoto.svg'
import Powered           from './assets/images/portal-demo/PoweredLogo.svg'
import Logo              from './assets/images/portal-demo/RuckusCloud.svg'
import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'

export const initialPortalData: Portal = {
  name: '',
  serviceName: '',
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
  const params = useParams()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const editMode = props.editMode && !networkView
  const [portalData, setPortalData] = useState<Portal>(initialPortalData)
  const [currentLang, setCurrentLang] = useState(
    {} as { [key: string]: string }
  )
  const formRef = useRef<StepsFormLegacyInstance<Portal>>()
  const [uploadURL] = useUploadURLMutation()
  const [uploadBgImage] = useUploadBgImageMutation()
  const [uploadLogo] = useUploadLogoMutation()
  const [uploadPhoto] = useUploadPhotoMutation()
  const [uploadPoweredImg] = useUploadPoweredImgMutation()
  const { data, isLoading, isFetching } = useConfigTemplateQueryFnSwitcher<Portal>({
    useQueryFn: useGetPortalQuery,
    useTemplateQueryFn: useGetPortalTemplateQuery,
    skip: !editMode,
    payload: { enableRbac: isEnabledRbacService },
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
  const [ getPortal ]= useConfigTemplateLazyQueryFnSwitcher<Portal>({
    useLazyQueryFn: useLazyGetPortalQuery,
    useLazyTemplateQueryFn: useLazyGetPortalTemplateQuery
  })

  const breadcrumb = useServiceListBreadcrumb(ServiceType.PORTAL)
  const pageTitle = useServicePageHeaderTitle(!!editMode, ServiceType.PORTAL)

  const getImageUrl = async (data: string) => {
    return getImageDownloadUrl(isEnabledRbacService, data)
  }

  const getRefreshImageUrl = async (serviceId:string, content:Demo) => {
    // refetch file image url
    const newProfileData = await getPortal({
      params: { serviceId },
      payload: { enableRbac: isEnabledRbacService }
    }).unwrap()

    return { ...content,
      logo: newProfileData.content?.logo,
      photo: newProfileData.content?.photo,
      poweredImg: newProfileData.content?.poweredImg,
      bgImage: newProfileData.content?.bgImage
    } as Demo
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

  const uploadFile = async (data: Portal) => {
    if (data.bgFile) {
      await uploadBgImage({ params, payload: { image: await getImageBase64(data.bgFile) } })
    }
    if (data.logoFile) {
      await uploadLogo({ params, payload: { image: await getImageBase64(data.logoFile) } })
    }
    if (data.photoFile) {
      await uploadPhoto({ params, payload: { image: await getImageBase64(data.photoFile) } })
    }
    if (data.poweredFile) {
      await uploadPoweredImg({ params, payload: { image: await getImageBase64(data.poweredFile) } })
    }
  }

  const handleAddPortalService = async (data: Portal) => {
    try {

      const imageContent = isEnabledRbacService ? {} : {
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
      const payload = {
        name: data.name ?? data.serviceName,
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
          payload: { ...payload, enableRbac: isEnabledRbacService }
        }).unwrap()

        if (backToNetwork) {
          const newContent = await getRefreshImageUrl(params.serviceId || '', payload.content as Demo)
          data.content = { ...newContent }
        }
      } else {
        try {
          const result = await createPortal({
            params: { tenantId: params.tenantId },
            payload: { ...payload, enableRbac: isEnabledRbacService }
          }).unwrap() as { response: { id: string } }
          // upload files
          if (isEnabledRbacService) {
            await uploadFile(data)
            // refetch file image url
            const serviceId = result.response?.id
            if (backToNetwork) {
              const newContent = await getRefreshImageUrl(serviceId, payload.content as Demo)
              payload.content = { ...newContent }
            }
          }

          data.id = result.response?.id
          data.content = payload.content as Demo

        } catch (error){
          console.log('[Create Portal Service Porfile Error]', error) // eslint-disable-line no-console
        }
      }
      networkView
        ? backToNetwork?.(data)
        : navigate(previousPath, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const updateSaveData = (saveData: Partial<Portal>) => {
    setPortalData({ ...portalData, ...saveData })
  }

  useEffect(() => {
    const fetchData = async (data: Portal|PortalSaveData) => {
      const formatData = {
        ...data,
        serviceName: data.name ?? data.serviceName,
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
