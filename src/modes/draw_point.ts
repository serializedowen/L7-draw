import { IInteractionTarget, ILngLat, Scene } from '@antv/l7';
import { Feature, featureCollection, point } from '@turf/helpers';
import { DrawEvent, DrawModes } from '../util/constant';
import moveFeatures from '../util/move_features';
import { isPoint } from '../util/typeguards';
import DrawFeature, { IDrawFeatureOption } from './draw_feature';
export default class DrawPoint extends DrawFeature {
  protected pointFeatures: Feature[];

  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);
    this.type = 'point';
    this.setDrawMode(DrawModes.DRAW_POINT);
  }
  public drawFinish() {
    this.emit(DrawEvent.CREATE, this.currentFeature);
    this.emit(DrawEvent.MODE_CHANGE, DrawModes.SIMPLE_SELECT);
    this.disable();
  }

  public removeLatestVertex() {
    return null;
  }

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      ...super.getDefaultOptions(),
      title: '绘制点',
    };
  }

  protected onDragStart(e: IInteractionTarget) {
    return null;
  }
  protected onDragging(e: IInteractionTarget) {
    return null;
  }

  protected onDragEnd() {
    return null;
  }

  protected onClick(e: any) {
    if (!this.getDrawable()) {
      return;
    }
    if (this.drawStatus !== 'Drawing') {
      this.drawLayer.emit('unclick', null);
    }
    const lngLat = e.lngLat || e.lnglat;
    const feature = this.createFeature(lngLat);
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection([feature]));
    this.drawFinish();
  }

  protected moveFeature(delta: ILngLat): Feature {
    const newFeature = moveFeatures([this.currentFeature as Feature], delta);
    this.drawLayer.updateData(featureCollection(newFeature));
    this.drawVertexLayer.updateData(featureCollection(newFeature));
    this.currentFeature = newFeature[0];
    this.pointFeatures = newFeature;
    this.currentFeature.properties = {
      ...this.currentFeature.properties,
      pointFeatures: newFeature,
    };
    return this.currentFeature;
  }
  protected createFeature(
    p: ILngLat,
    id?: string,
    active: boolean = true,
  ): Feature {
    const feature = point([p.lng, p.lat], {
      id: id || this.getUniqId(),
      type: 'point',
      active,
      pointFeatures: [point([p.lng, p.lat])],
    });
    this.setCurrentFeature(feature as Feature);
    return feature;
  }
  protected initData(): boolean {
    const features: Feature[] = [];
    this.source.data.features.forEach(feature => {
      if (isPoint(feature)) {
        const p = {
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
        };
        features.push(this.createFeature(p, feature.properties?.id, false));
      }
    });
    this.source.data.features = features;
    return true;
  }

  protected editFeature(endPoint: ILngLat): void {
    this.createFeature(endPoint);
  }

  protected showOtherLayer() {
    return null;
  }

  protected hideOtherLayer() {
    return null;
  }
}
