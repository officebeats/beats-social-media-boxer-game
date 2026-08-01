import { FighterStats } from '../engine/types';

export class FighterAnimationView {
  private container: HTMLElement;
  public fighter: FighterStats;
  public stance: 'idle' | 'jab' | 'heavy' | 'super' | 'flinch' | 'ko' | 'victory' = 'idle';
  private flipHorizontal: boolean;

  constructor(container: HTMLElement, fighter: FighterStats, flipHorizontal = false) {
    this.container = container;
    this.fighter = fighter;
    this.flipHorizontal = flipHorizontal;
    this.render();
  }

  public setStance(stance: 'idle' | 'jab' | 'heavy' | 'super' | 'flinch' | 'ko' | 'victory') {
    if (this.stance === stance) return;
    this.stance = stance;
    this.render();
  }

  public render() {
    this.container.className = `fighter-sprite ${this.getStanceClass()}`;
    this.container.style.transform = this.flipHorizontal ? 'scaleX(-1)' : 'scaleX(1)';

    const initials = this.fighter.name.split(' ').map(n => n[0]).join('');

    this.container.innerHTML = `
      <div style="
        width: 68px;
        height: 84px;
        background: radial-gradient(circle at top, ${this.fighter.themeColor} 0%, ${this.fighter.secondaryColor} 100%);
        border: 2px solid ${this.fighter.accentColor};
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px ${this.fighter.themeColor};
      ">
        <div style="font-family: 'Teko', sans-serif; font-size: 32px; font-weight: 700; color: #fff; line-height: 1;">${initials}</div>
        <div style="font-size: 9px; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 2px;">${this.getAnimationBadge()}</div>
      </div>
    `;
  }

  private getStanceClass(): string {
    switch (this.stance) {
      case 'jab': return 'anim-jab';
      case 'flinch': return 'anim-flinch';
      default: return 'anim-idle';
    }
  }

  private getAnimationBadge(): string {
    switch (this.stance) {
      case 'jab': return '⚡ JAB';
      case 'heavy': return '💥 HOOK';
      case 'super': return '🔥 SUPER';
      case 'flinch': return '⚡ HURT';
      case 'ko': return '💀 KO';
      case 'victory': return '👑 WIN';
      default: return 'STANCE';
    }
  }
}
