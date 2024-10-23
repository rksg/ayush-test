
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { SummaryCard }              from '@acx-ui/components'
import { baseUrlFor }               from '@acx-ui/config'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useGetPortalLangMutation } from '@acx-ui/rc/services'
import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'
import { useParams }                from '@acx-ui/react-router-dom'
import { getImageDownloadUrl }      from '@acx-ui/utils'

import { initialPortalData }               from '../../services/PortalForm'
import { PortalPreviewModal, getLanguage } from '../PortalDemo'

const Photo = baseUrlFor('/assets/images/portal/PortalPhoto.jpg')
const Powered = baseUrlFor('/assets/images/portal/PoweredLogo.png')
const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

export function PortalOverview (props: { demoValue: Demo }) {
  const { $t } = useIntl()
  const { demoValue } = props
  const params = useParams()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [newDemo, setNewDemo]=useState({ displayLangCode: 'en' } as Demo)
  const getDemo = async ()=>{
    const newDemoValue = { ...initialPortalData.content,
      ...demoValue, poweredImg: demoValue?.poweredImg?
        await getImageDownloadUrl(isEnabledRbacService, demoValue.poweredImg):Powered,
      logo: demoValue?.logo?
        await getImageDownloadUrl(isEnabledRbacService, demoValue.logo):Logo,
      photo: demoValue?.photo?
        await getImageDownloadUrl(isEnabledRbacService, demoValue.photo): Photo,
      bgImage: demoValue?.bgImage?
        await getImageDownloadUrl(isEnabledRbacService, demoValue.bgImage):'' }
    setNewDemo(newDemoValue)
  }
  const [getPortalLang] = useGetPortalLangMutation()
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })

  useEffect(()=>{
    if(newDemo.displayLangCode){
      getPortalLang({ params: { ...params, messageName:
      newDemo.displayLangCode+'.json' } }).unwrap().then((res)=>{
        setPortalLang(res)
      })
    }
  }, [newDemo.displayLangCode])

  useEffect(()=>{
    getDemo()
  },[demoValue])

  const portalInfo = [
    {
      title: $t({ defaultMessage: 'Language' }),
      content: getLanguage(newDemo.displayLangCode as keyof typeof PortalLanguageEnum),
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'WiFi4EU Snippet' }),
      content: newDemo?.componentDisplay?.wifi4eu ?
        $t({ defaultMessage: 'ON' }) :
        $t({ defaultMessage: 'OFF' }),
      colSpan: 19
    },
    {
      title: <PortalPreviewModal demoValue={newDemo} portalLang={portalLang}/>,
      colSpan: 1
    }
  ]

  return <SummaryCard data={portalInfo} />
}
