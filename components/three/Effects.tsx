'use client';

import { EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export default function Effects() {
  return (
    <EffectComposer>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}
