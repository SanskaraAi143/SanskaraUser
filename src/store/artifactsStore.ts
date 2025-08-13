// LEGACY REMOVED: artifactsStore
// This legacy wedding-scoped artifacts system has been removed in favor of session-scoped sessionArtifactsStore.
// Any usage should migrate to useSessionArtifactsStore.
// Intentionally exporting a dummy hook that throws to surface unintended usages early.
export const useArtifactsStore = () => { throw new Error('useArtifactsStore has been removed. Migrate to sessionArtifactsStore.'); };
