import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// Theme color configuration
const COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#ff9800',
};

const initialTodoForm = {
  id: null,
  title: '',
  completed: false,
};

/**
 * PUBLIC_INTERFACE
 * Main App function: Full-featured SPA for authenticated CRUD on todos linked 
 * to the current supabase user. Handles signup, signin, signout, and all operations.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authView, setAuthView] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todoForm, setTodoForm] = useState(initialTodoForm);
  const [todoError, setTodoError] = useState('');
  const [savingTodo, setSavingTodo] = useState(false);

  // EFFECT: Theme switching via CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // EFFECT: Supabase auth session
  useEffect(() => {
    // On mount, get session
    const thisSession = supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  // EFFECT: Load todos on session (user) change
  useEffect(() => {
    if (session && session.user) {
      fetchTodos();
    } else {
      setTodos([]);
    }
    // eslint-disable-next-line
  }, [session]);

  // PUBLIC_INTERFACE
  // Toggle theme (light/dark), minimal UI impact as per spec
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Authentication handlers

  // PUBLIC_INTERFACE
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Email and password required.');
      setAuthLoading(false);
      return;
    }
    try {
      let result;
      if (authView === 'signup') {
        result = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (result.error) throw result.error;
        setAuthError('Signup succeeded! Please check email to confirm, then log in.');
        setAuthView('login');
      } else {
        result = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (result.error) throw result.error;
        setSession(result.data.session);
      }
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  };

  // PUBLIC_INTERFACE
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setTodos([]);
    setTodoForm(initialTodoForm);
    setAuthEmail('');
    setAuthPassword('');
  };

  // CRUD: Todos

  // PUBLIC_INTERFACE
  async function fetchTodos() {
    setTodosLoading(true);
    setTodoError('');
    try {
      const user_id = session?.user?.id;
      if (!user_id) throw new Error('User not logged in.');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTodos(data || []);
    } catch (err) {
      setTodoError('Failed to load todos: ' + err.message);
    }
    setTodosLoading(false);
  }

  // PUBLIC_INTERFACE
  async function handleTodoSubmit(e) {
    e.preventDefault();
    setTodoError('');
    setSavingTodo(true);
    const { title, completed, id } = todoForm;
    const user_id = session?.user?.id;
    if (!user_id) {
      setTodoError('Not authenticated.');
      setSavingTodo(false);
      return;
    }
    try {
      if (!title.trim()) {
        setTodoError('Title is required.');
        setSavingTodo(false);
        return;
      }

      // Create or update
      if (id) {
        // Update
        const { error } = await supabase
          .from('todos')
          .update({ title, completed })
          .eq('id', id)
          .eq('user_id', user_id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('todos')
          .insert([{ title, completed: false, user_id }]);
        if (error) throw error;
      }
      setTodoForm(initialTodoForm);
      fetchTodos();
    } catch (err) {
      setTodoError('Save failed: ' + err.message);
    }
    setSavingTodo(false);
  }

  // PUBLIC_INTERFACE
  async function handleDeleteTodo(id) {
    setTodoError('');
    try {
      const user_id = session?.user?.id;
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);
      if (error) throw error;
      fetchTodos();
    } catch (err) {
      setTodoError('Delete failed: ' + err.message);
    }
  }

  // PUBLIC_INTERFACE
  function handleEditTodo(todo) {
    setTodoForm({ id: todo.id, title: todo.title, completed: todo.completed });
  }

  // PUBLIC_INTERFACE
  async function handleToggleComplete(todo) {
    setTodoError('');
    try {
      const user_id = session?.user?.id;
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)
        .eq('user_id', user_id);
      if (error) throw error;
      fetchTodos();
    } catch (err) {
      setTodoError('Could not toggle completion: ' + err.message);
    }
  }

  // UI components

  function AuthForm() {
    return (
      <div className="auth-container" style={{ maxWidth: 340, margin: '40px auto', textAlign: 'left' }}>
        <h2 style={{ color: COLORS.primary, marginBottom: 16 }}>
          {authView === 'signup' ? 'Sign Up' : 'Log In'}
        </h2>
        <form onSubmit={handleAuth}>
          <label style={{ fontWeight: 500, display: 'block', margin: '12px 0 4px' }}>
            Email
            <input
              type="email"
              autoComplete="email"
              value={authEmail}
              required
              onChange={e => setAuthEmail(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '4px 0 0', fontSize: '1rem' }}
            />
          </label>
          <label style={{ fontWeight: 500, display: 'block', margin: '12px 0 4px' }}>
            Password
            <input
              type="password"
              minLength={6}
              autoComplete={authView === 'login' ? 'current-password' : 'new-password'}
              value={authPassword}
              required
              onChange={e => setAuthPassword(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '4px 0 0', fontSize: '1rem' }}
            />
          </label>
          <button
            type="submit"
            disabled={authLoading}
            style={{
              marginTop: 18,
              width: '100%',
              backgroundColor: COLORS.accent,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {authLoading ? 'Loading...' : (authView === 'signup' ? 'Create Account' : 'Log In')}
          </button>
        </form>
        <div style={{ marginTop: 14, color: '#e53935', fontSize: 14 }}>{authError}</div>
        <div style={{ marginTop: 18, fontSize: 14 }}>
          {authView === 'signup'
            ? <>Already have an account?{' '}
              <button style={{ color: COLORS.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => { setAuthView('login'); setAuthError(''); }}>Log In</button>
            </>
            : <>Need an account?{' '}
              <button style={{ color: COLORS.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => { setAuthView('signup'); setAuthError(''); }}>Sign Up</button>
            </>
          }
        </div>
      </div>
    );
  }

  function Header() {
    return (
      <header className="App-header" style={{
        background: COLORS.primary,
        color: "#fff",
        minHeight: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        borderBottom: `3px solid ${COLORS.accent}`,
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>TaskMaster</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {session?.user ? (
            <>
              <span style={{
                fontWeight: 400, fontSize: 16,
                background: COLORS.secondary, padding: '6px 12px', borderRadius: 8
              }}>
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: COLORS.accent,
                  color: "#fff",
                  fontSize: 14,
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >Logout</button>
            </>
          ) : null}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              marginLeft: session?.user ? 10 : 0,
              backgroundColor: COLORS.secondary,
              color: COLORS.accent,
              border: 'none',
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>
    );
  }

  function TodoForm() {
    return (
      <form onSubmit={handleTodoSubmit} style={{
        background: '#fff',
        border: `1px solid ${COLORS.primary}10`,
        borderRadius: 10,
        boxShadow: "0 1px 8px rgba(33,33,33,0.06)",
        padding: 24,
        margin: '24px auto',
        maxWidth: 400,
        textAlign: "left"
      }}>
        <h3 style={{ color: COLORS.primary, marginBottom: 14 }}>
          {todoForm.id ? 'Edit Todo' : 'Add Todo'}
        </h3>
        <label htmlFor="todo-title" style={{ fontWeight: 500 }}>Title</label>
        <input
          id="todo-title"
          type="text"
          value={todoForm.title}
          maxLength={120}
          required
          onChange={e => setTodoForm((f) => ({ ...f, title: e.target.value }))}
          style={{
            width: "100%", padding: 8, fontSize: '1.02rem', borderRadius: 4,
            border: `1px solid ${COLORS.primary}22`, marginBottom: 14
          }}
        />
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            id="todo-completed"
            type="checkbox"
            checked={todoForm.completed}
            onChange={e => setTodoForm((f) => ({ ...f, completed: e.target.checked }))}
            disabled={!todoForm.id}
          />
          <label htmlFor="todo-completed" style={{
            color: todoForm.completed ? COLORS.accent : COLORS.secondary,
            fontWeight: 500, fontSize: 15
          }}>
            Completed
          </label>
        </div>
        <button
          type="submit"
          disabled={savingTodo}
          style={{
            background: COLORS.primary,
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            fontSize: 16,
            marginRight: 12,
            cursor: "pointer"
          }}>
          {savingTodo ? "Saving..." : (todoForm.id ? 'Update' : 'Add Todo')}
        </button>
        {todoForm.id &&
          <button
            type="button"
            style={{
              background: COLORS.secondary,
              color: "#fff",
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer"
            }}
            onClick={() => setTodoForm(initialTodoForm)}
          >
            Cancel
          </button>
        }
        <div style={{ marginTop: 10, color: '#e53935', fontSize: 14 }}>{todoError}</div>
      </form>
    );
  }

  function TodosList() {
    if (todosLoading) return <div style={{ padding: 24 }}>Loading your todos...</div>;
    if (todos.length === 0) return <div style={{ padding: 24, color: COLORS.secondary }}>No todos yet. Add one above!</div>;
    return (
      <ul style={{
        maxWidth: 440, margin: '16px auto', listStyle: 'none',
        padding: 0
      }}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            padding: "12px 10px",
            marginBottom: 10,
            background: "#f8f9fa",
            borderLeft: `7px solid ${todo.completed ? COLORS.accent : COLORS.primary}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(120,120,120,0.07)",
            transition: "background .2s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
                style={{ accentColor: COLORS.accent, marginRight: 5 }}
                aria-label="Toggle complete"
              />
              <span style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : undefined,
                color: todo.completed ? COLORS.secondary : COLORS.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 500,
                fontSize: "1.02rem"
              }}>
                {todo.title}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                title="Edit todo"
                style={{
                  color: COLORS.primary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginRight: 1,
                  fontWeight: 600,
                  fontSize: 15
                }}
                onClick={() => handleEditTodo(todo)}
              >Edit</button>
              <button
                title="Delete todo"
                style={{
                  color: "#e53935",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 15
                }}
                onClick={() => {
                  // Confirm deletion
                  if (window.confirm('Delete this todo?')) handleDeleteTodo(todo.id);
                }}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="App" style={{
      minHeight: "100vh",
      background: "#fff",
      color: "#282c34"
    }}>
      <Header />
      <main style={{ maxWidth: 680, margin: "30px auto 0", padding: '0 1rem' }}>
        {session?.user ? (
          <>
            <div style={{
              margin: "30px auto",
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 2px 18px rgba(50,50,60,0.04)",
              textAlign: "center"
            }}>
              <h2 style={{ color: COLORS.accent, margin: 0 }}>Todo List</h2>
              <p style={{ color: COLORS.secondary, fontSize: 17, margin: "6px 0 6px" }}>
                Manage your tasks; only <b>your</b> todos are visible.
              </p>
            </div>
            <TodoForm />
            <TodosList />
          </>
        ) : (
          <AuthForm />
        )}
      </main>
      <footer style={{
        marginTop: 35,
        padding: "30px 16px 14px",
        textAlign: "center",
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: 1
      }}>
        TaskMaster &copy; {new Date().getFullYear()} &mdash; Powered by Supabase & React
      </footer>
    </div>
  );
}

export default App;
