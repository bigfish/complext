
let s:complext = expand('<sfile>:p:h').'/../../bin/complete'

fun! Complext(findstart, base)
  if a:findstart
    " locate the start of the word
    let line = getline('.')
    let start = col('.') - 1
    while start > 0 && line[start - 1] =~ '\a'
      let start -= 1
    endwhile
    return start
  else
	" execute the output of the Node.js script to get completions
	" the result will be of the form g:complextions = ['Foo', 'Bar']
	exe system(s:complext.' '.a:base)
	" the completions will be in tha variable s:complextions
    return g:complextions
  endif
endfun

set completefunc=Complext
set completeopt=menu,preview,longest
