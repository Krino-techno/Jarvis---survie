const KEY="jarvis-survie-v1";
const defaults={water:24,people:2,waterTarget:2,food:14,checks:{},kit:{},places:[],items:[],contacts:[],notes:"",messageTemplate:undefined};
let data=load();
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaults}}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render();toast("Enregistré sur cet appareil");}
function toast(s){const el=document.getElementById("toast");el.textContent=s;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function removeButton(type,i){return `<button class="remove" data-remove="${type}" data-index="${i}" type="button">Supprimer</button>`}
function renderList(id,arr,type,sub){document.getElementById(id).innerHTML=arr.length?arr.map((x,i)=>`<div class="saved-item"><div><b>${esc(x.name)}</b><small>${esc(sub(x))}</small></div>${removeButton(type,i)}</div>`).join(""):`<p class="muted small">Aucun élément enregistré pour le moment.</p>`}
function render(){
 document.querySelectorAll("[data-check]").forEach(el=>el.checked=!!data.checks[el.dataset.check]);
 document.querySelectorAll("[data-kit]").forEach(el=>el.checked=!!data.kit[el.dataset.kit]);
 const total=document.querySelectorAll("[data-check]").length,done=[...document.querySelectorAll("[data-check]")].filter(x=>data.checks[x.dataset.check]).length;
 document.getElementById("progressDisplay").textContent=Math.round(done/total*100);
 document.getElementById("waterDisplay").textContent=data.water;
 document.getElementById("foodDisplay").textContent=data.food;
 const days=(Number(data.waterTarget)>0&&Number(data.people)>0)?Number(data.water)/(Number(data.waterTarget)*Number(data.people)):0;
 document.getElementById("waterDays").textContent=`${Number.isFinite(days)?days.toLocaleString("fr-FR",{maximumFractionDigits:1}):0} jours estimés`;
 document.getElementById("waterInput").value=data.water;document.getElementById("peopleInput").value=data.people;document.getElementById("waterTarget").value=data.waterTarget;document.getElementById("foodInput").value=data.food;
 document.getElementById("waterResult").textContent=`${Number.isFinite(days)?days.toLocaleString("fr-FR",{maximumFractionDigits:1}):0} jours`;
 document.getElementById("notes").value=data.notes||"";
 if(data.messageTemplate!==undefined)document.getElementById("messageTemplate").value=data.messageTemplate;
 renderList("placesList",data.places,"place",x=>x.detail);
 renderList("itemsList",data.items,"item",x=>`Quantité : ${x.qty}`);
 renderList("contactsList",data.contacts,"contact",x=>`${x.info}${x.meet?"\nRendez-vous : "+x.meet:""}`);
}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===btn));document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===btn.dataset.tab));window.scrollTo({top:0,behavior:"smooth"})}));
document.querySelectorAll("[data-check]").forEach(el=>el.addEventListener("change",()=>{data.checks[el.dataset.check]=el.checked;localStorage.setItem(KEY,JSON.stringify(data));render()}));
document.querySelectorAll("[data-kit]").forEach(el=>el.addEventListener("change",()=>{data.kit[el.dataset.kit]=el.checked;localStorage.setItem(KEY,JSON.stringify(data))}));
document.getElementById("saveStocks").addEventListener("click",()=>{data.water=Math.max(0,Number(document.getElementById("waterInput").value)||0);data.people=Math.max(1,Number(document.getElementById("peopleInput").value)||1);data.waterTarget=Math.max(.1,Number(document.getElementById("waterTarget").value)||2);data.food=Math.max(0,Number(document.getElementById("foodInput").value)||0);save()});
document.getElementById("placeForm").addEventListener("submit",e=>{e.preventDefault();data.places.push({name:document.getElementById("placeName").value.trim(),detail:document.getElementById("placeAddress").value.trim()});e.target.reset();save()});
document.getElementById("itemForm").addEventListener("submit",e=>{e.preventDefault();data.items.push({name:document.getElementById("itemName").value.trim(),qty:document.getElementById("itemQty").value.trim()});e.target.reset();save()});
document.getElementById("contactForm").addEventListener("submit",e=>{e.preventDefault();data.contacts.push({name:document.getElementById("contactName").value.trim(),info:document.getElementById("contactInfo").value.trim(),meet:document.getElementById("contactMeet").value.trim()});e.target.reset();save()});
document.addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;const {remove,index}=b.dataset;const typeMap={place:"places",item:"items",contact:"contacts"};data[typeMap[remove]].splice(Number(index),1);save()});
document.getElementById("notes").addEventListener("change",e=>{data.notes=e.target.value;localStorage.setItem(KEY,JSON.stringify(data));toast("Notes enregistrées")});
document.getElementById("messageTemplate").addEventListener("change",e=>{data.messageTemplate=e.target.value;localStorage.setItem(KEY,JSON.stringify(data))});
document.getElementById("copyMessage").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(document.getElementById("messageTemplate").value);toast("Message copié")}catch(e){document.getElementById("messageTemplate").select();toast("Sélectionne puis copie le message")}});
document.getElementById("exportData").addEventListener("click",()=>{data.notes=document.getElementById("notes").value;data.messageTemplate=document.getElementById("messageTemplate").value;const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="jarvis-survie-sauvegarde.json";a.click();URL.revokeObjectURL(url);toast("Sauvegarde exportée")});
document.getElementById("importData").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());data={...structuredClone(defaults),...incoming};save();toast("Sauvegarde importée")}catch(err){toast("Fichier de sauvegarde invalide")}e.target.value=""});
document.getElementById("clearData").addEventListener("click",()=>{if(confirm("Effacer toutes les données enregistrées par JARVIS SURVIE sur cet appareil ? Cette action est irréversible si aucune sauvegarde n’existe.")){localStorage.removeItem(KEY);data=load();render();toast("Données locales effacées")}});
document.getElementById("network").textContent=navigator.onLine?"PRÊT · DONNÉES LOCALES":"HORS LIGNE";
window.addEventListener("online",()=>document.getElementById("network").textContent="PRÊT · DONNÉES LOCALES");
window.addEventListener("offline",()=>document.getElementById("network").textContent="HORS LIGNE");
document.getElementById("today").textContent=new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();