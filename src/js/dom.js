export function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function icon(name){const node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#${name}`);node.append(use);return node;}
export function image(data,{lazy=true}={}){const img=el('img');img.src=data.src;img.alt=data.alt;img.width=data.width;img.height=data.height;img.loading=lazy?'lazy':'eager';img.decoding='async';return img;}
export function button(text,className=''){const n=el('button',className,text);n.type='button';return n;}
