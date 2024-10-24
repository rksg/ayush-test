

import { useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                              from 'react-intl'

import { cssStr } from '@acx-ui/components'
// TODO: Move this component to common-components
import { Hospitality, MultiDwellingUnit, Office, School, Shop, Stadium, TransportHub, Warehhouse } from '@acx-ui/icons'
import { EdgeClusterTypeCard }                                                                     from '@acx-ui/rc/components'

import * as UI from './styledComponents'


function VerticalPage () {
  const { $t } = useIntl()
  const [selected, setSelected] = useState(undefined)
  const onChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  return <div>
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
        value={selected}
      >
        <UI.VirticalContainer>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='school'
              title={$t({ defaultMessage: 'School' })}
              icon={<School />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='stadium'
              title={$t({ defaultMessage: 'Stadium' })}
              icon={<Stadium />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='hotel'
              title={$t({ defaultMessage: 'Hotel' })}
              icon={<Hospitality />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='transport'
              title={$t({ defaultMessage: 'Transport Hub' })}
              icon={<TransportHub />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='office'
              title={$t({ defaultMessage: 'Office' })}
              icon={<Office />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='wareHouse'
              title={$t({ defaultMessage: 'Warehouse' })}
              icon={<Warehhouse />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='shop'
              title={$t({ defaultMessage: 'Shop' })}
              icon={<Shop />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='multiDwelling'
              title={$t({ defaultMessage: 'Multi-Dwelling Unit' })}
              icon={<MultiDwellingUnit />}
            />
          </UI.VirticalBox>
        </UI.VirticalContainer>
        <Radio value={'OTHER'} style={{ marginLeft: '100px' }}>
          {$t({ defaultMessage: 'Others' })}
          {selected === 'OTHER' &&
          <Form.Item
            name={'othersValue'}
            rules={[{ required: true }]}
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
