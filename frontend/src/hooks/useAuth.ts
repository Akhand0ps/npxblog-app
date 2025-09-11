// Re-export the context-based auth hook to ensure a single source of truth
// across the app. This fixes UI not updating (e.g., Navbar) by making
// every consumer use the shared AuthContext state.
export { useAuth } from '../contexts/AuthContext';
