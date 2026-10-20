import {mkdir,writeFile} from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Unbounded:wght@500..900&display=swap';
const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!res.ok)throw new Error(`Fonts CSS ${res.status}`);
let css=await res.text();let index=0;
await mkdir('src/assets/fonts',{recursive:true});
for(const remote of [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))]){
 const data=await fetch(remote);if(!data.ok)throw new Error(`Font ${data.status}`);
 const file=`font-${index++}.woff2`;await writeFile(`src/assets/fonts/${file}`,Buffer.from(await data.arrayBuffer()));
 css=css.replaceAll(remote,`../assets/fonts/${file}`);
}
await writeFile('src/styles/fonts.css',css);console.log(`Downloaded ${index} local fonts`);
