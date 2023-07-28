/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select
} from 'antd'
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts'
import _                                              from 'lodash'
import moment, { LocaleSpecifier }                    from 'moment-timezone'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { Button, Drawer, cssStr, showActionModal } from '@acx-ui/components'
import { DateFormatEnum, formatter }               from '@acx-ui/formatter'
import { PhoneInput }                              from '@acx-ui/rc/components'
import {
  useLazyGetGuestNetworkListQuery,
  useAddGuestPassMutation,
  useLazyGetNetworkQuery
} from '@acx-ui/rc/services'
import {
  phoneRegExp,
  emailRegExp,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  Network,
  getGuestDictionaryByLangCode,
  base64Images,
  PdfGeneratorService,
  Guest,
  LangCode,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'
import { GuestErrorRes } from '@acx-ui/user'
import { getIntl }       from '@acx-ui/utils'

import {
  MobilePhoneSolidIcon,
  EnvelopClosedSolidIcon,
  PrintIcon,
  CheckboxLabel,
  FooterDiv
} from '../styledComponents'

interface AddGuestProps {
    visible: boolean
    setVisible: (visible: boolean) => void
}

const payload = {
  fields: ['name', 'defaultGuestCountry', 'id'],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000,
  filters: {
    nwSubType: [NetworkTypeEnum.CAPTIVEPORTAL],
    captiveType: [GuestNetworkTypeEnum.GuestPass]
  },
  url: '/api/viewmodel/tenant/{tenantId}/network'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genUpdatedTemplate = (guestDetails: any, langDictionary: any) => {
  const userName = guestDetails.name
  const ssid = guestDetails.wifiNetwork
  const year = new Date().getFullYear()

  return `
  <div style="max-width: 600px;margin:0 auto;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
      <tbody>
        <tr>
          <td style="border-top:6.94px solid #EC7100;direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
            <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                <tbody>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                        <tbody>
                          <tr>
                            <td style="width:149px;">
                              <img alt="Header ruckus logo" height="auto" src="${base64Images.ruckusCommScopeLogo}"
                              style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:12px;" width="149" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <div style="font-family:Open Sans, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#565758;">
                        <div style="line-height:16px;">${langDictionary['hello']} ${userName}, </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <div style="font-family:Open Sans, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#565758;">
                        <div style="line-height:16px;">${langDictionary['youCanAccess']}: </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <div style="font-family:Open Sans, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#565758;">
                        <div id="credentials${guestDetails.guestNumber}" style="font-weight:600;color:#333333;font-size:10px;line-height:10px;height:19px">
                          ${langDictionary['wifiNetwork']}
                        </div>
                        <div class="light-gray" style="padding:10px;font-size:20px;color:#333333;line-height:24px;border-radius:4px;font-weight:600;">
                          ${ssid}
                        </div>
                        <br><br>
                        <div style="font-weight:bold;color:#333333;font-size:10px;line-height:10px;height:19px">
                          ${langDictionary['password']}
                        </div>
                        <div class="light-gray" style="padding:10px;font-size:20px;color:#333333;line-height:24px;border-radius:4px;font-weight:600;">
                          ${guestDetails.password}
                        </div>
                        <br><br>
                        <div style="line-height:16px;">
                          ${langDictionary['accessIsValid']}${guestDetails.validFor}
                        <div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="right" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                        <tbody>
                          <tr>
                            <td style="width:126px;">
                              <img alt="Footer power logo" height="auto" src="${base64Images.poweredBy}"
                              style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:12px;" width="126" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td align="left" style="font-size:0px;word-break:break-word;">
            <div style="font-family:Open Sans, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#565758;">
              <div class="footer-bg" style="height:40px;">
                <div style="font-size: 8px;text-align:center;line-height:10px;padding-top:16px;color:#808284;">
                  &copy; ${year} CommScope, Inc. All Rights Reserved.
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
}

export const getMomentLocale = (langCode?: string) => {
  const LOCALE_MAP = new Map<string, string>([
    ['pt_BR', 'pt-br'],   // Brazilian Portuguese
    ['pt_PT', 'pt'],      // Portuguese
    ['no', 'nb'],         // Norwegian
    ['eng', 'en'],
    ['zh_TW', 'zh-tw']
  ])

  if (!langCode) {
    return 'en'
  }

  return LOCALE_MAP.has(langCode) ? LOCALE_MAP.get(langCode) : langCode
}

export const getHumanizedLocale = (langCode?: string) => {
  const LOCALE_MAP = new Map<string, string>([
    ['pt_BR', 'pt'],    // Brazilian Portuguese
    ['pt_PT', 'pt'],    // Portuguese
    ['cz', 'cs']        // Czech
  ])

  if (!langCode) {
    return 'en'
  }

  return LOCALE_MAP.has(langCode) ? LOCALE_MAP.get(langCode) : langCode
}

export const humanizedDate = (validDuration: number, langCode: string) => {
  const langService = new HumanizeDurationLanguage()
  const humanizer = new HumanizeDuration(langService)
  return humanizer.humanize(validDuration, {
    language: langCode,
    round: true,
    units: ['d', 'h']
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genTemplate = (guestDetails: any, langDictionary: any) => {
  return `
    <div class="color-2" style="text-align: left; margin-bottom: 2cm; font-size: 11pt;font-weight: normal">` + guestDetails.currentDate + `</div>
    <div style="margin-bottom: 1cm;">
       <img src="data:image/jpeg;base64; ` + base64Images.guestLogo + `" style="width: 3cm;margin:0 auto;">
    </div>
    <div class="color-1" style="font-size: 28px; margin-bottom: 1.2cm; word-break:break-all;">
       ` + langDictionary['hello'] + guestDetails.name + `</div>
    <div class="color-2" style="opacity: 0.5; font-size: 14px; margin-bottom: 1.5cm;">` + langDictionary['youCanAccess'] + `</div>
    <div id="credentials` + guestDetails.guestNumber + `" style="display: inline-block !important; min-width: 10cm">
    <div style="text-align: left;font-size: 12pt;">` + langDictionary['wifiNetwork'] + `</div>
    <div class="network" style="border: solid 1px black; border-radius: 0.1cm; text-align: left;padding: 0.5cm;margin-bottom: 1cm;display:flex !important;align-items: center;">
      <img src="data:image/jpeg;base64; ` + base64Images.wlanIcon + `" style="width: 1.3cm;height: 1.3cm;margin-right: 0.5cm;">
      <span class="color-1" style="word-break: break-all;text-align: left; font-size: 24px; vertical-align: middle;">` + guestDetails.wifiNetwork + `</span>
    </div>
    <div style="text-align: left;font-size: 12pt;">` + langDictionary['password'] + `</div>
    <div style="border: solid 1px black; border-radius: 0.1cm; text-align: left;padding: 0.5cm;margin-bottom: 1cm;display: flex !important; align-items:center;">
      <img src="data:image/jpeg;base64; ` + base64Images.lockIcon + `" style="width: 1.3cm; height: 1.3cm;margin-right: 0.5cm">
      <span class="color-1" style="text-align: left; font-size: 24px; vertical-align: middle;">` + guestDetails.password + `</span>
    </div>
    </div>
    <div class="color-2" style="margin-bottom: 1.5cm;font-size: 14px;">` + langDictionary['accessIsValid'] + guestDetails.validFor + `</div>
    <div class="color-1" style="font-size: 20px; margin-bottom: 0.5cm;">` + langDictionary['enjoy'] + `</div>
    <div class="color-3" style="border-top: solid 1px black; margin: 0 auto; padding-top: 0.5cm; width: 6cm; font-size: 10px;">
      <div style="margin: 0px 75px 10px -5px;">` + langDictionary['poweredBy'] + `</div></div>
    <div>
      <img src="data:image/jpeg;base64; ` + base64Images.ruckusLogo + `" style="width: 3.5cm;margin: 0 auto">
    </div>`
}



export type GuestResponse = {
  requestId: string,
  response: Guest[] | { data: Guest[], downloadUrl: string } }

export function GuestFields ({ withBasicFields = true }: { withBasicFields?: boolean }) {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  // Don't disable phone and email if withBasicFields == false
  const [phoneNumberError, setPhoneNumberError] = useState(withBasicFields)
  const [emailError, setEmailError] = useState(withBasicFields)

  const timeTypeValidPassOptions = [
    { label: $t({ defaultMessage: 'Hours' }), value: 'Hour' },
    { label: $t({ defaultMessage: 'Days' }), value: 'Day' }
  ]

  const [getNetworkList] = useLazyGetGuestNetworkListQuery()
  const [allowedNetworkList, setAllowedNetworkList] = useState<Network[]>()
  const getAllowedNetworkList = async () => {
    const list = await (getNetworkList({ params, payload }, true).unwrap())
    setAllowedNetworkList(list.data)
    if(list.data.length === 1) {
      form.setFieldsValue({
        networkId: list.data[0].id
      })
    }
  }

  useEffect(() => {
    getAllowedNetworkList()
  }, [])

  const createNumberOfDevicesList = () => {
    const list = []
    for (let i = 1; i <= 5; i++) {
      list.push({ label: i.toString(), value: i })
    }
    list.push({ label: $t({ defaultMessage: 'Unlimited' }), value: -1 })
    return list
  }
  const numberOfDevicesOptions = createNumberOfDevicesList()

  const onPhoneNumberChange = (phoneNumber: string) => {
    form.setFieldValue('mobilePhoneNumber', phoneNumber)
    const deliveryMethods = form.getFieldValue('deliveryMethods')
    form.validateFields(['mobilePhoneNumber']).then(() => {
      if(form.getFieldValue('mobilePhoneNumber') !== ''){
        setPhoneNumberError(false)
        deliveryMethods.push('SMS')
        form.setFieldValue('deliveryMethods', _.uniq(deliveryMethods))
      }
    }).catch(err => {
      if(err.errorFields.length > 0) {
        setPhoneNumberError(true)
        form.setFieldValue('deliveryMethods',
          deliveryMethods.filter((e: string) => e !== 'SMS'))
      }
    })
  }

  const onEmailChange = () => {
    const deliveryMethods = form.getFieldValue('deliveryMethods')
    form.validateFields(['email']).then(() => {
      if(form.getFieldValue('email') !== ''){
        setEmailError(false)
        deliveryMethods.push('MAIL')
        form.setFieldValue('deliveryMethods', _.uniq(deliveryMethods))
      }
    }).catch(err => {
      if(err.errorFields.length > 0) {
        setEmailError(true)
        form.setFieldValue('deliveryMethods',
          deliveryMethods.filter((e: string) => e !== 'MAIL'))
      }
    })
  }

  const onUnitChange = (value: string) => {
    form.setFields([{ name: ['expiration', 'duration'], value: value === 'Day' ? 7 : 24, errors: [] }])
  }

  const durationValidator = (value: number) => {
    const unit = form.getFieldValue(['expiration', 'unit'])
    if (unit === 'Day' && (value < 1 || value > 365)) {
      return Promise.reject($t({ defaultMessage: 'Value must be between 1 and 365' }))
    } else if (unit === 'Hour' && (value < 1 || value > 8760)) {
      return Promise.reject($t({ defaultMessage: 'Value must be between 1 and 8760' }))
    }
    return Promise.resolve()
  }

  return (<>
    { withBasicFields === true && (<>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Guest Name' })}
        rules={[
          { required: true },
          { min: 1 },
          { max: 256 },
          { validator: (_, value) => trailingNorLeadingSpaces(value) }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='mobilePhoneNumber'
        label={$t({ defaultMessage: 'Mobile Phone' })}
        rules={[
          { validator: (_, value) => phoneRegExp(value) }
        ]}
        initialValue={null}
        children={
          <PhoneInput name={'mobilePhoneNumber'} callback={onPhoneNumberChange} onTop={false} />
        }
      />
      <Form.Item
        name='email'
        label={$t({ defaultMessage: 'Email' })}
        rules={[
          { validator: (_, value) => emailRegExp(value) }
        ]}
        initialValue={''}
        children={<Input onChange={onEmailChange} />}
      />
      <Form.Item
        name='notes'
        label={$t({ defaultMessage: 'Note' })}
        initialValue={''}
        rules={[
          { max: 180 }
        ]}
        children={<Input />}
      />
    </>)}

    <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-30') }}/>
    <Form.Item
      name={'networkId'}
      label={$t({ defaultMessage: 'Allowed Network' })}
      rules={[
        { required: true }
      ]}
      children={<Select
        options={allowedNetworkList?.map(p => ({ label: p.name, value: p.id }))}
        disabled={allowedNetworkList?.length === 1}
      />}
    />

    <Row>
      <Col span={12}>
        <Form.Item
          validateFirst
          name={['expiration', 'duration']}
          label={$t({ defaultMessage: 'Pass is Valid for' })}
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'This field is required' })
            },
            { validator: (_, value) => durationValidator(value) }
          ]}
          initialValue={7}
          children={<InputNumber style={{ width: '100%' }} data-testid='expirationDuration'/>}
          style={{ paddingRight: '5px' }}
        />
      </Col>
      <Col span={12}>
        <Form.Item
          name={['expiration', 'unit']}
          label={' '}
          initialValue={'Day'}
          children={<Select
            options={timeTypeValidPassOptions}
            onChange={onUnitChange}
          />}
          style={{ paddingLeft: '5px' }}
        />
      </Col>
    </Row>
    <Form.Item
      name={['expiration', 'activationType']}
      label={$t({ defaultMessage: 'Pass is valid from' })}
      initialValue={'Creation'}
      children={
        <Radio.Group>
          <Radio value={'Creation'}>
            {$t({ defaultMessage: 'Now' })}
          </Radio>

          <Radio value={'Login'}>
            {$t({ defaultMessage: 'First Login' })}
          </Radio>
        </Radio.Group>}
    />
    <Form.Item
      name={'maxDevices'}
      label={$t({ defaultMessage: 'Number of devices' })}
      initialValue={3}
      children={<Select
        options={numberOfDevicesOptions}
      />}
    />
    <Form.Item
      name={'deliveryMethods'}
      initialValue={['PRINT']}
      children={
        <Checkbox.Group style={{ display: 'grid', rowGap: '5px' }}>
          <Checkbox value='SMS'
            style={{ alignItems: 'start' }}
            disabled={phoneNumberError}
          >
            <MobilePhoneSolidIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Send to Phone' })}</CheckboxLabel>
          </Checkbox>
          <Checkbox
            value='MAIL'
            style={{ marginLeft: '0px', alignItems: 'start' }}
            disabled={emailError}
          >
            <EnvelopClosedSolidIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Send to Email' })}</CheckboxLabel>
          </Checkbox>
          <Checkbox
            value='PRINT'
            style={{ marginLeft: '0px', alignItems: 'start' }}
          >
            <PrintIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Print Guest pass' })}</CheckboxLabel>
          </Checkbox>
        </Checkbox.Group>
      }
    />
  </>)
}


export function AddGuestDrawer (props: AddGuestProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, setVisible } = props
  const params = useParams()
  const { handleGuestPassResponse } = useHandleGuestPassResponse({ tenantId: params.tenantId! })

  const [
    addGuestPass
  ] = useAddGuestPassMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSave = async () => {
    const payload = [form.getFieldsValue()]
    if(form.getFieldValue('deliveryMethods').length === 0){
      showNoSendConfirm(()=>{
        addGuestPass({ params: { tenantId: params.tenantId }, payload: payload })
        setVisible(false)
      })
    }
    else{
      addGuestPass({ params: { tenantId: params.tenantId }, payload: payload })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((res: any) => {
          if (res.error &&
            (res.error.status === 400 || res.error.status === 422 || res.error.status === 409)) {
            showGuestErrorModal(res.error.data)
          } else {
            handleGuestPassResponse(res.data)
          }
        })
      setVisible(false)
    }
    form.resetFields()
  }


  const footer = [
    <Button
      data-testid='saveBtn'
      key='saveBtn'
      onClick={() => form.submit()}
      type='primary'>
      {$t({ defaultMessage: 'Add' })}
    </Button>,
    <Button
      data-testid='cancelBtn'
      key='cancelBtn'
      onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <Drawer
      title={'Add Guest Pass'}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <Form layout='vertical' form={form} onFinish={onSave} data-testid='guest-form'>
          <GuestFields />
        </Form>
      }
      footer={<FooterDiv>{footer}</FooterDiv>}
      width={'485px'}
    />
  )
}

export function showNoSendConfirm (callback: ()=>void) {
  const { $t } = getIntl()
  showActionModal({
    type: 'warning',
    title: $t({ defaultMessage: 'Guest pass won’t be printed or sent' }),
    content: $t({ defaultMessage: `
      You haven’t selected to print or send the password to the guest.
      Create guest pass anyway?` }),
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: $t({ defaultMessage: 'Cancel' }),
        type: 'link', // TODO: will change after DS update
        key: 'cancel',
        closeAfterAction: true
      }, {
        text: $t({ defaultMessage: 'Yes, create guest pass' }),
        type: 'primary',
        key: 'override',
        closeAfterAction: true,
        handler: callback
      }]
    }
  })
}

export function showGuestErrorModal (errorRes: GuestErrorRes) {
  const { $t } = getIntl()
  const errors = errorRes.error.rootCauseErrors || []
  if (errors[0].code === 'GUEST-409001') {
    showActionModal({
      type: 'error',
      title: $t({ defaultMessage: 'Mobile Phone Already Registered' }),
      content: $t({ defaultMessage: `
        A guest with the same mobile phone number already exists on the selected guest network.
        Please select a different network or change the guest's mobile phone number.` })
    })
  } else {
    showActionModal({
      type: 'error',
      title: 'Error',
      content: errors[0].message
    })
  }
}

export function useHandleGuestPassResponse (params: { tenantId: string }) {
  const [getNetwork] = useLazyGetNetworkQuery()

  const getGuestPrintTemplate =
  (guestDetails: { langCode: LangCode }, useUpdatedTemplate: boolean) => {
    const langDictionary = getGuestDictionaryByLangCode(guestDetails.langCode)
    return (useUpdatedTemplate) ?
      genUpdatedTemplate(guestDetails, langDictionary) :
      genTemplate(guestDetails, langDictionary)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prepareGuestToPrint = async (guest: any, guestNumber: any) =>{
    const currentMoment = moment()
    const currentDate = formatter(DateFormatEnum.DateFormat)(currentMoment)
    const langCode = guest.langCode || guest.locale
    const momentLocale = getMomentLocale(langCode)
    currentMoment.locale(momentLocale as LocaleSpecifier)

    const name = guest.name
    const wifiNetwork = guest.ssid
    let password = ''
    let guestExpiresDate = moment()

    if (guest.password) {
      password = guest.password
      if (guest.expirationDate) {
        guestExpiresDate = guest.expirationDate
      } else {
        if (guest.expiration.unit === 'Hour') {
          guestExpiresDate = currentMoment.clone().add('hours', guest.expiration.duration)
        } else {
          guestExpiresDate = currentMoment.clone().add('days', guest.expiration.duration)
        }
      }
    }
    const validForDuration = moment(guestExpiresDate).diff(currentMoment)
    const huminitazationLangCode = getHumanizedLocale(langCode) || ''
    const validFor = humanizedDate(validForDuration, huminitazationLangCode)

    return {
      guestNumber: guestNumber,
      validFor: validFor,
      currentDate: currentDate,
      password: password,
      wifiNetwork: wifiNetwork,
      name: name,
      langCode: langCode
    }
  }

  const generateGuestPrint = async (guests: Guest[], useUpdatedTemplate: boolean) =>{
    let printTemplate = ''
    for (let i = 0; i < guests.length; i++) {
      /** Insert page break if multi-page */
      if (i > 0) {
        printTemplate = printTemplate + '<div class=\'page-break-before\'>&nbsp;</div>'
      }
      const guestToPrint = prepareGuestToPrint(guests[i], i)
      printTemplate = printTemplate + getGuestPrintTemplate(await guestToPrint, useUpdatedTemplate)
    }
    const pdfGenerator = new PdfGeneratorService()
    pdfGenerator.generatePrint(printTemplate)
  }

  const handleGuestPassResponse = async (jsonGuest: GuestResponse) => {
    let printCondition = false
    let guestsArr: Guest[] = []
    let jsonGuestData = jsonGuest.response as Guest[]
    if ('data' in jsonGuest.response) {
      jsonGuestData = jsonGuest.response.data
    }

    if (jsonGuestData) {
      printCondition = jsonGuestData[0].deliveryMethods.indexOf('PRINT') !== -1
      for (let i = 0; i < jsonGuestData.length; i++) {
        guestsArr[i] = { ...jsonGuestData[i], langCode: '' }
      }
    }

    if (printCondition) {
      const networkData = await getNetwork({
        params: { tenantId: params.tenantId, networkId: jsonGuestData[0].networkId } })
      const langCode = (networkData?.data?.guestPortal?.guestPage?.langCode) || ''
      for (let i = 0; i < guestsArr.length; i++) {
        guestsArr[i].langCode = langCode
      }
      generateGuestPrint(guestsArr, false)
    }
  }

  return { handleGuestPassResponse }
}
