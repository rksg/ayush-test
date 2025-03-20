import { useState } from 'react'

import {
  Checkbox,
  Form,
  Tooltip,
  Typography,
  RadioChangeEvent,
  Radio,
  Row,
  Col
} from 'antd'
import moment, { LocaleSpecifier } from 'moment-timezone'
import { useParams }               from 'react-router-dom'

import { cssStr, Modal, PasswordInput }        from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }           from '@acx-ui/formatter'
import {
  useGenerateGuestPasswordMutation,
  useValidateGuestPasswordByGuestIdMutation
} from '@acx-ui/rc/services'
import {
  getGuestDictionaryByLangCode,
  Guest,
  LangCode,
  PdfGeneratorService,
  guestPasswordValidator
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import {
  getHumanizedLocale,
  getMomentLocale,
  humanizedDate,
  genTemplate
} from '../GuestsTable/addGuestDrawer'
import {
  CheckboxLabel,
  EnvelopClosedOutlinedIcon,
  MobilePhoneOutlinedIcon,
  PrinterOutlinedIcon,
  FullWidthSpace
} from '../styledComponents'


export function GenerateNewPasswordModal (props: {
  generateModalVisible: boolean,
  setGenerateModalVisible: (visible: boolean) => void,
  guestDetail: Guest,
  tenantId: string | undefined }) {

  const closeModal = () => {
    form.setFieldValue('outputInterface', [])
    props.setGenerateModalVisible(false)
    setButtonDisabled(true)
  }

  const [generateGuestPassword] = useGenerateGuestPasswordMutation()

  const saveModal = (async () => {
    try {

      const result = await form.validateFields()
      if (result?.errorFields?.length > 0) return

      let payload = {
        deliveryMethods: form.getFieldValue('outputInterface')
      }

      const password = form.getFieldValue('password')
      if((guestPasswordOption !== 'auto') && password?.length >= 6 && password?.length <= 16){
        payload = Object.assign({}, payload, { password: password })
      } else {
        payload = Object.assign({}, payload, { action: 'regeneratePassword' })
      }

      const params = {
        tenantId: props.tenantId,
        guestId: props.guestDetail.id,
        networkId: props.guestDetail.wifiNetworkId
      }
      await generateGuestPassword({ params, payload }).unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          handleGuestPassResponse(data.response)
          setGuestPasswordOption('auto')
          form.resetFields()
          closeModal()
        })

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  })


  const handleGuestPassResponse = async (jsonGuest: Guest ) => {
    let printCondition = jsonGuest.deliveryMethods.indexOf('PRINT') !== -1
    let guest = { ...jsonGuest, langCode: '' }

    if (printCondition) {
      guest.langCode = jsonGuest.locale || ''
      generateGuestPrint(guest)
    }
  }

  const generateGuestPrint = async (guests: Guest) => {
    const guestToPrint = prepareGuestToPrint(guests)
    const printTemplate = getGuestPrintTemplate(await guestToPrint)
    const pdfGenerator = new PdfGeneratorService()
    pdfGenerator.generatePrint(printTemplate)
  }

  const getGuestPrintTemplate =
    (guestDetails: { langCode: LangCode }) => {
      const langDictionary = getGuestDictionaryByLangCode(guestDetails.langCode)
      return genTemplate(guestDetails, langDictionary)
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prepareGuestToPrint = async (guest: any) =>{
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
          guestExpiresDate = currentMoment.clone().add(guest.expiration.duration, 'hours')
        } else {
          guestExpiresDate = currentMoment.clone().add(guest.expiration.duration, 'days')
        }
      }
    }
    const validForDuration = moment(guestExpiresDate).diff(currentMoment)
    const huminitazationLangCode = getHumanizedLocale(langCode) || ''
    const validFor = humanizedDate(validForDuration, huminitazationLangCode)

    return {
      validFor: validFor,
      currentDate: currentDate,
      password: password,
      wifiNetwork: wifiNetwork,
      name: name,
      langCode: langCode
    }
  }

  const { $t } = getIntl()
  const [form] = Form.useForm()
  const params = useParams()
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const hasEmailAddress = Boolean(props.guestDetail.emailAddress)
  const hasMobilePhoneNumber = Boolean(props.guestDetail.mobilePhoneNumber)
  const isGuestManualPasswordEnabled = useIsSplitOn(Features.GUEST_MANUAL_PASSWORD_TOGGLE)
  const [ validateGuestPassword ] = useValidateGuestPasswordByGuestIdMutation()
  const [guestPasswordOption, setGuestPasswordOption] = useState('auto')
  const guestPasswordOptionChange = (event: RadioChangeEvent) => {
    form.validateFields()
    setGuestPasswordOption(event.target.value)
  }
  return (<Modal
    data-testid='generate-password-modal'
    title={$t({ defaultMessage: 'Generate New Password' })}
    visible={props.generateModalVisible}
    okButtonProps={{ disabled: buttonDisabled }}
    okText={$t({ defaultMessage: 'Generate' })}
    destroyOnClose={true}
    onCancel={closeModal}
    onOk={saveModal}
  >
    <Form
      form={form}
      onFieldsChange={() =>
        setButtonDisabled(
          form.getFieldsError().some((field) => field.errors.length > 0)
        )
      }>
      {isGuestManualPasswordEnabled &&
      <Form.Item
        label={$t({ defaultMessage: 'Guest Pass' })}
        valuePropName={'checked'}
        initialValue={'auto'}
      >
        <Radio.Group
          style={{ width: '100%' }}
          onChange={guestPasswordOptionChange}
          value={guestPasswordOption}>
          <FullWidthSpace
            direction='vertical'
            style={{ width: '100%' }}>
            <Radio value='auto' data-testid='auto-radio'>Auto generated</Radio>
            <Radio value='manual' style={{ width: '100%' }} data-testid='manual-radio'>
              <Row>
                <Col span={3}>
                Manual
                </Col>
                <Col span={21}>
                  { (guestPasswordOption === 'manual') ? (
                    <Form.Item
                      name={'password'}
                      style={{ width: '100%' }}
                      rules={[
                        { required: true },
                        { min: 6 },
                        { max: 16 },
                        { validator: (_, value) => guestPasswordValidator(value) },
                        { validator: async (_, value: string) => {
                        // Add length limit otherwise it will still trigger validation and get 400 from backend.
                          if(value && value.length >= 6 && value.length <= 16) {
                            setButtonDisabled(true)
                            const payload = { action: 'passwordValidation', password: value }
                            try{
                              await validateGuestPassword({ params:
                                { ...params,
                                  networkId: props.guestDetail.wifiNetworkId,
                                  guestId: props.guestDetail.id
                                }, payload }).unwrap()
                            } catch(e) {
                              // eslint-disable-next-line max-len
                              return Promise.reject($t({ defaultMessage: 'Passwords on the same network should be unique.' }))
                            }
                            setButtonDisabled(false)
                            return Promise.resolve()
                          }
                        } }
                      ]}
                      children={<PasswordInput data-testid='manual-password-input' />}
                    />
                  ) : <></> }
                </Col>
              </Row>
            </Radio>
          </FullWidthSpace>
        </Radio.Group>
      </Form.Item>
      }
      <Typography.Text style={{
        display: 'block', marginBottom: '20px',
        color: cssStr('--acx-neutrals-60')
      }}>
        {$t({ defaultMessage: 'How would you like to give the new password to the guest:' })}
      </Typography.Text>
      <Form.Item
        name='outputInterface'
        rules={[{
          required: true
        }]}
        children={
          <Checkbox.Group style={{ display: 'grid', rowGap: '20px', marginBottom: '20px' }}>

            <Tooltip
              title={hasEmailAddress ? '' :
                $t({ defaultMessage: 'No phone number defined for this guest' })}
              mouseLeaveDelay={0}>
              <Checkbox value='SMS'
                style={{ alignItems: 'start' }}
                disabled={!hasMobilePhoneNumber}
              >
                <MobilePhoneOutlinedIcon />
                <CheckboxLabel>{$t({ defaultMessage: 'Send to Phone' })}</CheckboxLabel>
              </Checkbox>
            </Tooltip>

            <Tooltip
              title={hasEmailAddress ? '' :
                $t({ defaultMessage: 'No Email address defined for this guest' })}
              mouseLeaveDelay={0}>
              <Checkbox
                value='MAIL'
                style={{ marginLeft: '0px', alignItems: 'start' }}
                disabled={!hasEmailAddress}
              >
                <EnvelopClosedOutlinedIcon />
                <CheckboxLabel>{$t({ defaultMessage: 'Send to Email' })}</CheckboxLabel>
              </Checkbox>
            </Tooltip>

            <Checkbox
              value='PRINT'
              style={{ marginLeft: '0px', alignItems: 'start' }}
            >
              <PrinterOutlinedIcon />
              <CheckboxLabel>{$t({ defaultMessage: 'Print Guest pass' })}</CheckboxLabel>
            </Checkbox>

          </Checkbox.Group>
        } />
    </Form>

  </Modal>)
}
