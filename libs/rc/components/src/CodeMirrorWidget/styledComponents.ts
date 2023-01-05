import styled                  from 'styled-components/macro'
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/merge/merge.css'

export const Container = styled.div`
.CodeMirror {
  border: 6px solid $rw-grey-10;
  font-size: 12px;
  line-height: 16px;
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

.CodeMirror-merge {
  border: 0;
  margin-top: 15px;
  .CodeMirror {
    border-top-width: 40px;
  }
}
  
.CodeMirror-merge-scrolllock {
  display: none;
}

.CodeMirror-merge-2pane .CodeMirror-merge-gap {
  background-color: $rw-grey-10;
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
  border: 6px solid $rw-white;
  border-width: 6px 6px 0 0;
}

.CodeMirror-vscrollbar::-webkit-scrollbar-track
{
	background-color: $rw-grey-10;
}

.CodeMirror-vscrollbar::-webkit-scrollbar
{
  width: 6px;
	background-color: $rw-grey-10;
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb
{
	background-color: $rw-blue-50;
}

.CodeMirror-hscrollbar {
  border: 6px solid $rw-white;
  border-width: 0 0 6px 6px;
}

.CodeMirror-hscrollbar::-webkit-scrollbar-track
{
	background-color: $rw-grey-10;
}

.CodeMirror-hscrollbar::-webkit-scrollbar
{
  height: 6px;
	background-color: $rw-grey-10;
}

.CodeMirror-hscrollbar::-webkit-scrollbar-thumb
{
	background-color: $rw-blue-50;
}

.CodeMirror-vscrollbar:focus, .CodeMirror-hscrollbar:focus {
  outline: none;
}

.CodeMirror-merge-r-inserted, .CodeMirror-merge-l-inserted, .CodeMirror-merge-r-deleted, .CodeMirror-merge-l-deleted{
  background: #ffffe0;
}

.CodeMirror-activeline-background {
  background-color: #e8d7da;
  border-width: 1px;
  border-style: solid;
  border-color: red;
  border-left: 0px;
  border-right: 0px;
  border-radius: 0px;
}
`