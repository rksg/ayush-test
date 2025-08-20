import { useState } from 'react'

import { Col, Form, InputNumber, Radio, Row, Space, Typography } from 'antd'
import { isNumber }                                              from 'lodash'
import moment                                                    from 'moment'
import { useIntl }                                               from 'react-intl'

import { Button, DatePicker, Loader, showToast }                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                            from '@acx-ui/formatter'
import { useGetCalculatedLicencesMutation, useGetCalculatedLicencesV2Mutation } from '@acx-ui/msp/services'
import { LicenseCalculatorData, LicenseCalculatorDataV2, MSPUtils }             from '@acx-ui/msp/utils'
import { EntitlementDeviceType }                                                from '@acx-ui/rc/utils'
import { AccountTier, noDataDisplay }                                           from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function MaxPeriod (props: { showExtendedTrial: boolean }) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [maxPeriod, setMaxPeriod] = useState<string>()
  const [licenseV2Data, setLicenseV2Data] = useState<LicenseCalculatorDataV2[]>([])
  const mspUtils = MSPUtils()

  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
  const multiLicenseFFToggled = useIsSplitOn(Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE)

  const hasSolutionTokenLicenses = multiLicenseFFToggled && solutionTokenFFToggled

  const [
    getCalculatedLicense,
    { isLoading }
  ] = useGetCalculatedLicencesMutation()

  const [
    getCalculatedLicenseV2,
    { isLoading: isLoadingV2 }
  ] = useGetCalculatedLicencesV2Mutation()

  async function calculatePeriod () {
    form.validateFields()
    const startDate = form.getFieldsValue().startDate
    const noOfLicenses = form.getFieldsValue().noOfLicenses
    const isTrial = form.getFieldsValue().licenses === 'extendedTrialLicenses'
    const isSltn = hasSolutionTokenLicenses &&
      form.getFieldsValue().licenses === 'solutionTokenLicenses'
    if (startDate && isNumber(noOfLicenses)) {
      const getLicenseType = () => {
        const type = isSltn ? EntitlementDeviceType.SLTN_TOKEN : EntitlementDeviceType.APSW
        return multiLicenseFFToggled ? [type] : type
      }
      const payload = {
        operator: 'MAX_PERIOD',
        effectiveDate: moment(startDate).format('YYYY-MM-DD'),
        quantity: noOfLicenses,
        filters: {
          usageType: 'ASSIGNED',
          licenseType: getLicenseType(),
          isTrial
        }
      }
      if( multiLicenseFFToggled ) {
        await getCalculatedLicenseV2({ payload })
          .unwrap()
          .then(( { data }) => {
            if (data.length > 0) {
              setLicenseV2Data(data)
            } else {
              setLicenseV2Data([{
                effectiveDate: '',
                expirationDate: '',
                licenseType: EntitlementDeviceType.APSW,
                isTrial: false,
                maxQuantity: 0,
                quantity: 0
              }])
            }
          }).catch(error => {
            console.log(error) // eslint-disable-line no-console
          })
      } else {
        await getCalculatedLicense({ payload })
          .unwrap()
          .then(( { data, message }: { data: LicenseCalculatorData, message: string }) => {
            if (!message) {
              setMaxPeriod(data?.expirationDate)
            } else {
              setMaxPeriod('')
              showError(message)
            }
          }).catch(error => {
            if(error.data.message) {
              showError(error.data.message)
            }
          })
      }
    }
  }

  function showError (errorMessage: string) {
    showToast({
      type: 'error',
      content: errorMessage
    })
  }
  return <div>
    <Form
      form={form}
      layout='vertical'
      size={'middle'}
      onFinish={calculatePeriod}
    >
      { props.showExtendedTrial && <Form.Item
        name={'licenses'}
        initialValue={'paidLicenses'}
        children={<Radio.Group>
          <Space direction='vertical'>
            <Radio value={'paidLicenses'}>{solutionTokenFFToggled
              ? $t({ defaultMessage: 'Device Networking Paid Licenses' })
              : $t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{solutionTokenFFToggled
              ? $t({ defaultMessage: 'Device Networking Extended Trial Licenses' })
              : $t({ defaultMessage: 'Extended Trial Licenses' }) }</Radio>
            { hasSolutionTokenLicenses &&
              <Radio value={'solutionTokenLicenses'}>{
                $t({ defaultMessage: 'Solution Tokens Paid Licenses' }) }</Radio>
            }
          </Space>
        </Radio.Group>}/> }
      <Form.Item
        name={'startDate'}
        label={$t({ defaultMessage: 'Start Date' })}
        style={{ display: 'inline-block', width: '90px' }}
        validateFirst
        rules={[
          { required: true }
        ]}
        children={<DatePicker
          suffixIcon={null}
          allowClear={false}
          size='small'
          style={{
            height: '28px'
          }}
          disabledDate={(current) => {
            return current && current <= moment().startOf('day')
          }}
        />}/>
      <Form.Item
        name={'noOfLicenses'}
        label={$t({ defaultMessage: '# of Licenses' })}
        style={{ display: 'inline-block', width: '90px', margin: '0 6px' }}
        rules={[
          { required: true },
          { type: 'number', min: 1, max: 10000 }
        ]}
        children={<InputNumber
          style={{
            height: '28px',
            fontSize: '12px'
          }}/>}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block', width: '90px',
          margin: '22px 0px 0px 0px' }}
        children={<Button style={{
          background: 'var(--acx-primary-black)',
          color: 'var(--acx-primary-white)',
          minHeight: '28px',
          width: '90px'
        }}
        htmlType='submit'
        type='default'>{ $t({ defaultMessage: 'CALCULATE' }) }</Button>}/>
    </Form>

    {multiLicenseFFToggled && <Loader states={[{ isLoading: isLoadingV2 }]}>
      {licenseV2Data.map((item, index) => {
        const tierText = $t(mspUtils.transformTier(item.skuTier as AccountTier))
        return <Row
          key={index}
          style={{
            alignItems: 'center',
            marginBottom: '5px'
          }}>
          <Col style={{
            width: item.skuTier ? '175px': '135px'
          }}>
            {item.skuTier ? <UI.LicenseLabel>
              { $t({ defaultMessage: 'End Date for {skuTier} Tier:' },
                { skuTier: tierText }) }
            </UI.LicenseLabel> : <UI.LicenseLabel>
              { $t({ defaultMessage: 'End Date:' }) }
            </UI.LicenseLabel>
            }
          </Col>
          <Col>
            <UI.LicenseHighlihghtLabel> {item.expirationDate ?
              formatter(DateFormatEnum.DateFormat)(item.expirationDate) : noDataDisplay}
            </UI.LicenseHighlihghtLabel>
          </Col>
        </Row>
      })}
    </Loader>}

    {
      !multiLicenseFFToggled &&
      <Row style={{
        alignItems: 'center'
      }}>
        <Col style={{
          marginRight: '4px'
        }}>
          <Typography.Text>
            { $t({ defaultMessage: 'End Date:' }) }
          </Typography.Text>
        </Col>
        <Col>
          <Typography.Title style={{
            margin: '0px'
          }}> <Loader states={[{ isLoading: isLoading || isLoadingV2 }]}>
              { maxPeriod ? formatter(DateFormatEnum.DateFormat)(maxPeriod) : noDataDisplay }
            </Loader> </Typography.Title>
        </Col>
      </Row>
    }
  </div>
}