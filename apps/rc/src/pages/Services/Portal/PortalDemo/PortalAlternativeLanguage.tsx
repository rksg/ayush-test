import { PortalLanguageEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'
export default function PortalAlternativeLanguage (props:{
  alternativeLang?: { [key:string]: boolean }
}) {
  const { alternativeLang } = props
  let langs = ''
  Object.keys(alternativeLang || {}).map((key) =>{
    return langs+=alternativeLang?.[key]?PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]+
    '&nbsp;&nbsp; ':''
  }
  )
  return (
    <UI.FieldTextLink dangerouslySetInnerHTML={{ __html: langs }}>
    </UI.FieldTextLink>
  )
}

