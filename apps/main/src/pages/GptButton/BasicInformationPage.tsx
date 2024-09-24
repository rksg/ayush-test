

import { Radio } from 'antd'


import { cssStr }              from '@acx-ui/components'
import { EdgeClusterTypeCard } from '@acx-ui/rc/components'

import { ReactComponent as GptHotel }         from './assets/gptHotel.svg'
import { ReactComponent as GptMultiDwelling } from './assets/gptMultiDwelling.svg'
import { ReactComponent as GptOffice }        from './assets/gptOffice.svg'
import { ReactComponent as GptSchool }        from './assets/gptSchool.svg'
import { ReactComponent as GptShop }          from './assets/gptShop.svg'
import { ReactComponent as GptStadium }       from './assets/gptStadium.svg'
import { ReactComponent as GptTransport }     from './assets/gptTransport.svg'
import { ReactComponent as GptWareHouse }     from './assets/gptWareHouse.svg'
import * as UI                                from './styledComponents'


function BasicInformationPage () {
  return <div>
    <div style={{
      fontFamily: cssStr('--acx-accent-brand-font'),
      fontSize: '16px',
      fontWeight: 600,
      margin: '0px 0px 10px 85px'
    }}>
      Basic
    </div>



  </div>
}

export default BasicInformationPage
