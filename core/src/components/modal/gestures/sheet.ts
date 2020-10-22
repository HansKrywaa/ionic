import { Animation } from '../../../interface';
import { GestureDetail, createGesture } from '../../../utils/gesture';
import { clamp } from '../../../utils/helpers';

// Defaults for the sheet swipe animation
export const SheetDefaults = {
  WRAPPER_KEYFRAMES() {
    return [
      { offset: 0, transform: 'translateY(0vh)' },
      { offset: 1, transform: 'translateY(100vh)' }
    ]
  },
  BACKDROP_KEYFRAMES() {
    return [
      { offset: 0, opacity: 'var(--backdrop-opacity)' },
      { offset: 1, opacity: 0 }
    ]
  }
};

// TODO
let offset = 0;

export const createSheetGesture = (
  el: HTMLIonModalElement,
  animation: Animation,
  breakpointChanged: (breakpoint: number) => void,
  onDismiss: () => void
) => {
  const contentEl = el.querySelector('ion-content');
  const height = window.innerHeight;
  let currentBreakpoint = el.initialBreakpoint!;
  const breakpoints = el.breakpoints!;
  // lowest breakpoint is at position 1, as position 0 is always 0
  const minBreakpoint = breakpoints[1];
  const maxBreakpoint = breakpoints[breakpoints.length - 1];
  const swipeToClose = el.swipeToClose;
  const wrapperAnimation = animation.childAnimations.find(ani => ani.id === 'wrapperAnimation');
  const backdropAnimation = animation.childAnimations.find(ani => ani.id === 'backdropAnimation');
  const initialWrapperKeyframes = SheetDefaults.WRAPPER_KEYFRAMES();
  const initialBackdropKeyframes = SheetDefaults.BACKDROP_KEYFRAMES();

  const canStart = () => true;

  const onStart = () => {
    // When the gesture starts we need to turn off the content scrolling
    // because the content shouldn't scroll unless it's fullscreen
    // TODO this does not work properly because sometimes you can scroll the content quickly
    if (contentEl) {
      contentEl.scrollY = false;
    }

    animation.progressStart(true, 1 - currentBreakpoint);
  };

  const onMove = (detail: GestureDetail) => {
    const target = detail.event.target as HTMLElement | null;

    const content = target!.closest('ion-content');

    if (content === null) {
      // If we're not dragging inside of the content we need to allow
      // the modal to drag higher than the maximum breakpoint
      console.log('we are dragging above content, go beyond max breakpoint');
    } else {
      // Target is in the content, we need to allow the modal to increase height
      // until the maximum breakpoint is reached and then allow scrolling the content
      content.scrollY = false;

      if (wrapperAnimation && maxBreakpoint) {
        wrapperAnimation.keyframes([
          { offset: 0, transform: `translateY(${(1 - maxBreakpoint) * 100}vh)` },
          { offset: 1, transform: `translateY(100vh)` }
        ]);
      }

      if (offset === 0.0001) {
        console.log('AT MAX BREAKPOINT start scrolling');
        content.scrollY = true;
      }
    }

    const initialStep = 1 - currentBreakpoint;
    offset = clamp(0.0001, initialStep + (detail.deltaY / height), 0.9999);

    console.log('offset', offset);

    animation.progressStep(offset);
  };

  const onEnd = (detail: GestureDetail) => {
    const velocity = detail.velocityY;
    // const step = clamp(0.0001, detail.deltaY / height, 0.9999);
    const threshold = (detail.deltaY + velocity * 1000) / height;
    const diff = currentBreakpoint - threshold;

    let closest = breakpoints.reduce((a, b) => {
        return Math.abs(b - diff) < Math.abs(a - diff) ? b : a;
      });

    if (closest === 0 && !swipeToClose) {
      closest = minBreakpoint;
    }

    const shouldRemainOpen = closest !== 0;
    currentBreakpoint = 0;

    // TODO this is not returning properly sometimes when velocity is fast
    console.log('closest is', closest);

    if (wrapperAnimation) {
      wrapperAnimation.keyframes([
        { offset: 0, transform: `translateY(${offset * 100}vh)` },
        { offset: 1, transform: `translateY(${(1 - closest) * 100}vh)` }
      ]);

      if (backdropAnimation) {
        backdropAnimation.keyframes([
          { offset: 0, opacity: `calc(var(--backdrop-opacity) * ${1 - offset})` },
          { offset: 1, opacity: `calc(var(--backdrop-opacity) * ${closest})` }
        ]);
      }

      animation.progressStep(0);
    }

    // const duration = (shouldRemainOpen) ? computeDuration(step * height, velocity) : computeDuration((1 - step) * height, velocity);

    gesture.enable(false);

    animation
      .onFinish(() => {
        if (shouldRemainOpen) {
          if (wrapperAnimation) {
            wrapperAnimation.keyframes(initialWrapperKeyframes);
            backdropAnimation?.keyframes(initialBackdropKeyframes);
            animation.progressStart(true, 1 - closest);
            currentBreakpoint = closest;
            breakpointChanged(currentBreakpoint);
          }

          if (contentEl) {
            contentEl.scrollY = true;
          }
          gesture.enable(true);
        }
      }, { oneTimeCallback: true })
      .progressEnd(1, 0, 300);

    if (!shouldRemainOpen) {
      onDismiss();
    }
  };

  const gesture = createGesture({
    el,
    gestureName: 'modalSheet',
    gesturePriority: 40,
    direction: 'y',
    threshold: 10,
    canStart,
    onStart,
    onMove,
    onEnd
  });
  return gesture;
};

// const computeDuration = (remaining: number, velocity: number) => {
//   return clamp(400, remaining / Math.abs(velocity * 1.1), 500);
// };
