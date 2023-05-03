import {
  Form,
  Input,
  Upload
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'

import { GridCol, GridRow, StepsForm, Subtitle } from '@acx-ui/components'
import { useLazyGetResidentPortalListQuery }     from '@acx-ui/rc/services'
import { checkObjectNotExists }                  from '@acx-ui/rc/utils'
import { getIntl }                               from '@acx-ui/utils'
import { ColorPickerInput } from './ColorPickerInput'
import { PlusCircleOutlined } from '@acx-ui/icons'
import ImageInput from './ResidentPortalImageUpload'

export default function ResidentPortalSettingsForm () {
  const intl = getIntl()
  const form = Form.useFormInstance()
  const id = Form.useWatch<string>('id', form)

  const [ residentPortalList ] = useLazyGetResidentPortalListQuery()
  const nameValidator = async (value: string) => {
    const list = (await residentPortalList({
      payload: { pageSize: 10000, sortField: 'name', sortOrder: 'ASC' }
    }).unwrap()).data
      .filter(n => n.id !== id)
      .map(n => ({ name: n.name }))

    return checkObjectNotExists(list,
      { name: value },
      intl.$t({ defaultMessage: 'Resident Portal' }))
  }

  // Render ////////////////////
  return (<GridRow>
    <GridCol col={{ span: 6 }}>
      <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
      <Form.Item name='id' noStyle>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item
        name='serviceName'
        label={intl.$t({ defaultMessage: 'Service Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 52 },
          { validator: (_, value) => nameValidator(value) }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Portal Details' }) }
      </Subtitle>
      <Form.Item
        name='textTitle'
        label={intl.$t({ defaultMessage: 'Portal Title' })}
        rules={[
          { required: false },
          { min: 2 },
          { max: 52 }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <Form.Item
        name='textSubtitle'
        label={intl.$t({ defaultMessage: 'Subtitle' })}
        rules={[
          { required: false },
          { min: 2 },
          { max: 52 }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <Form.Item
        name='textLogin'
        label={intl.$t({ defaultMessage: 'Login Text' })}
        rules={[
          { required: false },
          { min: 2 },
          { max: 52 }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <Form.Item
        name='textAnnouncements'
        label={intl.$t({ defaultMessage: 'Announcements' })}
        rules={[
          { required: false },
          { min: 2 },
          { max: 5000 }
        ]}
        validateFirst
        hasFeedback
        children={<TextArea />}
      />
      <Form.Item
        name='textHelp'
        label={intl.$t({ defaultMessage: 'Help Text' })}
        rules={[
          { required: false },
          { min: 2 },
          { max: 5000 }
        ]}
        validateFirst
        hasFeedback
        children={<TextArea />}
      />
      {/* ** Visual Properties ** */}
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'VisualProperties' }) }
      </Subtitle>
      <Form.Item name='colorMain'
        label={intl.$t({ defaultMessage: 'Main Color' })}
        children={
          // @ts-ignore
        <ColorPickerInput defaultColorHex='#101820' colorName={intl.$t({ defaultMessage: 'Main Color' })} />}
        />
      <Form.Item name='colorAccent'
        label={intl.$t({ defaultMessage: 'Accent Color' })}
        children={
          // @ts-ignore
        <ColorPickerInput defaultColorHex='#E57200' colorName={intl.$t({ defaultMessage: 'Accent Color' })} />}
        />
      <Form.Item name='colorSeparator'
        label={intl.$t({ defaultMessage: 'Separator Color' })}
        children={
          // @ts-ignore
        <ColorPickerInput defaultColorHex='#D9D9D6' colorName={intl.$t({ defaultMessage: 'Separator Color' })} />}
        />
      <Form.Item name='colorText'
        label={intl.$t({ defaultMessage: 'Text Color' })}
        children={
          // @ts-ignore
        <ColorPickerInput defaultColorHex='#54585A' colorName={intl.$t({ defaultMessage: 'Text Color' })} />}
        />
      
        {/* TODO: figure out how to load the existing image when editing */}
        
      <ImageInput formItemProps={{name:'fileLogo', label: intl.$t({ defaultMessage: 'Logo' })}} />
      <ImageInput formItemProps={{name:'fileFavicon', label: intl.$t({ defaultMessage: 'Favicon' })}} />
    </GridCol>
  </GridRow>)
}
