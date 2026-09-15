import { Injectable } from '@angular/core';
import { Object3D, Scene } from 'three';

@Injectable({ providedIn: 'root' })
export class SceneService {
  protected scene = new Scene();

  public getScene(): Scene {
    return this.scene;
  }

  public addToScene(...objects: Object3D[]): void {
    this.scene.add(...objects);
  }

  public removeFromScene(...objects: Object3D[]): void {
    this.scene.remove(...objects);
  }
}
