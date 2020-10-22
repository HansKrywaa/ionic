import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';

/**
 * Md Modal Leave Animation
 */
export const mdLeaveAnimation = (
  baseEl: HTMLElement,
  opts: any): Animation => {
  const isSheetStyle = (baseEl as HTMLIonModalElement).breakpoints!.length > 0;
  const currentBreakpoint = opts.currentBreakpoint as number | undefined;
  const lastHeight = currentBreakpoint !== undefined ? `${100 - (currentBreakpoint * 100)}%` : '0vh';
  const backdropMultiplyFactor = currentBreakpoint || 1;

  const baseAnimation = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  const wrapperEl = baseEl.querySelector('.modal-wrapper')!;

  backdropAnimation
    .addElement(baseEl.querySelector('ion-backdrop')!)
    .fromTo('opacity', `calc(var(--backdrop-opacity) *  ${backdropMultiplyFactor})`, 0.0);

  if (isSheetStyle) {
    wrapperAnimation
      .addElement(wrapperEl)
      .beforeStyles({ 'opacity': 1 })
      .fromTo('transform', `translateY(${lastHeight})`, 'translateY(100vh)');
  } else {
    wrapperAnimation
      .addElement(wrapperEl)
      .keyframes([
        { offset: 0, opacity: 0.99, transform: 'translateY(0px)' },
        { offset: 1, opacity: 0, transform: 'translateY(40px)' }
      ]);
  }

  return baseAnimation
    .addElement(baseEl)
    .easing('cubic-bezier(0.47,0,0.745,0.715)')
    .duration(200)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
