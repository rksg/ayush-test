
import { useEffect, useState } from 'react'

import { InputProps } from 'antd'
import { useIntl }    from 'react-intl'

import { SuccessSolid }     from '@acx-ui/icons'
import { InformationSolid } from '@acx-ui/icons'

import { PasswordInput }   from '..'
import { cssStr }          from '../../../theme/helper'
import { StackedBarChart } from '../../StackedBarChart'
import { Tooltip }         from '../../Tooltip'

import * as UI from './styledComponents'

const usedBarColor: string[] = [
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-semantics-red-60'),
  cssStr('--acx-semantics-yellow-60'),
  cssStr('--acx-accents-blue-60'),
  cssStr('--acx-semantics-green-60')
]

export const PasswordInputStrength = ({
  ...props
}: Partial<InputProps>) => {
  const { $t } = useIntl()
  const [input, setInput] = useState('')
  const [usedBarColors, setUsedBarColors] = useState([
    usedBarColor[0],
    cssStr('--acx-neutrals-50')
  ])

  const [ series, setSeries ] = useState([
    { name: '', value: 0 },
    { name: '', value: 4 }
  ])

  const PASSWORD_STRENGTH_CODE = [
    $t({ defaultMessage: 'Insecure' }),
    $t({ defaultMessage: 'Weak' }),
    $t({ defaultMessage: 'Fair' }),
    $t({ defaultMessage: 'Good' }),
    $t({ defaultMessage: 'Strong' })
  ]

  const [ strengthStatus, setStrengthStatus ] = useState(PASSWORD_STRENGTH_CODE[0])

  const RULE_REGEX = [
    /^.{8,}$/,
    /(?=.*[a-z])(?=.*[A-Z])/,
    /(?=.*\d)/,
    /(?=.*[^\w\d\s])/
  ]
  const [validRegexIndex, setValidRegexIndex] = useState(new Map<number, boolean>(
    RULE_REGEX.map((_, index) => [index, false])
  ))

  useEffect(() => {
    const passedRulesCount = RULE_REGEX.reduce((count, regEx, index) => {
      if (regEx.test(input)) {
        setValidRegexIndex(map => new Map(map.set(index, true)))
        return count + 1
      } else {
        setValidRegexIndex(map => new Map(map.set(index, false)))
        return count
      }
    }, 0)

    const passedRulesRatio = Math.floor(passedRulesCount/RULE_REGEX.length*4)

    setUsedBarColors([
      usedBarColor[passedRulesRatio],
      cssStr('--acx-neutrals-50')
    ])

    setSeries([
      { name: 'weak', value: passedRulesRatio },
      { name: 'fair', value: 4-passedRulesRatio }
    ])

    setStrengthStatus(input === '' ?
      $t({ defaultMessage: 'Strength' }) :
      PASSWORD_STRENGTH_CODE[passedRulesRatio])
  }, [input])

  const RULE_MESSAGES = [
    $t({ defaultMessage: '8 characters' }),
    $t({ defaultMessage: 'One uppercase and one lowercase letters' }),
    $t({ defaultMessage: 'One number' }),
    $t({ defaultMessage: 'One special symbol' })
  ]

  return (
    <>
      <div>
        <PasswordInput
          {...props}
          value={input}
          onChange={(e) => { setInput(e.target.value); props?.onChange?.(e) }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: 5 }}>
        <StackedBarChart
          style={{ height: 8, width: 270, marginTop: 5 }}
          showLabels={false}
          showTotal={false}
          showTooltip={false}
          barWidth={270}
          data={[{
            series,
            category: 'password strength'
          }]}
          barColors={usedBarColors}
          total={4}
        />
        <span style={{ minWidth: 50, textAlign: 'center' }}>{strengthStatus}</span>

        <Tooltip
          title={<UI.Ul>{RULE_MESSAGES.map(
            (item, index) => {
              return <li>{validRegexIndex.get(index)?<SuccessSolid />:'-'} {item}</li> })}
          </UI.Ul>}
        >
          <InformationSolid style={{ paddingTop: '2px' }}/>
        </Tooltip>
      </div>
    </>
  )
}