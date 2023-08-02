import { Card as AntCard, Radio as AntRadio } from 'antd'
import styled                                 from 'styled-components/macro'

import { Button as DefaultButton } from '../Button'

export type RadioCardType = 'default' | 'radio' | 'button' | 'disabled'

export const Card = styled(AntCard)<{ $cardType: RadioCardType }>`
  position: relative;
  border: solid 1px var(--acx-neutrals-30);
  box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
  height: 100%;

  ${props => props.$cardType !== 'button'
    ?`:hover {
    border-radius: 4px;
    border: 1px solid var(--acx-accents-orange-50);
  }`:''}

  ${props => props.$cardType === 'default'
    ?'cursor: pointer;':''}

  ${props => props.$cardType === 'disabled'
    ? `opacity : 50%;
      background-color: var(--acx-neutrals-15);
    `: ''}

  :has(.ant-radio-checked) {
    border-radius: 4px;
    border: 1px solid var(--acx-accents-orange-50);
    background: var(--acx-accents-orange-10);
  }

  .ant-card-body {
    padding: 16px 12px 12px 12px;
  }
`

export const Button = styled(DefaultButton)`
  position: absolute;
  right: 12px;
  bottom: 12px;
  &&& {
    color: var(--acx-accents-orange-50);
    background-color: var(--acx-primary-white);
    &:hover, &:focus {
      color: var(--acx-primary-white);
    }
  }
`

export const Radio = styled(AntRadio)`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;

  .ant-radio {
    position: absolute;
    right: 12px;
    top: 16px;
    &-inner, &:hover .ant-radio-inner {
      border-color: var(--acx-neutrals-40);
    }
  }

  .ant-radio-checked {
    .ant-radio-inner::before {
      display: block;
      height: 16px;
      width: 16px;
      content: '';
      border-radius: 50%;
      background: var(--acx-accents-orange-50);
      margin-top: -1px;
      margin-left: -1px;
      border: 1px solid var(--acx-semantics-yellow-60);;
    }
  }

  .ant-radio-inner::after {
    background-color: transparent;
    border-radius: 0px;
    transform: rotate(45deg);
    width: 4px;
    height: 8px;
    border-bottom: 1px solid var(--acx-primary-white);
    border-right: 1px solid var(--acx-primary-white);
    margin-left: -2px;
    margin-top: -5px;
  }
`

export const CategoryWrapper = styled.div`
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  gap: 4px;
`

export const Category = styled.div<{ color: string }>`
  background: var(${props => props.color});
  border-radius: 2px;
  padding: 0px 4px;
  color: var(--acx-primary-white);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  line-height: var(--acx-subtitle-5-line-height);
  font-size: var(--acx-body-6-font-size);
`

export const Description = styled.div`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-5-line-height);
  padding-bottom: 30px;
`

export const Title = styled.div`
  padding-right: 20px;
  padding-bottom: 3px;
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  font-weight: var(--acx-subtitle-4-font-weight);
`
