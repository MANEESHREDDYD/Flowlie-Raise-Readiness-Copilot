"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Company } from "@/lib/types";

const initial = { name:"", industry:"", stage:"Seed", target_raise:"", cash_balance:"", monthly_burn:"", current_arr:"", team_size:"", employees:"", contractors:"", primary_market:"", fundraise_goal:"" };

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key:string, value:string) => setForm(current => ({...current,[key]:value}));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const numeric = ["target_raise","cash_balance","monthly_burn","current_arr","team_size","employees","contractors"];
      const payload: Record<string,string|number> = {...form};
      numeric.forEach(key => payload[key] = Number(form[key as keyof typeof form]));
      const company = await api<Company>("/companies",{method:"POST",body:JSON.stringify(payload)});
      router.push(`/companies/${company.id}/edit-data`);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create company"); }
    finally { setSaving(false); }
  };
  return <AppLayout><PageHeader eyebrow="User-created company" title="Add a startup" description="Create the company profile first. You can add operating records and documents on the next screen."/>
    <form onSubmit={submit} className="card mx-auto max-w-4xl p-7"><div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-mint/10 p-3 text-mint"><Building2/></span><div><h2 className="text-xl font-semibold">Company profile</h2><p className="text-sm text-slate-500">Stored locally in SQLite.</p></div></div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company name" value={form.name} onChange={v=>set("name",v)} required/>
        <Field label="Industry" value={form.industry} onChange={v=>set("industry",v)} required/>
        <label className="form-label">Stage<select className="form-input" value={form.stage} onChange={e=>set("stage",e.target.value)}>{["Pre-Seed","Seed","Series A","Series B","Growth"].map(x=><option key={x}>{x}</option>)}</select></label>
        <Field label="Primary market" value={form.primary_market} onChange={v=>set("primary_market",v)} required/>
        {["target_raise","cash_balance","monthly_burn","current_arr","team_size","employees","contractors"].map(key=><Field key={key} label={key.replaceAll("_"," ")} type="number" min="0" value={form[key as keyof typeof form]} onChange={v=>set(key,v)} required/>)}
        <label className="form-label md:col-span-2">Fundraise goal<textarea className="form-input min-h-24" value={form.fundraise_goal} onChange={e=>set("fundraise_goal",e.target.value)} required/></label>
      </div>
      {error && <p className="mt-5 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-300">{error}</p>}
      <button className="button mt-6" disabled={saving}>{saving && <Loader2 size={16} className="animate-spin"/>} Create and add data</button>
    </form>
  </AppLayout>;
}

function Field({label,value,onChange,type="text",required=false,min}:{label:string;value:string;onChange:(v:string)=>void;type?:string;required?:boolean;min?:string}) {
  return <label className="form-label capitalize">{label}<input className="form-input" type={type} min={min} value={value} onChange={e=>onChange(e.target.value)} required={required}/></label>;
}
