import styled from 'styled-components/macro'

export const DivContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0px;
`

export const HealthContentExcellent = styled.div`
    height: 13px;
    width: 7px;
    margin-left: 2px;
    background: var(--acx-semantics-green-50);
    border-radius: 3px;
`
export const HealthContentModerate = styled.div`
    height: 13px;
    width: 7px;
    margin-left: 2px;
    background: var(--acx-accents-orange-50);
    border-radius: 3px;
`
export const HealthContentPoor = styled.div`
    height: 13px;
    width: 7px;
    margin-left: 2px;
    background: var(--acx-semantics-red-50);
    border-radius: 3px;
`

export const ProgressEmptyContent = styled.div`
    height: 13px;
    width: 7px;
    margin-left: 2px;
    background: var(--acx-neutrals-30);
    border-radius: 3px;
`
