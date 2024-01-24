import {
  Form,
  Input,
  Switch
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'

import { GridCol, GridRow, StepsFormLegacy, Subtitle }    from '@acx-ui/components'
import { useLazyGetQueriableResidentPortalsQuery }        from '@acx-ui/rc/services'
import { checkObjectNotExists, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { getIntl }                                        from '@acx-ui/utils'

import { ColorPickerInput }                         from './ColorPickerInput'
import ResidentPortalImageUpload, { ExistingImage } from './ResidentPortalImageUpload'

export interface SettingsFormProps {
  existingLogo: ExistingImage,
  existingFavicon: ExistingImage
}

export default function ResidentPortalSettingsForm (props : SettingsFormProps) {
  const intl = getIntl()
  const form = Form.useFormInstance()
  const id = Form.useWatch<string>('id', form)

  const [ residentPortalList ] = useLazyGetQueriableResidentPortalsQuery()

  const nameValidator = async (value: string) => {
    const list = (await residentPortalList({
      payload:
          { page: 1, pageSize: 100, sortField: 'name', sortOrder: 'ASC', filters: { name: value } }
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
      <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
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
          { validator: (_, value) => trailingNorLeadingSpaces(value) },
          { validator: (_, value) => nameValidator(value) }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
        validateTrigger={'onBlur'}
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

      <StepsFormLegacy.FieldLabel width={'92%'}>
        {intl.$t({ defaultMessage: 'Allow Residents to Set Passphrase' })}
        <Form.Item
          name='tenantSetDpsk'
          rules={[{ required: true }]}
          valuePropName={'checked'}
          children={<Switch />}
        />
      </StepsFormLegacy.FieldLabel>
      {/* ** Visual Properties ** */}
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'VisualProperties' }) }
      </Subtitle>
      <Form.Item name='colorMain'
        label={intl.$t({ defaultMessage: 'Main Color' })}
        children={
          // @ts-ignore
          <ColorPickerInput defaultColorHex='#101820'
            colorName={intl.$t({ defaultMessage: 'Main Color' })} />}
      />
      <Form.Item name='colorAccent'
        label={intl.$t({ defaultMessage: 'Accent Color' })}
        children={
          // @ts-ignore
          <ColorPickerInput defaultColorHex='#E57200'
            colorName={intl.$t({ defaultMessage: 'Accent Color' })} />}
      />
      <Form.Item name='colorSeparator'
        label={intl.$t({ defaultMessage: 'Separator Color' })}
        children={
          // @ts-ignore
          <ColorPickerInput defaultColorHex='#D9D9D6'
            colorName={intl.$t({ defaultMessage: 'Separator Color' })} />}
      />
      <Form.Item name='colorText'
        label={intl.$t({ defaultMessage: 'Text Color' })}
        children={
          // @ts-ignore
          <ColorPickerInput defaultColorHex='#54585A'
            colorName={intl.$t({ defaultMessage: 'Text Color' })} />}
      />

      <Form.Item name='fileLogo'
        label={intl.$t({ defaultMessage: 'Logo' })}
        children={
          // @ts-ignore
          <ResidentPortalImageUpload existingImage={props.existingLogo}/>
        }/>

      <Form.Item name='fileFavicon'
        label={intl.$t({ defaultMessage: 'Favicon' })}
        children={
          // @ts-ignore
          <ResidentPortalImageUpload existingImage={props.existingFavicon} imageType='FAVICON'/>
        }/>
    </GridCol>
  </GridRow>)
}
