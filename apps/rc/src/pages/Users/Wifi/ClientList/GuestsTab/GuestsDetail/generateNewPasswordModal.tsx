import { useState } from 'react'

import { Checkbox, Form, Tooltip, Typography } from 'antd'
import moment                                  from 'moment'
import { useParams }                           from 'react-router-dom'

import { cssStr, Modal, showToast }         from '@acx-ui/components'
import { useLazyGetUserProfileQuery }       from '@acx-ui/user'
import { useGenerateGuestPasswordMutation } from '@acx-ui/rc/services'
import { useLazyGetNetworkQuery }           from '@acx-ui/rc/services'
import {
  getGuestDictionaryByLangCode,
  Guest,
  LangCode,
  PdfGeneratorService
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
  PrinterOutlinedIcon
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
  const [getNetwork] = useLazyGetNetworkQuery()
  const [getUserProfile] = useLazyGetUserProfileQuery()
  const params = useParams()


  const saveModal = (async () => {
    try {
      const payload = form.getFieldValue('outputInterface')
      const params = {
        tenantId: props.tenantId,
        guestId: props.guestDetail.id
      }
      await generateGuestPassword({ params, payload }).unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          handleGuestPassResponse(data.response)
          closeModal()
        })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  })


  const handleGuestPassResponse = async (jsonGuest: Guest ) => {
    let printCondition = jsonGuest.deliveryMethods.indexOf('PRINT') !== -1
    let guest = { ...jsonGuest, langCode: '' }

    if (printCondition) {
      const networkData = await getNetwork({
        params: { tenantId: params.tenantId, networkId: jsonGuest.networkId }
      })
      guest.langCode = networkData?.data?.guestPortal?.guestPage?.langCode || ''
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
    const userProfile = await getUserProfile({ params })
    const currentDate = currentMoment.format(userProfile.data?.dateFormat.toUpperCase())
    const langCode = guest.langCode || guest.locale
    const momentLocale = getMomentLocale(langCode)
    moment.locale(momentLocale)

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
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const hasEmailAddress = Boolean(props.guestDetail.emailAddress)
  const hasMobilePhoneNumber = Boolean(props.guestDetail.mobilePhoneNumber)
  return (<Modal
    title={$t({ defaultMessage: 'Generate New Password' })}
    visible={props.generateModalVisible}
    okButtonProps={{ disabled: buttonDisabled }}
    okText={$t({ defaultMessage: 'Generate' })}
    destroyOnClose={true}
    onCancel={closeModal}
    onOk={saveModal}
  >
    <Typography.Text style={{
      display: 'block', marginBottom: '20px',
      color: cssStr('--acx-neutrals-60')
    }}>
      {$t({ defaultMessage: 'How would you like to give the new password to the guest:' })}
    </Typography.Text>
    <Form
      form={form}
      onFieldsChange={() =>
        setButtonDisabled(
          form.getFieldsError().some((field) => field.errors.length > 0)
        )
      }>
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
