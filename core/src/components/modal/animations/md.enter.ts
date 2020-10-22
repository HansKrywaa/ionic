import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';

/**
 * Md Modal Enter Animation
 */
export const mdEnterAnimation = (baseEl: HTMLElement): Animation => {
  const isSheetStyle = (baseEl as HTMLIonModalElement).breakpoints!.length > 0;
  const initialBreakpoint = (baseEl as HTMLIonModalElement).initialBreakpoint;
  const initialHeight = initialBreakpoint !== undefined ? `${100 - (initialBreakpoint * 100)}vh` : '0vh';
  const backdropMultiplyFactor = initialBreakpoint || 1;

  const baseAnimation = createAnimation();
  const backdropAnimation = createAnimation('backdropAnimation');
  const wrapperAnimation = createAnimation('wrapperAnimation');

  backdropAnimation
    .addElement(baseEl.querySelector('ion-backdrop')!)
    .fromTo('opacity', 0.01, `calc(${backdropMultiplyFactor} * var(--backdrop-opacity))`)
    .beforeStyles({
      'pointer-events': 'none'
    })
    .afterClearStyles(['pointer-events']);

  if (isSheetStyle) {
    wrapperAnimation
      .addElement(baseEl.querySelectorAll('.modal-wrapper')!)
      .beforeStyles({ 'opacity': 1 })
      .fromTo('transform', 'translateY(100vh)', `translateY(${initialHeight})`);
  } else {
    wrapperAnimation
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: 0.01, transform: 'translateY(40px)' },
        { offset: 1, opacity: 1, transform: 'translateY(0px)' }
      ]);
  }

  return baseAnimation
    .addElement(baseEl)
    .easing('cubic-bezier(0.36,0.66,0.04,1)')
    .duration(isSheetStyle ? 500 : 280)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
