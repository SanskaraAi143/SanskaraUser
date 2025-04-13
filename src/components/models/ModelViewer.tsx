
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage } from '@react-three/drei';
import PanditModel from './PanditModel';

interface ModelViewerProps {
  modelType?: 'pandit' | string;
  height?: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelType = 'pandit', height = '300px' }) => {
  return (
    <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {modelType === 'pandit' && <PanditModel />}
          </Stage>
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate={false} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;
