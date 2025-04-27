declare module 'troika-three-text' {
    import * as THREE from 'three';

    export class Text extends THREE.Mesh {
        text: string;
        font?: string;
        fontSize?: number;
        letterSpacing?: number;
        lineHeight?: number | string;
        maxWidth?: number;
        overflowWrap?: string;
        textAlign?: string;
        textIndent?: number;
        whiteSpace?: string;
        anchorX?: number | string;
        anchorY?: number | string;
        color?: THREE.Color | string | number;
        colorRanges?: { [key: string]: THREE.Color | string | number };
        material?: THREE.Material | THREE.Material[];
        depthOffset?: number;
        clipRect?: [number, number, number, number];
        gpuAccelerateSDF?: boolean;
        sdfGlyphSize?: number | null;
        outlineWidth?: number | string;
        outlineColor?: THREE.Color | string | number;
        outlineOpacity?: number;
        outlineBlur?: number | string;
        outlineOffsetX?: number | string;
        outlineOffsetY?: number | string;
        strokeWidth?: number | string;
        strokeColor?: THREE.Color | string | number;
        strokeOpacity?: number;
        fillOpacity?: number;
        curveRadius?: number;
        orientation?: string;
        glyphGeometryDetail?: number;
        direction?: string;

        constructor();

        sync(callback?: () => void): void;
        dispose(): void;

        // Add other properties and methods as needed based on the library's API
    }
} 