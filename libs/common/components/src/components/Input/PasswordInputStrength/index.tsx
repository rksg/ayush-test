/* isAllConditionsMet: 1-4 */
import { useEffect, useState } from 'react'

import { Col, InputProps, Row } from 'antd'
import { useIntl }              from 'react-intl'

import { SuccessSolid } from '@acx-ui/icons'

import { PasswordInput }   from '..'
import { cssStr }          from '../../../theme/helper'
import { StackedBarChart } from '../../StackedBarChart'
import { Tooltip }         from '../../Tooltip'

import * as UI from './styledComponents'
interface PasswordStrengthProps extends InputProps {
  regexrules: RegExp[]
  regexerrormessages: string[]
  isAllConditionsMet: number
  onConditionCountMet: (newLevel: boolean) => void
  value: string
}

interface PasswordStrengthIndicatorProps {
  input: string
  regexrules: RegExp[]
  regexerrormessages: string[]
  isAllConditionsMet: number
  barWidth?: number
  focus: boolean
}


const usedBarColor: string[] = [
  cssStr('--acx-neutrals-20'),
  cssStr('--acx-semantics-red-50'),
  cssStr('--acx-semantics-yellow-50'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-semantics-green-50')
]

export const PasswordInputStrength = ({
  ...props
}: Partial<PasswordStrengthProps>) => {
  const { regexrules, regexerrormessages, isAllConditionsMet, onConditionCountMet, value } = props
  const { $t } = useIntl()
  const [input, setInput] = useState('')
  const [focus, setFocus] = useState(false)
  const isAllConditionsCountMet =
    (isAllConditionsMet && isAllConditionsMet > 4 ? 4 : isAllConditionsMet) || 4

  const RULE_REGEX = regexrules || [
    /^.{8,}$/,
    /(?=.*[a-z])(?=.*[A-Z])/,
    /(?=.*\d)/,
    /(?=.*[^\w\d\s])/
  ]

  const RULE_MESSAGES = regexerrormessages || [
    $t({ defaultMessage: '8 characters' }),
    $t({ defaultMessage: 'One uppercase and one lowercase letters' }),
    $t({ defaultMessage: 'One number' }),
    $t({ defaultMessage: 'One special symbol' })
  ]

  useEffect(() => {
    if(value){
      setInput(value.toString())
    }
  }, [value])

  return (
    <>
      <PasswordInput
        {...props}
        onChange={(e) => {
          setInput(e.target.value)
          const passedRulesRatio = calculatePassedRulesRatio(e.target.value, RULE_REGEX)
          onConditionCountMet?.(passedRulesRatio >= isAllConditionsCountMet)
          props?.onChange?.(e)
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      <PasswordStrengthIndicator
        input={input}
        regexrules={RULE_REGEX}
        regexerrormessages={RULE_MESSAGES}
        isAllConditionsMet={isAllConditionsCountMet}
        focus={focus}
      />
    </>
  )
}

export const PasswordStrengthIndicator = ({
  input, regexrules, regexerrormessages, isAllConditionsMet, barWidth, focus }:
    PasswordStrengthIndicatorProps) => {
  const { $t } = useIntl()
  const [mouseEnterTooltip, setMouseEnterTooltip] = useState(false)
  const [currentConditionCount, setCurrentConditionCount] = useState(0)
  const [usedBarColors, setUsedBarColors] = useState([
    usedBarColor[0],
    cssStr('--acx-neutrals-20')
  ])

  const [ series, setSeries ] = useState([
    { name: 'weak', value: 0,
      itemStyle: {
        borderRadius: [2, 0, 0, 2]
      }
    },
    { name: 'fair', value: 4,
      itemStyle: {
        borderRadius: [0, 2, 2, 0]
      }
    }
  ])

  const PASSWORD_STRENGTH_CODE = [
    $t({ defaultMessage: 'Insecure' }),
    $t({ defaultMessage: 'Weak' }),
    $t({ defaultMessage: 'Fair' }),
    $t({ defaultMessage: 'Good' }),
    $t({ defaultMessage: 'Strong' })
  ]

  const [ strengthStatus, setStrengthStatus ] = useState(PASSWORD_STRENGTH_CODE[0])

  const [validRegexIndex, setValidRegexIndex] = useState(new Map<number, boolean>(
    regexrules.map((_, index) => [index, false])
  ))

  useEffect(() => {
    const passedRulesCount = regexrules.reduce((count, regEx, index) => {
      if (regEx.test(input)) {
        setValidRegexIndex(map => new Map(map.set(index, true)))
        return count + 1
      } else {
        setValidRegexIndex(map => new Map(map.set(index, false)))
        return count
      }
    }, 0)

    const passedRulesRatio = Math.floor(passedRulesCount/regexrules.length*4)
    setUsedBarColors([
      usedBarColor[passedRulesRatio],
      cssStr('--acx-neutrals-20')
    ])

    setSeries([
      { name: 'weak', value: passedRulesRatio, itemStyle: {
        borderRadius: passedRulesRatio > 0 && passedRulesRatio < 4 ? [2, 0, 0, 2] : [2, 2, 2, 2]
      } },
      { name: 'fair', value: 4-passedRulesRatio, itemStyle: {
        borderRadius: passedRulesRatio > 0 && passedRulesRatio < 4 ? [0, 2, 2, 0] : [2, 2, 2, 2]
      } }
    ])

    setStrengthStatus(input === '' ?
      $t({ defaultMessage: 'Strength' }) :
      PASSWORD_STRENGTH_CODE[passedRulesRatio])

    setCurrentConditionCount(passedRulesRatio)
  },[input])

  return (<UI.PasswordBarContainer>
    <StackedBarChart
      style={{ height: 8, width: barWidth || 270, marginTop: 5 }}
      showLabels={false}
      showTotal={false}
      showTooltip={false}
      barWidth={barWidth || 270}
      data={[{
        series,
        category: 'password strength'
      }]}
      barColors={usedBarColors}
      total={4}
    />
    <UI.StrengthStatus>{strengthStatus}</UI.StrengthStatus>

    <Tooltip
      title={<div>
        <Row gutter={[8, 16]}>
          <Col span={24}>
            <UI.TooltipTitle>
              {$t({ defaultMessage: 'Password must contain at least:' })}</UI.TooltipTitle>
          </Col>
        </Row>
        {regexerrormessages.map((item, index) => (
          <Row gutter={[8, 16]} key={index}>
            <Col span={2}>{validRegexIndex.get(index) ?
              <SuccessSolid /> : <UI.QuestionMarkCircleSolidIcon />}</Col>
            <Col span={22}>{item}</Col>
          </Row>
        ))}
      </div>}
      visible={(focus && currentConditionCount < isAllConditionsMet) || mouseEnterTooltip}
      placement={'bottom'}
      data-testid={'tooltipInfo'}
    >
      <UI.InformationOutlinedIcon
        onMouseEnter={() => setMouseEnterTooltip(true)}
        onMouseLeave={() => setMouseEnterTooltip(false)}
        data-testid={'tooltipIcon'}
      />
    </Tooltip>
  </UI.PasswordBarContainer>)

}

const calculatePassedRulesRatio = (input: string, regexrules: RegExp[]) => {
  const passedRulesCount = regexrules.reduce((count, regEx) => {
    return count + (regEx.test(input) ? 1 : 0)
  }, 0)
  return Math.floor((passedRulesCount / regexrules.length) * 4)
}