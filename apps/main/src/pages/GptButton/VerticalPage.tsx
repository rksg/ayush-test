

import { useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                              from 'react-intl'

import { cssStr } from '@acx-ui/components'
// TODO: Move this component to common-components
import { EdgeClusterTypeCard } from '@acx-ui/rc/components'

// TOOD: Waiting for the new SVG export
import { ReactComponent as GptHotel }         from './assets/gptHotel.svg'
import { ReactComponent as GptMultiDwelling } from './assets/gptMultiDwelling.svg'
import { ReactComponent as GptOffice }        from './assets/gptOffice.svg'
import { ReactComponent as GptSchool }        from './assets/gptSchool.svg'
import { ReactComponent as GptShop }          from './assets/gptShop.svg'
import { ReactComponent as GptStadium }       from './assets/gptStadium.svg'
import { ReactComponent as GptTransport }     from './assets/gptTransport.svg'
import { ReactComponent as GptWareHouse }     from './assets/gptWareHouse.svg'
import * as UI                                from './styledComponents'


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
      {$t({ defaultMessage: 'Vertical Type' })}
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
              icon={<GptSchool />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='stadium'
              title={$t({ defaultMessage: 'Stadium' })}
              icon={<GptStadium />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='hotel'
              title={$t({ defaultMessage: 'Hotel' })}
              icon={<GptHotel />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='transport'
              title={$t({ defaultMessage: 'Transport Hub' })}
              icon={<GptTransport />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='office'
              title={$t({ defaultMessage: 'Office' })}
              icon={<GptOffice />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='wareHouse'
              title={$t({ defaultMessage: 'Warehouse' })}
              icon={<GptWareHouse />}
            />
          </UI.VirticalBox>

          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='shop'
              title={$t({ defaultMessage: 'Shop' })}
              icon={<GptShop />}
            />
          </UI.VirticalBox>
          <UI.VirticalBox>
            <EdgeClusterTypeCard
              className='typeCard'
              id='multiDwelling'
              title={$t({ defaultMessage: 'Multi-Dwelling Unit' })}
              icon={<GptMultiDwelling />}
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
