import * as PIXI from 'pixi.js';

// https://github.com/Mwni/pixi-mousewheel
class MousewheelPlugin {
  constructor(app) {
    this.app = app;

    this.eventHandler = e => this.onMouseWheel(e);
    this.app.view.addEventListener('wheel', this.eventHandler, { passive: false });
  }

  onMouseWheel(e) {
    const target = this.findScrollTarget({ x: e.offsetX, y: e.offsetY });

    if (target) {
      e.preventDefault();
      target.emit('mousewheel', this.deriveNormalizedWheelDelta(e), e);
    }
  }

  findScrollTarget(pos) {
    const hit = this.app.renderer.plugins.interaction.hitTest(pos);

    if (hit && hit.interactiveMousewheel) return hit;
  }

  deriveNormalizedWheelDelta(e) {
    if (e.detail) {
      if (e.wheelDelta) {
        return e.wheelDelta / e.detail / 40 * (e.detail > 0 ? 1 : -1); // Opera
      }
      return -e.detail / 3; // Firefox

    }
    return e.wheelDelta / 120; // IE,Safari,Chrome

  }

  destroy() {
    this.app.view.removeEventListener('wheel', this.eventHandler);
  }
}

if (!PIXI.DisplayObject.prototype.interactiveMousewheel) {
  Object.defineProperty(PIXI.DisplayObject.prototype, 'interactiveMousewheel', {
    get() {
      return this._interactiveMousewheel;
    },
    set(enabled) {
      this._interactiveMousewheel = enabled;

      if (enabled && !this.interactive) {
        this.interactive = true;
      }
    },
  });

  PIXI.Application.registerPlugin({
    init(_options) {
      this._mousewheelPlugin = new MousewheelPlugin(this);
    },
    destroy() {
      this._mousewheelPlugin.destroy();
    },
  });
}
