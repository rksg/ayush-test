import styled from 'styled-components/macro'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/merge/merge.css'

export const Container = styled.div`
.CodeMirror {
  font-size: 12px;
  line-height: 1.3;
  z-index: 0;
}

.CodeMirror-gutters {
  background-color: var(--acx-neutrals-30);
  padding-right: 5px;
  border: 0;
  width: 30px;
}

.CodeMirror-code > div {
  padding-left: 35px;
}

.CodeMirror-linenumber {
  color: var(--acx-primary-black);
  text-align: left;
}

.CodeMirror-merge, .CodeMirror-merge .CodeMirror {
  height: 450px;
}

.CodeMirror-merge {
  border: 0;
  margin-top: 15px;
  .CodeMirror {
    border-top-width: 40px;
  }
  .CodeMirror-gutters {
    background-color: var(--acx-neutrals-25);
  }
}
  
.CodeMirror-merge-scrolllock {
  display: none;
}

.CodeMirror-merge-2pane .CodeMirror-merge-gap {
  background-color: var(--acx-neutrals-25);
  border: 0;
}

.CodeMirror-merge-2pane .CodeMirror-merge-pane {
  width: 48%;
}

.CodeMirror-merge-2pane .CodeMirror-merge-gap {
  width: 4%;
}

.CodeMirror-vscrollbar {
  bottom: 6px !important;
  border: 6px solid var(--acx-primary-white);
  border-width: 6px 6px 0 0;
}

.CodeMirror-vscrollbar::-webkit-scrollbar-track
{
	background-color: var(--acx-neutrals-30);
}

.CodeMirror-vscrollbar::-webkit-scrollbar
{
  width: 6px;
	background-color: var(--acx-neutrals-30);
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb
{
	background-color: var(--acx-accents-blue-50);
}

.CodeMirror-hscrollbar {
  border: 6px solid var(--acx-primary-white);
  border-width: 0 0 6px 6px;
}

.CodeMirror-hscrollbar::-webkit-scrollbar-track
{
	background-color: var(--acx-neutrals-30);
}

.CodeMirror-hscrollbar::-webkit-scrollbar
{
  height: 6px;
	background-color: var(--acx-neutrals-30);
}

.CodeMirror-hscrollbar::-webkit-scrollbar-thumb
{
	background-color: var(--acx-accents-blue-50);
}

.CodeMirror-vscrollbar:focus, .CodeMirror-hscrollbar:focus {
  outline: none;
}

.CodeMirror-merge-r-inserted, .CodeMirror-merge-l-inserted, 
.CodeMirror-merge-r-deleted, .CodeMirror-merge-l-deleted {
  background: #ffffe0;
}

.CodeMirror-activeline-background {
  background-color: rgba(237, 28, 36, 0.2);
}

.cm-attribute {
  color: var(--acx-accents-orange-50) !important;
}
.cm-variable {
  color: var(--acx-semantics-green-50) !important;
}
`