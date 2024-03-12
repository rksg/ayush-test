import { Form }    from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { ExpirationDateSelector }               from '@acx-ui/rc/components'
import { ExpirationDateEntity, ExpirationMode } from '@acx-ui/rc/utils'

import { onboardSettingsDescription } from '../../contentsMap'
import { Description }                from '../../styledComponents'

export default function ValidityPeriodSettings () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const validateBeforeAndAfterDate = () => {
    const notBefore: ExpirationDateEntity = form.getFieldValue('notBefore')
    const notAfter: ExpirationDateEntity = form.getFieldValue('notAfter')
    if (notBefore && notAfter) {
      if (notBefore.mode !== notAfter.mode) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Both the Start Date and End Date must either be specified by selecting \'By Date\' or defined as a relative time interval.' }))
      }
      const notBeforeDate = notBefore.date
      const notAfterDate = notAfter.date
      const isByDateMode =
        notBefore.mode === ExpirationMode.BY_DATE && notAfter.mode === ExpirationMode.BY_DATE
      const datesAreValid = notBeforeDate && notAfterDate
      if (isByDateMode && datesAreValid &&
        moment(notBeforeDate).isSameOrAfter(moment(notAfterDate))) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Start date cannot be after expiration date' }))
      }
    }
    return Promise.resolve()
  }

  return (
    <>
      <Description>{$t(onboardSettingsDescription.VALIDITY_PERIOD)}</Description>
      <ExpirationDateSelector
        inputName='notBefore'
        label={$t({ defaultMessage: 'Start Date' })}
        modeAvailability={{ [ExpirationMode.NEVER]: false }}
        modeLabel={{ [ExpirationMode.AFTER_TIME]: $t({ defaultMessage: 'Before...' }) }}
        disabledDate={() => false}
      ></ExpirationDateSelector>
      <Form.Item
        name={['notAfter']}
        rules={[{
          validator: () => validateBeforeAndAfterDate()
        }]}>
        <ExpirationDateSelector
          inputName='notAfter'
          label={$t({ defaultMessage: 'Expiration Date' })}
          modeAvailability={{ [ExpirationMode.NEVER]: false }}
        ></ExpirationDateSelector>
      </Form.Item>
    </>
  )
}
