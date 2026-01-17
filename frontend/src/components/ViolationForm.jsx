import React, {useState} from 'react'
import axios from 'axios'

export default function ViolationForm(){
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');

  async function submit(e){
    e.preventDefault();
    if (!user) { alert('Login to report'); return; }
    if (!location || !desc) { alert('Fill required fields'); return; }
    const fd = new FormData();
    fd.append('reporter', user.username);
    fd.append('location', location);
    fd.append('image', file);
    fd.append('slot_id', '');
    fd.append('description', desc);
    try {
      await axios.post('http://localhost:4000/api/violations/report', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Reported. Traffic will review.');
      setLocation(''); setDesc(''); setFile(null);
    } catch(e){ alert('Report failed'); console.error(e); }
  }

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-bold">Report Parking Violation</h3>
      <p className="text-slate-500">Help us maintain order by reporting illegal parking incidents</p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Location *</label>
          <input value={location} onChange={e=>setLocation(e.target.value)} className="w-full mt-2 border rounded-md px-3 py-2" placeholder="e.g., Main Street near City Hall"/>
        </div>

        <div>
          <label className="text-sm font-medium">Description *</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full mt-2 border rounded-md px-3 py-2" rows="4" placeholder="Provide details about the violation..."></textarea>
        </div>

        <div>
          <label className="text-sm font-medium">Upload Photo (optional)</label>
          <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-2" />
        </div>

        <div>
          <button className="btn-primary" type="submit">Report Violation</button>
        </div>
      </form>
    </div>
  )
}
