import { Checkbox, Form, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import { getLanguage } from '../../commonUtils'
import * as UI         from '../styledComponents'

export default function PortalLanguageSettings (props:{
  demoValue: Demo,
  updateViewContent:(value:Demo)=>void,
}) {
  const { $t } = useIntl()
  const { Option } = Select
  const { updateViewContent, demoValue } = props
  const langKeys = Object.keys(PortalLanguageEnum) as Array<keyof typeof PortalLanguageEnum>
  return (
    <Form layout='vertical'>
      <Form.Item
        name='displayLang'
        label={$t({ defaultMessage: 'Display Language' })}
        initialValue={demoValue.displayLang}
        children={<Select value={demoValue.displayLang}
          onChange={(value)=>{
            updateViewContent({ ...demoValue, displayLang: value as string, alternativeLang:
            { ...demoValue.alternativeLang, [value as keyof typeof PortalLanguageEnum]: false } })
          }}>
          {langKeys.map(
            (key => <Option key={key} valule={key}>{getLanguage(key)}
            </Option>
            ))}
        </Select>}
      />
      <Form.Item
        name='alternativeLang'
        label={$t({ defaultMessage: 'Alternative languages' })}
        children={<div>
          {langKeys.map((key => <UI.CommonLabel key={key+'label'}>
            <Checkbox key={key+'checkbox'}
              disabled={key === demoValue.displayLang}
              checked={key === demoValue.displayLang ? false:
                demoValue.alternativeLang[key]}
              onChange={(e)=>{
                updateViewContent({ ...demoValue, alternativeLang: { ...demoValue.alternativeLang,
                  [key]: e.target.checked
                } })
              }}>{getLanguage(key)}</Checkbox>
          </UI.CommonLabel>
          ))}
        </div>}
      />
    </Form>
  )
}
