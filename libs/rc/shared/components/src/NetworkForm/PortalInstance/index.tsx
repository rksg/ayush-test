import { useContext, useEffect, useState } from 'react'

import { Form, Select }      from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'
import { useParams }         from 'react-router-dom'

import { GridCol, GridRow, StepsFormLegacy } from '@acx-ui/components'
import { baseUrlFor }                        from '@acx-ui/config'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useGetPortalLangMutation,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedPortalTemplateListQuery,
  useLazyGetPortalQuery,
  useLazyGetPortalTemplateQuery
} from '@acx-ui/rc/services'
import {
  Demo,
  Portal,
  PortalDetail,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { getImageDownloadUrl } from '@acx-ui/utils'

import { PortalDemo }        from '../../services/PortalDemo'
import { initialPortalData } from '../../services/PortalForm'
import NetworkFormContext    from '../NetworkFormContext'

import PortalServiceModal from './PortalServiceModal'

const Photo = baseUrlFor('/assets/images/portal/PortalPhoto.jpg')
const Powered = baseUrlFor('/assets/images/portal/PoweredLogo.png')
const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

type ImagePortalData = {
  poweredImg: string,
  photo: string,
  logo: string,
  bgImage: string
}

const PortalInstance = (props: {
  updatePortalData?: (value: Demo) => void;
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const [getPortal] = useLazyGetPortalQuery()
  const [getPortalTemplate] = useLazyGetPortalTemplateQuery()
  const [getPortalLang] = useGetPortalLangMutation()
  const form = Form.useFormInstance()
  const networkData = useContext(NetworkFormContext).data
  const socialIdentities = networkData?.guestPortal?.socialIdentities
  const socials = {
    facebookEnabled: false,
    googleEnabled: false,
    twitterEnabled: false,
    linkedInEnabled: false,
    smsEnabled: false,
    whatsappEnabled: false,
    emailEnabled: false
  }
  if (networkData?.guestPortal?.enableSmsLogin) {
    socials.smsEnabled = true
  }
  if (networkData?.guestPortal?.enableWhatsappLogin) {
    socials.whatsappEnabled = true
  }
  if (networkData?.guestPortal?.enableEmailLogin) {
    socials.emailEnabled = true
  }
  if (socialIdentities) {
    socials.facebookEnabled = socialIdentities.facebook ? true : false
    socials.googleEnabled = socialIdentities.google ? true : false
    socials.twitterEnabled = socialIdentities.twitter ? true : false
    socials.linkedInEnabled = socialIdentities.linkedin ? true : false
  }
  const portalServiceID = Form.useWatch('portalServiceProfileId')
  const defaultPayload = {
    fields: ['id', 'name'],
    filters: {},
    pageSize: 256
  }
  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<Portal|PortalDetail>>({
    useQueryFn: useGetEnhancedPortalProfileListQuery,
    useTemplateQueryFn: useGetEnhancedPortalTemplateListQuery,
    payload: { ...defaultPayload },
    enableRbac: (isEnabledRbacService || isUseWifiRbacApi)
  })

  const [demoValue, setDemoValue] = useState({} as Demo)
  const [portalList, setPortalList] = useState<DefaultOptionType[]>([])
  const [portalData, setPortalData] = useState<Portal[]>([])
  const [portalLang, setPortalLang] = useState({} as { [key: string]: string })

  const getPortalContent = async (serviceId: string, isEnabledRbac: boolean
  ) => (await getPortal({
    params: { serviceId },
    enableRbac: isEnabledRbac })
    .unwrap())?.content as Demo

  const getTemplateContent = async (serviceId: string) =>
  (await getPortalTemplate({
    params: { serviceId },
    enableRbac: isEnabledRbacService })
    .unwrap())?.content as Demo

  const getCurrentPortalContent = async (isTemplateMode: boolean,
    serviceId: string,
    isEnabledRbac: boolean) => {
    return await (isTemplateMode ?
      getTemplateContent(serviceId) :
      getPortalContent(serviceId, isEnabledRbac))
  }

  const getImageUrl = async (content: string) => {
    return await getImageDownloadUrl(isEnabledRbacService, content)
  }

  const bindImageUrl = async (demoData: Demo):Promise<ImagePortalData> => {
    return {
      poweredImg: demoData.poweredImg
        ? await getImageUrl(demoData.poweredImg)
        : Powered,
      logo: demoData.logo
        ? await getImageUrl(demoData.logo)
        : Logo,
      photo: demoData.photo
        ? await getImageUrl(demoData.photo)
        : Photo,
      bgImage: demoData.bgImage
        ? await getImageUrl(demoData.bgImage)
        : ''
    }
  }

  const setPortal = async (value: string, isEnabledRbac:boolean) => {
    const content = await getCurrentPortalContent(isTemplate, value, isEnabledRbac)
    const imagePortalData = await bindImageUrl(content)
    const tempValue = {
      ...initialPortalData.content,
      ...content,
      ...imagePortalData,
      wifi4EUNetworkId: content?.wifi4EUNetworkId || ''
    }
    setDemoValue(tempValue)
    props.updatePortalData?.(tempValue)
  }

  useEffect(() => {
    const fetchData = async (response: TableResult<Portal|PortalDetail>) => {
      setPortalData([...(response.data as Portal[])])
      setPortalList(
        response?.data?.map((m) => ({ label: m.serviceName ?? m.name, value: m.id }))
      )
    }
    if (data?.data) {
      fetchData(data)
    }
  }, [data])

  useEffect(() => {
    const fetchDemoContent = async (portalServiceProfileId: string) => {
      const content = await getCurrentPortalContent(
        isTemplate,
        portalServiceProfileId,
        isEnabledRbacService)
      const imagePortalData = await bindImageUrl(content)
      const tempValue = {
        ...initialPortalData.content,
        ...content,
        ...imagePortalData,
        wifi4EUNetworkId: content?.wifi4EUNetworkId || ''
      }
      setDemoValue(tempValue)
    }
    if (networkData?.portalServiceProfileId &&
      networkData?.portalServiceProfileId !== portalServiceID) {
      form.setFieldValue(
        'portalServiceProfileId',
        networkData.portalServiceProfileId
      )
      fetchDemoContent(networkData.portalServiceProfileId)
    }
  }, [networkData?.portalServiceProfileId])


  useEffect(() => {
    if (demoValue.displayLangCode) {
      getPortalLang({
        params: { ...params, messageName: demoValue.displayLangCode + '.json' }
      }).unwrap()
        .then((res) => {
          setPortalLang(res)
        })
    }
  }, [demoValue])

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsFormLegacy.Title>
            {$t({ defaultMessage: 'Portal Web Page' })}
          </StepsFormLegacy.Title>
          <Form.Item
            label={$t({
              defaultMessage: 'Define the captive portal web page.'
            })}
          />
          <Form.Item
            name='portalServiceProfileId'
            label={$t({ defaultMessage: 'Guest Portal Service' })}
            rules={[{ required: true }]}
            initialValue={''}
            children={
              <Select
                options={[
                  { label: $t({ defaultMessage: 'Select Portal' }), value: '' },
                  ...portalList
                ]}
                onChange={(v) => {
                  if(v) {
                    setPortal(v, isEnabledRbacService)
                  }
                }}
              />
            }
          />
          <Form.Item>
            <PortalServiceModal
              updateInstance={async (data) => {
                portalData.push({ ...data, id: data.id })
                portalList.push({
                  label: data.serviceName ?? data.name,
                  value: data.id
                })
                setPortalList([...portalList])
                setPortalData([...portalData])
                form.setFieldValue('portalServiceProfileId', data.id)
                const demoData = data.content as Demo
                props.updatePortalData?.(demoData)
                const imagePortalData = await bindImageUrl(demoData)
                setDemoValue({
                  ...demoData,
                  ...imagePortalData
                })
              }}
              portalCount={portalData.length}
            />
          </Form.Item>
        </GridCol>
      </GridRow>
      {portalServiceID && demoValue.componentDisplay && (
        <GridRow style={{ height: 648, paddingBottom: 40 }}>
          <PortalDemo
            value={demoValue}
            isPreview={true}
            fromNetwork={true}
            networkViewType={networkData?.guestPortal?.guestNetworkType}
            networkSocial={socials}
            viewPortalLang={portalLang}
          />
        </GridRow>
      )}
    </>
  )
}

export default PortalInstance
