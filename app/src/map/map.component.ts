import { HttpClient } from '@angular/common/http';
import {
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { map, tap } from 'rxjs';
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { CameraService } from '../camera/camera.service';
import { RenderService } from '../renderer/render.service';
import { SceneService } from '../scene/scene.service';

const SMALL_CLOUD = 'small_cloud.glb';
const BIG_CLOUD = 'big_cloud.glb';
const DATA_SOURCE = SMALL_CLOUD;

interface Point {
  // position data
  x: number;
  y: number;
  z: number;

  // color data
  red: number; // integers [0-255] inclusive
  green: number; // integers [0-255] inclusive
  blue: number; // integers [0-255] inclusive
  alpha: number; // integers [0-255] inclusive
}

@Component({
  standalone: true,
  selector: 'map-root',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  protected httpClient = inject(HttpClient);

  protected sceneService = inject(SceneService);
  protected renderService = inject(RenderService);
  protected cameraService = inject(CameraService);

  protected canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected controls = new OrbitControls(this.cameraService.getCamera());

  protected initialCameraPositionSet = false;

  protected init = effect(() => {
    const canvas = this.canvas().nativeElement;

    this.renderService.init(canvas);
    this.renderService.start();
    this.controls.connect(canvas);
  });

  protected fetchData = effect(() => {
    this.httpClient
      .get('http://localhost:4000/api/points', {
        params: {
          file: DATA_SOURCE,
        },
        observe: 'response',
        responseType: 'arraybuffer',
      })
      .pipe(
        map((res) => res.body),
        tap((data: ArrayBuffer | null) => {
          if (data === null) {
            console.error('null data from server!');
            return;
          }

          // If using the raw data for API option 1,
          // replace this with a call to loadRawPoints
          // this.loadRawPoints(points);
          this.loadGltfAsync(data);
        }),
      )
      .subscribe();
  });

  protected loadRawPoints(data: Point[]): void {
    const points = new Points();
    const geometry = new BufferGeometry();
    const positions = new Float32Array(data.length * 3);
    const colors = new Uint8Array(data.length * 4);

    data.forEach((point, index) => {
      const positionIndex = index * 3;
      positions[positionIndex] = point.x;
      positions[positionIndex + 1] = point.y;
      positions[positionIndex + 2] = point.z;

      const colorIndex = index * 4;
      colors[colorIndex] = point.red;
      colors[colorIndex + 1] = point.green;
      colors[colorIndex + 2] = point.blue;
      colors[colorIndex + 3] = point.alpha;
    });

    const positionAttribute = new BufferAttribute(positions, 3);
    const colorAttribute = new BufferAttribute(colors, 4, true);

    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', colorAttribute);

    points.geometry = geometry;
    points.material = new PointsMaterial({
      vertexColors: true,
      sizeAttenuation: false,
    });

    const bbox = new Box3();
    bbox.setFromObject(points);

    this.sceneService.addToScene(points);

    this.setInitialCameraPositionFromData(bbox);
  }

  protected async loadGltfAsync(data: ArrayBuffer): Promise<void> {
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(data, '');

    // find the data so it's visible to the user
    const bbox = new Box3();
    bbox.setFromObject(gltf.scene);
    this.sceneService.addToScene(gltf.scene);

    this.setInitialCameraPositionFromData(bbox);
  }

  protected setInitialCameraPositionFromData(bbox: Box3): void {
    if (this.initialCameraPositionSet) {
      // already set
      return;
    }

    const midpoint = new Vector3();
    midpoint.subVectors(bbox.max, bbox.min).divideScalar(2).add(bbox.min);
    const cameraPos = midpoint.clone();
    // move the camera above the data a bit
    cameraPos.z += 100;

    this.cameraService.setCameraPosition(cameraPos);
    this.cameraService.updateMatrixWorld();

    this.controls.maxDistance = 10000000; // magic big number
    this.controls.target = midpoint;
    this.controls.zoomToCursor = true;
    this.controls.saveState();

    // Make sure rotation is calculated correctly otherwise we will rotate the camera on the first user interaction.
    this.controls.update();

    this.initialCameraPositionSet = true;
  }
}
