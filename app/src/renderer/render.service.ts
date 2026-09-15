import { inject, Injectable } from '@angular/core';
import Stats from 'stats.js';
import { WebGLRenderer } from 'three';
import { CameraService } from '../camera/camera.service';
import { SceneService } from '../scene/scene.service';

@Injectable({ providedIn: 'root' })
export class RenderService {
  private sceneService = inject(SceneService);
  private cameraService = inject(CameraService);

  protected stats = new Stats();

  private initialised = false;
  protected renderer: WebGLRenderer | null = null;
  protected active = false;
  protected animationFrame: number = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialised) {
      this.renderer?.dispose();
    }
    if (this.active) {
      this.stop();
    }

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    this.cameraService.getCamera().aspect = canvas.width / canvas.height;
    this.cameraService.getCamera().updateProjectionMatrix();

    // show fps
    this.stats.showPanel(0);
    window.document.body.appendChild(this.stats.dom);

    this.initialised = true;
  }

  render(_timestamp: number) {
    if (!this.initialised) {
      throw new Error('must initialise renderer before rendering');
    }
    if (!this.renderer) {
      throw new Error('cannot render without renderer');
    }

    this.stats.begin();

    this.renderer.render(
      this.sceneService.getScene(),
      this.cameraService.getCamera(),
    );

    this.stats.end();

    // continue rendering frames until stopped
    if (this.active) {
      this.animationFrame = window.requestAnimationFrame((ts) =>
        this.render(ts),
      );
    }
  }

  start() {
    if (!this.initialised) {
      throw new Error('must initialise renderer first!');
    }

    this.animationFrame = window.requestAnimationFrame((ts) => this.render(ts));
    this.active = true;
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.active = false;
  }
}
