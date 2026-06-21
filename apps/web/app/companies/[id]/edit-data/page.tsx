"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileSpreadsheet, FileUp, Loader2, Pencil, Play, Plus, Save, Trash2, Upload } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { api, upload } from "@/lib/api";
import { mapHeaders, parseCsv } from "@/lib/csv";
import { Company, DocumentRecord } from "@/lib/types";
import { useApi } from "@/lib/useApi";

type Field = { key: string; label: string; type?: "text"|"number"|"boolean"|"select"; options?: string[]; step?: string; nullable?: boolean; aliases?: string[] };

const sections = [
  "Company profile","Financials","Cap table","Headcount","Customer pipeline","Compliance checklist","Documents / notes",
];

export default function EditDataPage() {
  const { id } = useParams<{id:string}>();
  const company = useApi<Company>(`/companies/${id}`);
  const [active,setActive] = useState(sections[0]);
  return <AppLayout><PageHeader eyebrow="SQLite-backed data workspace" title={company.data ? `Edit ${company.data.name}` : "Edit company data"} description="Add, update, or remove the evidence used by the deterministic readiness engines." action={<div className="flex gap-2"><Link href={`/companies/${id}/run-analysis`} className="button"><Play size={15}/> Run analysis</Link><Link href={`/companies/${id}/dashboard`} className="button-secondary">Dashboard</Link></div>}/>
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">{sections.map(section=><button key={section} onClick={()=>setActive(section)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm ${active===section?"bg-mint text-slate-950":"bg-white/5 text-slate-400"}`}>{section}</button>)}</div>
    {active==="Company profile" && <ProfileEditor company={company.data} refresh={company.refresh}/>}
    {active==="Financials" && <RecordEditor companyId={id} title="Financial metrics" endpoint="financials" editBase="financials" fields={[
      {key:"month",label:"Month (YYYY-MM)",aliases:["period","date","yyyy-mm"]},{key:"revenue",label:"Revenue",type:"number",aliases:["sales","topline","top line","total revenue","income"]},{key:"expenses",label:"Expenses",type:"number",aliases:["costs","total expenses","spend","opex","operating expenses"]},{key:"cash_balance",label:"Cash balance",type:"number",aliases:["cash","cash on hand","bank balance","ending cash"]},{key:"burn",label:"Burn",type:"number",aliases:["burn rate","net burn","cash burn","monthly burn"]},{key:"gross_margin",label:"Gross margin (0–1)",type:"number",step:"0.01",aliases:["margin","gm","gross margin"]},
    ]}/>}
    {active==="Cap table" && <RecordEditor companyId={id} title="Cap table entries" endpoint="cap-table" editBase="cap-table" fields={[
      {key:"holder",label:"Holder",aliases:["name","shareholder","stakeholder","investor"]},{key:"type",label:"Security type",aliases:["security","class","instrument","share class"]},{key:"is_founder",label:"Founder / founding holder",type:"boolean",aliases:["founder","is founder","founding"]},{key:"ownership_percent",label:"Ownership %",type:"number",step:"0.01",nullable:true,aliases:["ownership","percent","equity","equity %","stake","%"]},{key:"shares",label:"Shares",type:"number",nullable:true,aliases:["share count","number of shares","units"]},{key:"notes",label:"Notes",nullable:true,aliases:["note","comment","remarks"]},
    ]}/>}
    {active==="Headcount" && <RecordEditor companyId={id} title="Headcount records" endpoint="headcount" editBase="headcount" fields={[
      {key:"name",label:"Name",aliases:["employee","person","full name"]},{key:"role",label:"Role",aliases:["title","position","job title"]},{key:"type",label:"Type",type:"select",options:["employee","contractor"],aliases:["employment type","worker type","classification"]},{key:"start_date",label:"Start date",aliases:["start","hire date","joined","start day"]},{key:"ip_assignment_signed",label:"IP assignment signed",type:"boolean",aliases:["ip signed","ip assignment","ip"]},{key:"monthly_cost",label:"Monthly cost",type:"number",aliases:["cost","salary","monthly salary","comp","compensation"]},
    ]}/>}
    {active==="Customer pipeline" && <RecordEditor companyId={id} title="Customer pipeline" endpoint="customer-pipeline" editBase="customer-pipeline" fields={[
      {key:"customer",label:"Customer",aliases:["account","client","company","name"]},{key:"stage",label:"Stage",aliases:["deal stage","status","pipeline stage"]},{key:"contract_value",label:"Contract value",type:"number",aliases:["value","acv","deal value","amount","tcv"]},{key:"probability",label:"Probability (0–1)",type:"number",step:"0.01",aliases:["prob","win probability","likelihood"]},{key:"expected_close_month",label:"Expected close",aliases:["close month","close date","expected close","close"]},{key:"revenue_concentration",label:"Concentration (0–1)",type:"number",step:"0.01",aliases:["concentration","rev concentration","revenue share"]},
    ]}/>}
    {active==="Compliance checklist" && <RecordEditor companyId={id} title="Compliance checklist" endpoint="compliance" editBase="compliance" fields={[
      {key:"item",label:"Item",aliases:["requirement","name","task","document"]},{key:"status",label:"Status",type:"select",options:["present","missing","needs_review","outdated"],aliases:["state"]},{key:"last_updated",label:"Last updated",nullable:true,aliases:["updated","date","last update"]},{key:"owner",label:"Owner",aliases:["responsible","assignee","owner name"]},
    ]}/>}
    {active==="Documents / notes" && <DocumentsEditor companyId={id}/>}
  </AppLayout>;
}

function ProfileEditor({company,refresh}:{company:Company|null;refresh:()=>Promise<void>}) {
  const [form,setForm] = useState<Record<string,string>>({});
  const [message,setMessage] = useState("");
  useEffect(()=>{ if(company) setForm(Object.fromEntries(Object.entries(company).filter(([key])=>!["id"].includes(key)).map(([k,v])=>[k,String(v??"")]))); },[company]);
  if(!company) return <div className="card p-7 muted">Loading profile…</div>;
  const numeric=["target_raise","cash_balance","monthly_burn","current_arr","team_size","employees","contractors"];
  const save=async(e:FormEvent)=>{e.preventDefault();try{const payload:Record<string,unknown>={...form};numeric.forEach(k=>payload[k]=Number(form[k]));delete payload.created_at;await api(`/companies/${company.id}`,{method:"PATCH",body:JSON.stringify(payload)});setMessage("Profile saved.");await refresh();}catch(err){setMessage(err instanceof Error?err.message:"Unable to save");}};
  return <form onSubmit={save} className="card p-7"><h2 className="text-xl font-semibold">Company profile</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{["name","industry","stage","target_raise","cash_balance","monthly_burn","current_arr","team_size","employees","contractors","primary_market","fundraise_goal"].map(key=><label className="form-label" key={key}>{key.replaceAll("_"," ")}{key==="stage"?<select className="form-input" value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}>{["Pre-Seed","Seed","Series A","Series B","Growth"].map(x=><option key={x}>{x}</option>)}</select>:<input className="form-input" type={numeric.includes(key)?"number":"text"} min={numeric.includes(key)?"0":undefined} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}</div><button className="button mt-5"><Save size={15}/> Save profile</button>{message&&<p className="mt-3 text-sm text-slate-400">{message}</p>}</form>;
}

function RecordEditor({companyId,title,endpoint,editBase,fields}:{companyId:string;title:string;endpoint:string;editBase:string;fields:Field[]}) {
  const records=useApi<Record<string,any>[]>(`/companies/${companyId}/${endpoint}`);
  const blank=useMemo(()=>Object.fromEntries(fields.map(f=>[f.key,f.type==="boolean"?"false":f.options?.[0]||""])),[fields]);
  const [form,setForm]=useState<Record<string,any>>(blank);
  const [editing,setEditing]=useState<number|null>(null);
  const [error,setError]=useState("");
  const submit=async(e:FormEvent)=>{e.preventDefault();setError("");try{const payload:Record<string,unknown>={};fields.forEach(field=>{const value=form[field.key];if(field.type==="number")payload[field.key]=value===""&&field.nullable?null:Number(value);else if(field.type==="boolean")payload[field.key]=value===true||value==="true";else payload[field.key]=value===""&&field.nullable?null:value;});await api(editing?`/${editBase}/${editing}`:`/companies/${companyId}/${endpoint}`,{method:editing?"PATCH":"POST",body:JSON.stringify(payload)});setEditing(null);setForm(blank);await records.refresh();}catch(err){setError(formatError(err));}};
  const edit=(row:Record<string,any>)=>{setEditing(row.id);setForm(Object.fromEntries(fields.map(f=>[f.key,String(row[f.key]??"")])));};
  const remove=async(id:number)=>{await api(`/${editBase}/${id}`,{method:"DELETE"});await records.refresh();};
  return <div className="space-y-6"><CsvImporter companyId={companyId} endpoint={endpoint} fields={fields} onImported={records.refresh}/>
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><form onSubmit={submit} className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{editing?"Edit":"Add"} record</h2>{editing&&<button type="button" className="text-xs text-slate-400" onClick={()=>{setEditing(null);setForm(blank)}}>Cancel</button>}</div><div className="mt-5 grid gap-4">{fields.map(field=><label className="form-label" key={field.key}>{field.label}{field.type==="select"?<select className="form-input" value={form[field.key]} onChange={e=>setForm({...form,[field.key]:e.target.value})}>{field.options?.map(x=><option key={x} value={x}>{x}</option>)}</select>:field.type==="boolean"?<select className="form-input" value={String(form[field.key])} onChange={e=>setForm({...form,[field.key]:e.target.value})}><option value="true">True</option><option value="false">False</option></select>:<input className="form-input" type={field.type||"text"} step={field.step} min={field.type==="number"?"0":undefined} max={["gross_margin","probability","revenue_concentration"].includes(field.key)?"1":field.key==="ownership_percent"?"100":undefined} value={form[field.key]??""} onChange={e=>setForm({...form,[field.key]:e.target.value})} required={!field.nullable}/>}</label>)}</div>{error&&<p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}<button className="button mt-5">{editing?<Save size={15}/>:<Plus size={15}/>} {editing?"Save changes":"Add record"}</button></form>
    <section><h2 className="mb-4 text-xl font-semibold">{title}</h2>{!records.data?.length?<div className="card p-8 text-center text-sm text-slate-500">No records yet. Add the first record using the form.</div>:<div className="space-y-3">{records.data.map(row=><article className="card p-4" key={row.id}><div className="flex items-start justify-between gap-3"><div className="grid flex-1 gap-2 sm:grid-cols-2">{fields.slice(0,4).map(field=><p key={field.key} className="text-sm"><span className="text-slate-500">{field.label}: </span><span className="text-slate-200">{String(row[field.key]??"—")}</span></p>)}</div><div className="flex gap-2"><button className="button-secondary !p-2" onClick={()=>edit(row)}><Pencil size={14}/></button><button className="button-secondary !p-2 text-rose-300" onClick={()=>remove(row.id)}><Trash2 size={14}/></button></div></div></article>)}</div>}</section></div></div>;
}

type CsvRow = { values: Record<string, unknown>; display: Record<string, string>; errors: string[] };

function CsvImporter({companyId,endpoint,fields,onImported}:{companyId:string;endpoint:string;fields:Field[];onImported:()=>Promise<void>}) {
  const [open,setOpen]=useState(false);
  const [raw,setRaw]=useState("");
  const [rows,setRows]=useState<CsvRow[]|null>(null);
  const [cols,setCols]=useState<{header:string;key:string|null}[]>([]);
  const [unmapped,setUnmapped]=useState<string[]>([]);
  const [importing,setImporting]=useState(false);
  const [message,setMessage]=useState("");

  const numericMax=(key:string)=>["gross_margin","probability","revenue_concentration"].includes(key)?1:key==="ownership_percent"?100:undefined;
  const sameOption=(a:string,b:string)=>a.toLowerCase().replace(/[_\s-]+/g," ").trim()===b.toLowerCase().replace(/[_\s-]+/g," ").trim();

  function analyze(text:string){
    setMessage("");
    const {headers,rows:dataRows}=parseCsv(text);
    if(!headers.length){setRows(null);setCols([]);setUnmapped([]);setMessage("No rows found in the CSV.");return;}
    const {map,unmapped:un}=mapHeaders(headers,fields);
    setCols(headers.map((h,i)=>({header:h,key:map[i]??null})));
    setUnmapped(un);
    const out:CsvRow[]=dataRows.map(cells=>{
      const mapped:Record<string,string>={};
      headers.forEach((_,i)=>{const k=map[i];if(k!==undefined)mapped[k]=(cells[i]??"").trim();});
      const values:Record<string,unknown>={};const display:Record<string,string>={};const errors:string[]=[];
      fields.forEach(f=>{
        const v=mapped[f.key]??"";display[f.key]=v;
        if(f.type==="number"){
          if(v===""){if(f.nullable)values[f.key]=null;else errors.push(`${f.label} is required`);}
          else{const n=Number(v);if(Number.isNaN(n))errors.push(`${f.label} must be a number`);else{if(n<0)errors.push(`${f.label} must be ≥ 0`);const mx=numericMax(f.key);if(mx!==undefined&&n>mx)errors.push(`${f.label} must be ≤ ${mx}`);values[f.key]=n;}}
        }else if(f.type==="boolean"){
          const t=v.toLowerCase();const truthy=["true","1","yes","y","t"].includes(t);const falsy=["false","0","no","n","f",""].includes(t);
          if(!truthy&&!falsy)errors.push(`${f.label} must be true/false`);values[f.key]=truthy;
        }else if(f.type==="select"){
          if(v==="")errors.push(`${f.label} is required`);
          else{const opt=f.options?.find(o=>sameOption(o,v));if(!opt)errors.push(`${f.label} must be one of ${f.options?.join(", ")}`);else values[f.key]=opt;}
        }else{
          if(v===""){if(f.nullable)values[f.key]=null;else errors.push(`${f.label} is required`);}
          else values[f.key]=v;
        }
      });
      if(fields.some(f=>f.key==="month")&&typeof values["month"]==="string"&&!/^\d{4}-\d{2}$/.test(values["month"] as string))errors.push("Month must be YYYY-MM");
      return {values,display,errors};
    });
    setRows(out);
  }

  const valid=rows?.filter(r=>r.errors.length===0)??[];
  const invalid=rows?.filter(r=>r.errors.length>0)??[];

  async function doImport(){
    if(!valid.length)return;
    setImporting(true);setMessage("");
    try{
      await api(`/companies/${companyId}/${endpoint}/bulk`,{method:"POST",body:JSON.stringify(valid.map(r=>r.values))});
      await onImported();
      setMessage(`Imported ${valid.length} row(s).${invalid.length?` ${invalid.length} invalid row(s) were NOT imported (shown below — fix the source and re-import).`:""}`);
      setRaw("");setRows(null);setCols([]);setUnmapped([]);
    }catch(err){setMessage(formatError(err));}
    finally{setImporting(false);}
  }

  return <div className="card p-5">
    <button type="button" className="flex w-full items-center justify-between text-left" onClick={()=>setOpen(o=>!o)}>
      <span className="flex items-center gap-2 font-semibold"><FileSpreadsheet size={16}/> Bulk CSV import</span>
      <span className="text-xs text-slate-500">{open?"Hide":"Show"}</span>
    </button>
    {open&&<div className="mt-4 space-y-4">
      <p className="text-xs text-slate-500">Paste CSV or choose a .csv file. Headers are matched to fields by name or common aliases; every row is validated and shown before import — nothing is imported silently.</p>
      <label className="card flex cursor-pointer items-center gap-3 p-3 text-sm"><Upload size={15}/> Choose .csv file<input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(file)file.text().then(t=>{setRaw(t);analyze(t);});}}/></label>
      <textarea className="form-input min-h-28 font-mono text-xs" placeholder={"e.g.\nmonth,revenue,burn\n2026-01,28000,59000"} value={raw} onChange={e=>setRaw(e.target.value)}/>
      <button type="button" className="button-secondary" onClick={()=>analyze(raw)} disabled={!raw.trim()}>Preview</button>
      {rows&&<div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">{cols.map((c,i)=><span key={i} className={`rounded px-2 py-0.5 ${c.key?"bg-emerald-400/10 text-emerald-300":"bg-rose-400/10 text-rose-300"}`}>{c.header} → {c.key??"ignored"}</span>)}</div>
        {unmapped.length>0&&<p className="text-xs text-amber-300">Unmapped columns (ignored, not imported): {unmapped.join(", ")}</p>}
        <p className="text-sm"><span className="font-semibold text-emerald-300">{valid.length} valid</span> · <span className="font-semibold text-rose-300">{invalid.length} invalid</span> of {rows.length} rows</p>
        <div className="max-h-72 overflow-auto rounded-lg border border-borderDark"><table className="w-full text-xs"><thead><tr><th className="px-2 py-1 text-left">#</th>{fields.map(f=><th key={f.key} className="px-2 py-1 text-left">{f.label}</th>)}<th className="px-2 py-1 text-left">Status</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i} className={r.errors.length?"bg-rose-500/[0.04]":""}><td className="px-2 py-1 text-slate-500">{i+1}</td>{fields.map(f=><td key={f.key} className="px-2 py-1 text-slate-300">{r.display[f.key]||"—"}</td>)}<td className="px-2 py-1">{r.errors.length?<span className="text-rose-300">{r.errors.join("; ")}</span>:<span className="text-emerald-300">valid</span>}</td></tr>)}</tbody></table></div>
        <button type="button" className="button" disabled={!valid.length||importing} onClick={doImport}>{importing?<Loader2 size={15} className="animate-spin"/>:<Plus size={15}/>} Import {valid.length} valid row{valid.length===1?"":"s"}</button>
      </div>}
      {message&&<p className="text-sm text-slate-300">{message}</p>}
    </div>}
  </div>;
}

function DocumentsEditor({companyId}:{companyId:string}) {
  const records=useApi<DocumentRecord[]>(`/companies/${companyId}/documents`);
  const [title,setTitle]=useState("");const [text,setText]=useState("");const [error,setError]=useState("");
  const add=async(e:FormEvent)=>{e.preventDefault();try{await api(`/companies/${companyId}/documents/text`,{method:"POST",body:JSON.stringify({title,text,status:"present"})});setTitle("");setText("");await records.refresh();}catch(err){setError(formatError(err));}};
  const uploadFile=async(file:File)=>{const body=new FormData();body.append("file",file);try{await upload(`/companies/${companyId}/documents/upload`,body);await records.refresh();}catch(err){setError(formatError(err));}};
  const edit=async(doc:DocumentRecord)=>{const nextTitle=window.prompt("Document title",doc.file_name);if(nextTitle===null)return;const nextText=window.prompt("Document text",doc.extracted_text);if(nextText===null)return;try{await api(`/documents/${doc.id}`,{method:"PATCH",body:JSON.stringify({file_name:nextTitle,extracted_text:nextText})});await records.refresh()}catch(err){setError(formatError(err))}};
  const remove=async(id:number)=>{await api(`/documents/${id}`,{method:"DELETE"});await records.refresh();};
  return <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><div className="space-y-5"><form onSubmit={add} className="card p-6"><h2 className="text-xl font-semibold">Paste a text note</h2><label className="form-label mt-5">Title<input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} required/></label><label className="form-label mt-4">Note<textarea className="form-input min-h-40" value={text} onChange={e=>setText(e.target.value)} required/></label><button className="button mt-5"><Plus size={15}/> Save and classify</button></form><label className="card flex cursor-pointer items-center gap-4 p-5"><FileUp className="text-mint"/><div><p className="font-semibold">Upload a file</p><p className="text-xs text-slate-500">TXT, CSV, JSON, PDF, DOCX, or XLSX</p></div><input className="hidden" type="file" onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0])}/></label>{error&&<p className="text-sm text-rose-300">{error}</p>}</div><section><h2 className="mb-4 text-xl font-semibold">Documents and notes</h2>{!records.data?.length?<div className="card p-8 text-center text-sm text-slate-500">No documents yet.</div>:<div className="space-y-3">{records.data.map(doc=><article className="card p-4" key={doc.id}><div className="flex justify-between gap-4"><div><p className="font-semibold">{doc.file_name}</p><div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><span>{doc.document_type} · {doc.category} · {doc.status}</span>{doc.document_type === "unknown" && <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-300">Unclassified — operator review needed</span>}</div>{doc.document_type === "unknown" && <p className="mt-2 text-xs text-rose-400">Stored as evidence, but not used as strong scoring support until reviewed.</p>}<p className="mt-3 line-clamp-3 text-sm text-slate-400">{doc.extracted_text}</p></div><div className="flex gap-2"><button className="button-secondary !h-9 !p-2" onClick={()=>edit(doc)}><Pencil size={14}/></button><button className="button-secondary !h-9 !p-2 text-rose-300" onClick={()=>remove(doc.id)}><Trash2 size={14}/></button></div></div></article>)}</div>}</section></div>;
}

function formatError(error:unknown){if(!(error instanceof Error))return"Unable to save";try{const parsed=JSON.parse(error.message);return parsed.detail?.map?.((item:any)=>item.msg).join(", ")||parsed.detail||error.message}catch{return error.message}}
