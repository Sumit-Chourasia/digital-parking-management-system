import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Auth(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    setErr('');
    try {
      const r = await axios.post('http://localhost:4000/api/login', { username, password });
      localStorage.setItem('dp_user', JSON.stringify({ username: r.data.username, role: r.data.role }));
      navigate('/');
      window.location.reload();
    } catch (e) {
      const message = e.response?.data?.error || 'Login failed';
      setErr(message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-slate-500 mb-4">Enter your credentials (demo: user1/user1pass)</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mt-1 border rounded-md px-3 py-2" placeholder="your username" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 border rounded-md px-3 py-2" placeholder="password" />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Sign In</button>
            <button type="button" onClick={()=>{ setUsername('user1'); setPassword('user1pass'); }} className="btn-ghost">Quick demo</button>
          </div>
        </form>
      </div>
    </div>
  )
}
