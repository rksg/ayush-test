

import { Form, Input, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                              from 'react-intl'

import { cssStr } from '@acx-ui/components'
// TODO: Move this component to common-components
import { Hospitality, MultiDwellingUnit, Office, School, Shop, Stadium, TransportHub, Warehhouse } from '@acx-ui/icons'
import { EdgeClusterTypeCard }                                                                     from '@acx-ui/rc/components'

import * as UI from './styledComponents'


function VerticalPage (props: {
  selectedType: string,
  setSelectedType: (selectedType: string) => void
}) {
  const { $t } = useIntl()
  const { selectedType, setSelectedType } = props
  const onChange = (e: RadioChangeEvent) => {
    setSelectedType(e.target.value)
  }

  return <div
    style={{
      height: '100%',
      maxHeight: 'calc(100vh - 320px)',
      minHeight: '200px'
    }}>
    <div style={{
      fontFamily: cssStr('--acx-accent-brand-font'),
      fontSize: '16px',
      fontWeight: 600,
      margin: '0px 0px 10px 85px'
    }}>
      {$t({ defaultMessage: '<VenueSingular></VenueSingular> Type' })}
    </div>

    <Form.Item
      name='venueType'
      validateFirst
      rules={[
        { required: true }
      ]}>

      <Radio.Group
        style={{ width: '100%' }}
        onChange={onChange}
        value={selectedType}
      >
        <UI.VirticalContainer>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='school'
              title={$t({ defaultMessage: 'School' })}
              icon={<School style={{ width: '120px', height: '70px' }} />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='hotel'
              title={$t({ defaultMessage: 'Hotel' })}
              icon={<Hospitality style={{ width: '120px', height: '70px' }}/>}
            />
          </UI.VirticalBox>


          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='office'
              title={$t({ defaultMessage: 'Office' })}
              icon={<Office style={{ width: '120px', height: '70px' }}/>}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='shop'
              title={$t({ defaultMessage: 'Shop' })}
              icon={<Shop style={{ width: '120px', height: '70px' }} />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='stadium'
              title={$t({ defaultMessage: 'Stadium' })}
              icon={<Stadium style={{ width: '120px', height: '70px' }}/>}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='transport'
              title={$t({ defaultMessage: 'Transport Hub' })}
              icon={<TransportHub style={{ width: '120px', height: '70px' }}/>}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='wareHouse'
              title={$t({ defaultMessage: 'Warehouse' })}
              icon={<Warehhouse style={{ width: '120px', height: '70px' }} />}
            />
          </UI.VirticalBox>


          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='multiDwelling'
              title={$t({ defaultMessage: 'Multi-Dwelling Unit' })}
              icon={<MultiDwellingUnit style={{ width: '120px', height: '70px' }} />}
            />
          </UI.VirticalBox>
        </UI.VirticalContainer>
        <Radio value={'OTHER'} style={{ marginLeft: '90px', marginTop: '30px' }}>
          {$t({ defaultMessage: 'Others' })}
          {(selectedType === 'OTHER') &&
            <Form.Item
              name={'othersValue'}
              rules={[{
                required: true,
                message: $t({
                  defaultMessage:
                    'Please enter a value for Others'
                })
              }]}
            >
              <Input />
            </Form.Item>
          }
        </Radio>
      </Radio.Group>
    </Form.Item>
  </div>
}

export default VerticalPage
