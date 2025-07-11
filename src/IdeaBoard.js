import React, { useEffect, useState } from 'react';
import IdeaForm from './IdeaForm';

function IdeaBoard() {
  const [ideas, setIdeas] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const loadIdeas = async () => {
    const res = await fetch(`${apiUrl}/ideas`);
    const data = await res.json();
    setIdeas(data);
  };

  useEffect(() => { loadIdeas(); }, []);

  const handleNewIdea = async (idea) => {
    await fetch(`${apiUrl}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea)
    });
    loadIdeas();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Open Ideas</h2>
      <IdeaForm onSubmit={handleNewIdea} />
      <ul>
        {ideas.map((i) => (
          <li key={i.id}>
            <strong>[{i.idea_type}]</strong> {i.title}
            <p>{i.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IdeaBoard;
