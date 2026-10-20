import {el,image,button} from './dom.js';
// Markers are rendered only over supplied interior photos and verified catalog SKUs.
export function renderRooms(data){
 if(!data.rooms.length)return;
 const root=document.querySelector('.room-section');root.hidden=false;
 for(const room of data.rooms){const section=el('section'),heading=el('h2','',room.title),scene=el('div','room-photo');scene.append(image(room.image));for(const marker of room.markers){const product=data.products.find(p=>p.id===marker.productId);if(!product)continue;const link=el('a','room-marker','+');link.href=`#product/${product.slug}`;link.style.left=`${marker.x}%`;link.style.top=`${marker.y}%`;link.setAttribute('aria-label',product.title);scene.append(link);}section.append(heading,scene);root.append(section);}
}
