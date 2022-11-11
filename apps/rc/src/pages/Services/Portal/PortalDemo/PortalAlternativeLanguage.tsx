import { useIntl } from 'react-intl'

import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import { getLanguage } from '../../commonUtils'
import * as UI         from '../styledComponents'
export default function PortalAlternativeLanguage (props:{
  demoValue: Demo
}) {
  const { demoValue } = props
  const alternativeLang = demoValue.alternativeLang
  const displayLang = demoValue.displayLang
  const intl = useIntl()
  let langs = [] as string[]
  const langKeys = Object.keys(alternativeLang || {}) as Array<keyof typeof PortalLanguageEnum>
  langKeys.map((key) =>{
    if(alternativeLang?.[key]) langs.push(getLanguage(key))
    return langs
  }
  )
  const { Option } = UI.Select
  //just for display, no logic here
  if(langs.length <= 4)
    return (
      <UI.FieldTextLink>
        {intl.formatList(langs,{ type: 'conjunction' })}
      </UI.FieldTextLink>
    )
  else return (
    <UI.Select defaultValue={displayLang}>
      <Option value={displayLang} key={displayLang}>{displayLang}</Option>
      {langs.map(
        (key => <Option key={key} value={key}>{key}</Option>
        ))}
    </UI.Select>
  )
}

