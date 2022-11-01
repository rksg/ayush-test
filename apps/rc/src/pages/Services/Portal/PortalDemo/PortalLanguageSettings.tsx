import { Checkbox } from 'antd'
import { useIntl }  from 'react-intl'

import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export default function PortalLanguageSettings (props:{
  demoValue: Demo,
  updateViewContent:(value:Demo)=>void,
}) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const { updateViewContent, demoValue } = props
  return (
    <div>
      <UI.CommonLabel>{$t({ defaultMessage: 'Display Language' })}</UI.CommonLabel>
      <UI.Select value={demoValue.displayLang}
        onChange={(value)=>{
          updateViewContent({ ...demoValue, displayLang: value as string, alternativeLang:
            { ...demoValue.alternativeLang, [value as keyof typeof PortalLanguageEnum]: false } })
        }}>
        {Object.keys(PortalLanguageEnum).map(
          (key => <Option key={key}>{PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]}
          </Option>
          ))}
      </UI.Select>
      <UI.CommonLabel>{$t({ defaultMessage: 'Alternative languages' })}</UI.CommonLabel>
      {Object.keys(PortalLanguageEnum).map((key => <UI.CommonLabel key={key+'label'}>
        <Checkbox key={key+'checkbox'}
          disabled={key === demoValue.displayLang}
          checked={key === demoValue.displayLang ? false:
            demoValue.alternativeLang[key]}
          onChange={(e)=>{
            updateViewContent({ ...demoValue, alternativeLang: { ...demoValue.alternativeLang,
              [key as keyof typeof PortalLanguageEnum]: e.target.checked
            } })
          }}>
          {PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]} </Checkbox>
      </UI.CommonLabel>
      ))}
    </div>
  )
}
