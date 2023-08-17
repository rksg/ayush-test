
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { SummaryCard }              from '@acx-ui/components'
import { useGetPortalLangMutation } from '@acx-ui/rc/services'
import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'
import { useParams }                from '@acx-ui/react-router-dom'
import { loadImageWithJWT }         from '@acx-ui/utils'

import Photo                 from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered               from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                  from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { getLanguage }       from '../../commonUtils'
import { initialPortalData } from '../PortalForm/PortalForm'
import PortalPreviewModal    from '../PortalPreviewModal'

export default function PortalOverview (props: { demoValue: Demo }) {
  const { $t } = useIntl()
  const { demoValue } = props
  const params = useParams()
  const [newDemo, setNewDemo]=useState({ displayLangCode: 'en' } as Demo)
  const getDemo = async ()=>{
    const newDemoValue = { ...initialPortalData.content,
      ...demoValue, poweredImg: demoValue?.poweredImg?
        await loadImageWithJWT(demoValue.poweredImg):Powered,
      logo: demoValue?.logo?await loadImageWithJWT(demoValue.logo):Logo,
      photo: demoValue?.photo?await loadImageWithJWT(demoValue.photo): Photo,
      bgImage: demoValue?.bgImage?await loadImageWithJWT(demoValue.bgImage):'' }
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
  },[])

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
