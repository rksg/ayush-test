import { useContext, useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { GridCol, GridRow, StepsFormLegacy } from '@acx-ui/components'
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
import Photo                 from '../assets/images/portal-demo/PortalPhoto.svg'
import Powered               from '../assets/images/portal-demo/PoweredLogo.svg'
import Logo                  from '../assets/images/portal-demo/RuckusCloud.svg'
import NetworkFormContext    from '../NetworkFormContext'

import PortalServiceModal from './PortalServiceModal'

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
  const { useWatch } = Form
  const { isTemplate } = useConfigTemplate()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
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
    smsEnabled: false
  }
  if (networkData?.guestPortal?.enableSmsLogin) {
    socials.smsEnabled = true
  }
  if (socialIdentities) {
    socials.facebookEnabled = socialIdentities.facebook ? true : false
    socials.googleEnabled = socialIdentities.google ? true : false
    socials.twitterEnabled = socialIdentities.twitter ? true : false
    socials.linkedInEnabled = socialIdentities.linkedin ? true : false
  }
  const portalServiceID = useWatch('portalServiceProfileId')
  const defaultPayload = {
    fields: ['id', 'name'],
    filters: {},
    pageSize: 256
  }
  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<Portal|PortalDetail>>({
    useQueryFn: useGetEnhancedPortalProfileListQuery,
    useTemplateQueryFn: useGetEnhancedPortalTemplateListQuery,
    payload: { ...defaultPayload, enableRbac: isEnabledRbacService },
    enableRbac: isEnabledRbacService
  })

  const [demoValue, setDemoValue] = useState({} as Demo)
  const portalServices =
    data?.data?.map((m) => ({ label: m.serviceName ?? m.name, value: m.id })) ?? []
  const [portalList, setPortalList] = useState(portalServices)
  const [portalData, setPortalData] = useState([] as Portal[])
  const [portalLang, setPortalLang] = useState({} as { [key: string]: string })

  const getPortalContent = async (serviceId: string,
    list: (Portal|PortalDetail)[], isEnabledRbac: boolean
  ) => (await getPortal({
    params: { serviceId },
    payload: { enableRbac: isEnabledRbac } })
    .unwrap())?.content as Demo

  const getTemplateContent = async (serviceId: string) =>
  (await getPortalTemplate({
    params: { serviceId },
    payload: { enableRbac: isEnabledRbacService } })
    .unwrap())?.content as Demo

  const getCurrentPortalContent = async (isTemplateMode: boolean, serviceId: string,
    list: (Portal|PortalDetail)[], isEnabledRbac: boolean) => {
    return await (isTemplateMode ?
      getTemplateContent(serviceId) :
      getPortalContent(serviceId, list, isEnabledRbac))
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
    const content = await getCurrentPortalContent(isTemplate, value, portalData, isEnabledRbac)
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
      if (networkData?.portalServiceProfileId) {
        form.setFieldValue(
          'portalServiceProfileId',
          networkData.portalServiceProfileId
        )
        const content = await getCurrentPortalContent(
          isTemplate,
          networkData.portalServiceProfileId,
          response.data,
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
    }
    if (data) {
      fetchData(data)
    }
  }, [data])

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
                  setPortal(v, isEnabledRbacService)
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
