import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trainService } from '../../services';

const emptyTrain = {
  trainNumber: '',
  name: '',
  source: '',
  destination: '',
  departureTime: '',
  arrivalTime: '',
  durationMinutes: '',
  trainType: 'Express',
  classes: [{ type: 'SL', totalSeats: 72, fare: 500 }],
};

export default function ManageTrains() {
  const [trains, setTrains] = useState([]);
  const [form, setForm] = useState(emptyTrain);
  const [error, setError] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ trainId: '', date: '' });
  const [scheduleMsg, setScheduleMsg] = useState('');

  const load = () => trainService.listAll().then((data) => setTrains(data.trains));
  useEffect(load, []);

  const updateClass = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      classes: f.classes.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    }));
  };

  const addClassRow = () => {
    setForm((f) => ({ ...f, classes: [...f.classes, { type: 'AC3', totalSeats: 72, fare: 1000 }] }));
  };

  const handleCreateTrain = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await trainService.create({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        classes: form.classes.map((c) => ({
          ...c,
          totalSeats: Number(c.totalSeats),
          fare: Number(c.fare),
        })),
      });
      setForm(emptyTrain);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create train.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this train?')) return;
    await trainService.remove(id);
    load();
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setScheduleMsg('');
    try {
      await trainService.createSchedule(scheduleForm);
      setScheduleMsg('Schedule created.');
      setScheduleForm({ trainId: '', date: '' });
    } catch (err) {
      setScheduleMsg(err.response?.data?.message || 'Could not create schedule.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/admin" className="text-sm text-rail-night underline">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-rail-night mt-2 mb-8">Manage trains</h1>

      <div className="grid sm:grid-cols-2 gap-8 mb-12">
        <form onSubmit={handleCreateTrain} className="border border-rail-line rounded-sm p-5 bg-white space-y-3">
          <h2 className="font-medium text-rail-charcoal mb-2">Add a train</h2>
          {error && <p className="text-sm text-rail-alert">{error}</p>}
          <input
            required
            placeholder="Train number (e.g. 12301)"
            value={form.trainNumber}
            onChange={(e) => setForm({ ...form, trainNumber: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Train name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              placeholder="Source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Destination"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              required
              placeholder="Dep. (14:30)"
              value={form.departureTime}
              onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Arr. (09:15)"
              value={form.arrivalTime}
              onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              placeholder="Duration (min)"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <select
            value={form.trainType}
            onChange={(e) => setForm({ ...form, trainType: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm bg-white"
          >
            {['Express', 'Superfast', 'Passenger', 'Rajdhani', 'Shatabdi'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <p className="text-xs text-rail-muted pt-2">Classes</p>
          {form.classes.map((c, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <select
                value={c.type}
                onChange={(e) => updateClass(idx, 'type', e.target.value)}
                className="border border-rail-line rounded-sm px-2 py-1.5 text-sm bg-white"
              >
                {['SL', 'AC3', 'AC2', 'AC1', 'GEN'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Seats"
                value={c.totalSeats}
                onChange={(e) => updateClass(idx, 'totalSeats', e.target.value)}
                className="border border-rail-line rounded-sm px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Fare"
                value={c.fare}
                onChange={(e) => updateClass(idx, 'fare', e.target.value)}
                className="border border-rail-line rounded-sm px-2 py-1.5 text-sm"
              />
            </div>
          ))}
          <button type="button" onClick={addClassRow} className="text-xs text-rail-night underline">
            + Add class
          </button>

          <button
            type="submit"
            className="w-full bg-rail-night text-white rounded-sm py-2 font-medium hover:bg-rail-nightlight mt-2"
          >
            Create train
          </button>
        </form>

        <form onSubmit={handleCreateSchedule} className="border border-rail-line rounded-sm p-5 bg-white space-y-3 h-fit">
          <h2 className="font-medium text-rail-charcoal mb-2">Add a schedule (a train running on a date)</h2>
          {scheduleMsg && <p className="text-sm text-rail-muted">{scheduleMsg}</p>}
          <select
            required
            value={scheduleForm.trainId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, trainId: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm bg-white"
          >
            <option value="">Select train…</option>
            {trains.map((t) => (
              <option key={t._id} value={t._id}>
                {t.trainNumber} — {t.name}
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={scheduleForm.date}
            onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-rail-amber text-rail-night rounded-sm py-2 font-medium hover:bg-rail-amberdark"
          >
            Create schedule
          </button>
        </form>
      </div>

      <h2 className="font-medium text-rail-charcoal mb-3">All trains</h2>
      <div className="border border-rail-line rounded-sm bg-white divide-y divide-rail-line">
        {trains.map((t) => (
          <div key={t._id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-mono text-rail-muted mr-2">#{t.trainNumber}</span>
              <span className="text-rail-charcoal">{t.name}</span>
              <span className="text-rail-muted ml-2">
                {t.source} → {t.destination}
              </span>
            </div>
            <button onClick={() => handleDelete(t._id)} className="text-rail-alert underline">
              Delete
            </button>
          </div>
        ))}
        {trains.length === 0 && <p className="px-4 py-6 text-sm text-rail-muted text-center">No trains yet.</p>}
      </div>
    </div>
  );
}
