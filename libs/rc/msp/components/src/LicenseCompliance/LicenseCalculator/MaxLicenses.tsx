import { useState } from 'react'

import { Col, DatePickerProps, Form, Radio, Row, Space, Typography } from 'antd'
import moment                                                        from 'moment'
import { useIntl }                                                   from 'react-intl'

import { Button, DatePicker, Loader, showToast }                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { useGetCalculatedLicencesMutation, useGetCalculatedLicencesV2Mutation } from '@acx-ui/msp/services'
import { LicenseCalculatorData, LicenseCalculatorDataV2 }                       from '@acx-ui/msp/utils'
import { EntitlementDeviceType }                                                from '@acx-ui/rc/utils'
import { noDataDisplay }                                                        from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function MaxLicenses (props: { showExtendedTrial: boolean }) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [ selectedDate, setSelectedDate ] = useState(moment().endOf('day'))
  const [ maxLicenceCount, setMaxLicenceCount ] = useState<number>()
  const [licenseV2Data, setLicenseV2Data] = useState<LicenseCalculatorDataV2[]>([])

  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
  const multiLicenseFFToggled = useIsSplitOn(Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE)
  const hasSolutionTokenLicenses = multiLicenseFFToggled && solutionTokenFFToggled

  const onDateChange: DatePickerProps['onChange'] = (dateString: moment.Moment | null) => {
    if (dateString) {
      setSelectedDate(dateString)
      form.setFieldValue('endDate', '')
    }
  }

  const [
    getCalculatedLicense,
    { isLoading }
  ] = useGetCalculatedLicencesMutation()

  const [
    getCalculatedLicenseV2,
    { isLoading: isLoadingV2 }
  ] = useGetCalculatedLicencesV2Mutation()

  async function calculateLicences () {
    form.validateFields()
    const startDate = form.getFieldsValue().startDate
    const endDate = form.getFieldsValue().endDate
    const isTrial = form.getFieldsValue().licenses === 'extendedTrialLicenses'
    const isSltn = hasSolutionTokenLicenses &&
      form.getFieldsValue().licenses === 'solutionTokenLicenses'

    if (startDate && endDate) {
      const diff = startDate.diff(endDate)
      if (diff < 0) {
        const getLicenseType = () => {
          const type = isSltn ? EntitlementDeviceType.SLTN_TOKEN : EntitlementDeviceType.APSW
          return multiLicenseFFToggled ? [type] : type
        }
        const payload = {
          operator: 'MAX_QUANTITY',
          effectiveDate: moment(startDate).format('YYYY-MM-DD'),
          expirationDate: moment(endDate).format('YYYY-MM-DD'),
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
                setMaxLicenceCount(data?.quantity || 0)
              } else {
                setMaxLicenceCount(undefined)
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
    >
      { props.showExtendedTrial && <Form.Item
        name={'licenses'}
        initialValue={'paidLicenses'}
        children={<Radio.Group>
          <Space direction='vertical'>
            <Radio value={'paidLicenses'}>{
              solutionTokenFFToggled
                ? $t({ defaultMessage: 'Device Networking Paid Licenses' })
                : $t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{
              solutionTokenFFToggled
                ? $t({ defaultMessage: 'Device Networking Extended Trial Licenses' })
                : $t({ defaultMessage: 'Extended Trial Licenses' }) }</Radio>
            { hasSolutionTokenLicenses &&
              <Radio value={'solutionTokenLicenses'}>{
                $t({ defaultMessage: 'Solution Tokens Paid Licenses' }) }</Radio>
            }
          </Space>
        </Radio.Group>}/>}
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
          onChange={onDateChange}
          disabledDate={(current) => {
            return current && current <= moment().startOf('day')
          }}
        />}/>
      <Form.Item
        name={'endDate'}
        label={$t({ defaultMessage: 'End Date' })}
        style={{ display: 'inline-block', width: '90px', margin: '0 6px' }}
        validateFirst
        rules={[
          { required: true }
        ]}
        children={<DatePicker
          allowClear={false}
          suffixIcon={null}
          size='small'
          style={{
            height: '28px'
          }}
          disabledDate={(date) => date.isBefore(moment(selectedDate).add(1, 'days'))}
        />}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block',
          width: '90px',
          margin: '22px 0px 0px 0px' }}
        children={<Button style={{
          background: 'var(--acx-primary-black)',
          color: 'var(--acx-primary-white)',
          minHeight: '28px',
          width: '90px'
        }}
        onClick={calculateLicences}
        type='default'>{ $t({ defaultMessage: 'CALCULATE' }) }</Button>}/>
    </Form>
    {multiLicenseFFToggled && <Loader states={[{ isLoading: isLoadingV2 }]}>
      {licenseV2Data.map((item) => {
        return <Row style={{
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <Col style={{
            width: '210px'
          }}>
            {item.skuTier ? <UI.LicenseLabel>
              { $t({ defaultMessage: 'Available Licenses for {skuTier} Tier:' },
                { skuTier: item.skuTier }) }
            </UI.LicenseLabel> : <UI.LicenseLabel>
              { $t({ defaultMessage: 'Available Licenses:' }) }
            </UI.LicenseLabel>
            }
          </Col>
          <Col>
            <UI.LicenseHighlihghtLabel> {item.quantity} </UI.LicenseHighlihghtLabel>
          </Col>
        </Row>
      })}
    </Loader>}

    {
      !multiLicenseFFToggled && <Row style={{
        alignItems: 'center'
      }}>
        <Col style={{
          marginRight: '4px'
        }}>
          <Typography.Text>
            { $t({ defaultMessage: 'Available Licenses:' }) }
          </Typography.Text>
        </Col>
        <Col>
          <Typography.Title style={{
            margin: '0px'
          }}> <Loader states={[{ isLoading: isLoading }]}>
              {maxLicenceCount || noDataDisplay}
            </Loader> </Typography.Title>
        </Col>
      </Row>
    }

  </div>
}