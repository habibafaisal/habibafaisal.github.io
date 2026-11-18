import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = process.cwd();
const contentRoot = resolve(root, 'src/content');
const port = 4322;

function cleanSegment(value) {
  const cleaned = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!cleaned) throw new Error('Use letters or numbers for the category and slug.');
  return cleaned;
}

function quote(value) {
  return JSON.stringify(String(value));
}

function parsePost(source, path) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid front matter in ${path}`);
  const fields = Object.fromEntries([...match[1].matchAll(/^(title|description|date|updated|draft):\s*(.+)$/gm)].map(([, key, value]) => {
    const trimmed = value.trim();
    return [key, trimmed.startsWith('"') ? JSON.parse(trimmed) : trimmed];
  }));
  const id = relative(contentRoot, path).replace(/\\/g, '/').replace(/\.md$/, '');
  return { id, category: id.split('/')[0], slug: id.split('/')[1], body: match[2].trimEnd(), ...fields };
}

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) files.push(...await filesIn(path));
    else if (entry.endsWith('.md') && !entry.startsWith('_')) files.push(path);
  }
  return files;
}

async function listPosts() {
  const files = await filesIn(contentRoot);
  return Promise.all(files.map(async (path) => parsePost(await readFile(path, 'utf8'), path)));
}

async function readBody(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

async function savePost(data) {
  const category = cleanSegment(data.category);
  const slug = cleanSegment(data.slug || data.title);
  const path = resolve(contentRoot, category, `${slug}.md`);
  if (!path.startsWith(`${contentRoot}${sep}`)) throw new Error('Invalid post path.');
  const today = new Date().toISOString().slice(0, 10);
  let date = today;
  let updated = '';
  try {
    const existing = parsePost(await readFile(path, 'utf8'), path);
    date = existing.date;
    updated = today;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const frontMatter = [
    '---',
    `title: ${quote(data.title)}`,
    `description: ${quote(data.description || '')}`,
    `date: ${date}`,
    updated && `updated: ${updated}`,
    data.draft ? 'draft: true' : '',
    '---',
  ].filter(Boolean).join('\n');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${frontMatter}\n\n${String(data.body || '').trim()}\n`, { encoding: 'utf8', flag: 'w' });
  return { id: `${category}/${slug}` };
}

const page = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Site editor</title>
<style>
  :root{font-family:system-ui,sans-serif;color:#1c1b19;background:#fbfaf7}body{max-width:1100px;margin:0 auto;padding:32px 20px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #e4e0d8;padding-bottom:18px}h1{font-size:24px;margin:0}main{display:grid;grid-template-columns:260px 1fr;gap:32px;margin-top:28px}button,input,textarea,select{font:inherit}button{cursor:pointer;border:1px solid #9a3b1f;background:#9a3b1f;color:#fff;border-radius:5px;padding:8px 12px}button.secondary{background:transparent;color:#9a3b1f}#posts{display:grid;gap:8px}.post{width:100%;text-align:left;background:transparent;color:#1c1b19;border:1px solid #e4e0d8}.post small{display:block;color:#6b6760;margin-top:3px}form{display:grid;gap:16px}label{display:grid;gap:6px;font-size:14px;font-weight:600}input,textarea,select{border:1px solid #bdb7ad;border-radius:5px;padding:9px;background:#fff;color:#1c1b19}textarea{min-height:340px;line-height:1.55;font-family:ui-monospace,SFMono-Regular,monospace}.row{display:grid;grid-template-columns:1fr 1fr 150px;gap:12px}.actions{display:flex;gap:10px;align-items:center}.status{color:#6b6760;font-size:14px}@media(max-width:700px){main{grid-template-columns:1fr}.row{grid-template-columns:1fr}}
</style>
<body><header><div><h1>Site editor</h1><div class="status">Saves Markdown locally. Publish commits and pushes to GitHub.</div></div><button id="publish">Publish changes</button></header>
<main><aside><button class="secondary" id="new">+ New post</button><div id="posts"></div></aside><section><form id="form"><div class="row"><label>Category<input name="category" placeholder="writing" required></label><label>Slug<input name="slug" placeholder="generated from title"></label></div><label>Title<input name="title" required></label><label>Description<input name="description" required></label><label>Content (Markdown)<textarea name="body" required></textarea></label><label><span><input name="draft" type="checkbox"> Keep as draft</span></label><div class="actions"><button>Save locally</button><span id="status" class="status"></span></div></form></section></main>
<script>
const form=document.querySelector('#form'), posts=document.querySelector('#posts'), status=document.querySelector('#status');
let all=[];
function fill(post={category:'writing',title:'',description:'',slug:'',body:'',draft:false}){for(const [key,value] of Object.entries(post)){const field=form.elements[key];if(field)field.type==='checkbox'?field.checked=value==='true'||value===true:field.value=value}status.textContent=''}
async function load(){all=await fetch('/api/posts').then(r=>r.json());posts.innerHTML='';for(const post of all.sort((a,b)=>b.date.localeCompare(a.date))){const button=document.createElement('button');button.type='button';button.className='post';button.innerHTML=post.title+'<small>'+post.category+'/'+post.slug+'</small>';button.onclick=()=>fill(post);posts.append(button)}}
async function request(url, options){const response=await fetch(url,options);const result=await response.json();if(!response.ok)throw Error(result.error);return result}
form.onsubmit=async event=>{event.preventDefault();status.textContent='Saving…';try{const data=Object.fromEntries(new FormData(form));data.draft=form.elements.draft.checked;const result=await request('/api/posts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});status.textContent='Saved '+result.id+'. Publish when ready.';await load()}catch(error){status.textContent=error.message}}
document.querySelector('#new').onclick=()=>fill();document.querySelector('#publish').onclick=async()=>{status.textContent='Publishing…';try{const result=await request('/api/publish',{method:'POST'});status.textContent=result.message}catch(error){status.textContent=error.message}};load();
</script></body></html>`;

createServer(async (request, response) => {
  const send = (status, data) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(data)); };
  try {
    if (request.method === 'GET' && request.url === '/') { response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(page); }
    else if (request.method === 'GET' && request.url === '/api/posts') send(200, await listPosts());
    else if (request.method === 'POST' && request.url === '/api/posts') send(200, await savePost(await readBody(request)));
    else if (request.method === 'POST' && request.url === '/api/publish') {
      await exec('git', ['add', 'src/content'], { cwd: root });
      let hasChanges = false;
      try { await exec('git', ['diff', '--cached', '--quiet'], { cwd: root }); }
      catch (error) { if (error.code === 1) hasChanges = true; else throw error; }
      if (!hasChanges) return send(200, { message: 'No saved post changes to publish.' });
      await exec('git', ['commit', '-m', 'Publish site content'], { cwd: root });
      await exec('git', ['push', 'origin', 'main'], { cwd: root });
      send(200, { message: 'Published. GitHub Pages is deploying your changes.' });
    } else send(404, { error: 'Not found' });
  } catch (error) { send(400, { error: error.message || 'Something went wrong.' }); }
}).listen(port, '127.0.0.1', () => console.log(`Editor: http://127.0.0.1:${port}`));
