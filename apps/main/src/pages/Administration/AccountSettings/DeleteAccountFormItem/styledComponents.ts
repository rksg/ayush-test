import styled from 'styled-components'

export const LabelWrapper = styled.div`
    .ant-form-item-no-colon {
        font-size: var(--acx-body-3-font-size)!important;
        color: var(--acx-primary-black);
    }
    .ant-form-item {
        margin-bottom: 5px;
    }
`

export const DeleteButtonWrapper = styled.div`
    margin-top: 20px;
    .ant-btn.ant-btn-default {
        border-color: var(--acx-semantics-red-50);
        color: var(--acx-semantics-red-50);
    }
`