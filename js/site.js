/* Simple front-end: render products, handle search and cart (localStorage) */

function formatPrice(p){ return '$' + p.toFixed(2); }

function renderGrid(targetId, list, showDetailLink=true){
  const container = document.getElementById(targetId);
  if(!container) return;
  container.innerHTML = '';
  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">${formatPrice(p.price)}</p>
      <p class="muted">${p.description}</p>
      <div style="margin-top:8px;">
        <a class="btn" href="${showDetailLink ? 'product-detail.html?id=' + encodeURIComponent(p.id) : '#'}">View</a>
        <button class="btn ghost" style="margin-left:8px;" onclick="addToCart('${p.id}', 1)">Add</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function populateCategorySelect(){
  const sel = document.getElementById('category');
  if(!sel) return;
  const cats = Array.from(new Set(products.map(p=>p.category))).sort();
  cats.forEach(c=>{
    const o = document.createElement('option');
    o.value = c; o.textContent = c; sel.appendChild(o);
  });
}

function applySearchAndRender(){
  const q = (document.getElementById('search')?.value || '').toLowerCase();
  const cat = (document.getElementById('category')?.value || '');
  const filtered = products.filter(p=>{
    return (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) && (cat ? p.category===cat : true);
  });
  renderGrid('products-grid', filtered);
}

function renderFeatured(){
  const featured = products.slice(0,4);
  renderGrid('featured-grid', featured);
}

// CART: localStorage simple cart object { id: qty }
function getCart(){ return JSON.parse(localStorage.getItem('pp_cart') || '{}'); }
function saveCart(c){ localStorage.setItem('pp_cart', JSON.stringify(c)); }
function addToCart(id, qty){
  const c = getCart();
  c[id] = (c[id] || 0) + qty;
  saveCart(c);
  updateCartCount();
}
function updateCartCount(){
  const c = getCart();
  const count = Object.values(c).reduce((s,n)=>s+n,0);
  const spans = document.querySelectorAll('#cart-count');
  spans.forEach(s=>s.textContent = count);
}

// Initialization on pages
document.addEventListener('DOMContentLoaded', ()=>{
  // update cart link count in header
  updateCartCount();
  // render featured on index
  renderFeatured();
  // render all products on products page
  populateCategorySelect();
  applySearchAndRender();
  document.getElementById('search')?.addEventListener('input', applySearchAndRender);
  document.getElementById('category')?.addEventListener('change', applySearchAndRender);

  // cart link click — show a simple cart summary alert
  document.getElementById('cart-link')?.addEventListener('click', (e)=>{
    e.preventDefault();
    const c = getCart();
    const entries = Object.entries(c);
    if(entries.length===0){ alert('Your cart is empty'); return; }
    let msg = 'Cart:\n';
    let total = 0;
    entries.forEach(([id,qty])=>{
      const p = products.find(x=>x.id===id);
      if(!p) return;
      msg += `${p.name} x${qty} — ${formatPrice(p.price*qty)}\n`;
      total += p.price*qty;
    });
    msg += '-------------------\nTotal: ' + formatPrice(total);
    if(confirm(msg + '\n\nProceed to checkout? (demo)')){
      alert('Checkout is a demo — this site does not process payments.');
    }
  });
});
