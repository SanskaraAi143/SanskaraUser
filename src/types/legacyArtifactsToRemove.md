Legacy artifact system scheduled for removal:
- src/store/artifactsStore.ts
- src/components/artifacts/ArtifactUploader.tsx
- src/components/artifacts/ArtifactGallery.tsx
- src/components/chat/ChatComposer.tsx
- src/components/chat/RitualChat.tsx
- src/components/chat/GoogleLiveApiChat.tsx
- src/services/api/artifactsApi.ts

Any imports referencing:
useArtifactsStore, ArtifactUploader, ArtifactGallery, ChatComposer, RitualChat, GoogleLiveApiChat, fetchRecentArtifacts, uploadArtifact.

Next steps: remove files & purge imports, then adjust routes/exports.
