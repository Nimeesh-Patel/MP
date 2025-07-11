import React, { useState } from 'react';

function IdeaForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [ideaType, setIdeaType] = useState('conjecture');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !body) return;
    onSubmit({ id: 0, title, body, idea_type: ideaType });
    setTitle('');
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
      <select value={ideaType} onChange={(e) => setIdeaType(e.target.value)}>
        <option value="conjecture">Conjecture</option>
        <option value="criticism">Criticism</option>
        <option value="synthesis">Synthesis</option>
      </select>
      <button type="submit">Post</button>
    </form>
  );
}

export default IdeaForm;
