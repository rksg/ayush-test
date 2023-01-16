import { useIntl } from 'react-intl'

import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import { getLanguage } from '../../commonUtils'
import * as UI         from '../styledComponents'

export default function PortalLanguageSettings (props:{
  demoValue: Demo,
  updateViewContent:(value:Demo)=>void,
}) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const { updateViewContent, demoValue } = props
  const langKeys = Object.keys(PortalLanguageEnum) as Array<keyof typeof PortalLanguageEnum>
  return (<>
    <UI.Label>
      {$t({ defaultMessage: 'Language:' })}
    </UI.Label>
    <UI.Select value={demoValue.displayLangCode}
      style={{ textAlign: 'left', width: 230 }}
      onChange={(value) => {
        updateViewContent({
          ...demoValue, displayLangCode: value as string, alternativeLang:
            { ...demoValue.alternativeLang, [value as keyof typeof PortalLanguageEnum]: false }
        })
      }}>
      {langKeys.map(
        (key => <Option key={key} valule={key}>{getLanguage(key)}
        </Option>
        ))}
    </UI.Select>
  </>
  )
}
