import { defineMessage } from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

import { GridRow, GridCol }                         from '../../Grid'
import { RadioCard, RadioCardCategory as Category } from '../../RadioCard'

export function WithRadioCard () {
  return <>
    <div>
  Default type:
      <GridRow>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            value='service'
            title='Service'
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            value='service'
            title='Service'
            isBetaFeature
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            value='service'
            title='Service'
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
      </GridRow>
    </div>
    <br></br>
    <div>
    Button type:
      <GridRow>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='button'
            value='service'
            title='Service'
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='button'
            value='service'
            title='Service'
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='button'
            value='service'
            title='Service'
            isBetaFeature
            helpIcon={<QuestionMarkCircleOutlined
              style={{ height: '16px', width: '16px', margin: '0 0 -3px 2px' }} />
            }
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
      </GridRow>
    </div>
    <br></br>
    <div>
    Radio type:
      <GridRow>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service'
            title='Service'
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service'
            title='Service'
            isBetaFeature
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service'
            title='Service'
            isBetaFeature
            helpIcon={<QuestionMarkCircleOutlined
              style={{ height: '16px', width: '16px', margin: '0 0 -3px 2px' }} />
            }
            description={
              'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            }
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            buttonText={defineMessage({ defaultMessage: 'Add' })}
            // eslint-disable-next-line no-console
            onClick={()=>console.log('Button clicked!')}
          />
        </GridCol>
      </GridRow>
    </div>
  </>
}
