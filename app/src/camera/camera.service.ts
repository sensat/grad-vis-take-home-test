import { Injectable } from '@angular/core';
import { PerspectiveCamera, Vector3 } from 'three';

const CAMERA_FOV = 60;
const CAMERA_ASPECT = 1;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 999999;

@Injectable({ providedIn: 'root' })
export class CameraService {
  constructor() {
    this.camera.up.set(0, 0, 1);
  }

  protected camera = new PerspectiveCamera(
    CAMERA_FOV,
    CAMERA_ASPECT,
    CAMERA_NEAR,
    CAMERA_FAR,
  );

  public getCamera(): PerspectiveCamera {
    return this.camera;
  }

  public setCameraPosition(position: Vector3): void {
    this.camera.position.copy(position);
  }

  public updateMatrixWorld(): void {
    this.camera.updateMatrixWorld();
  }
}
