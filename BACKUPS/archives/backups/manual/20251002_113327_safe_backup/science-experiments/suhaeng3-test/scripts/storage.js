// storage.js - 매우 단순한 자동 저장
export function initBasicAutosave({ key, fields, delay = 300 }) {
  const inputs = fields.map(id => document.getElementById(id)).filter(Boolean);
  let timer;
  const save = () => {
    const data = {};
    inputs.forEach(i => data[i.id] = i.value);
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(save, delay); };
  inputs.forEach(i => i.addEventListener('input', schedule));
  // load
  try {
    const raw = localStorage.getItem(key);
    if(raw){
      const data = JSON.parse(raw);
      Object.entries(data).forEach(([k,v]) => { const el = document.getElementById(k); if(el) el.value = v; });
    }
  } catch {}
  // initial save after load to ensure structure
  schedule();
}
