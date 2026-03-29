import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface FieldPosition {
  x: number;
  y: number;
  label: string;
  code: string;
}

interface FormationSlot {
  position: FieldPosition;
  player?: {
    name: string;
    rating?: number;
  };
}

interface TeamFormation {
  name: string;
  description: string;
  slots: FormationSlot[];
  bench: Array<{
    name: string;
    rating?: number;
  }>;
}

@Component({
  selector: 'app-formation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="formation-container" [class.blue-team]="teamColor === 'blue'" [class.red-team]="teamColor === 'red'">
      <div class="formation-header">
        <div class="formation-badge">{{ formation.name }}</div>
        <p class="formation-desc">{{ formation.description }}</p>
      </div>

      <div class="pitch"
           [class.small-squad]="formation.slots.length <= 8"
           [class.medium-squad]="formation.slots.length > 8 && formation.slots.length <= 10">
        <div class="field-lines">
          <div class="center-line"></div>
          <div class="center-circle"></div>
          <div class="center-spot"></div>
          <div class="penalty-area top"></div>
          <div class="penalty-area bottom"></div>
          <div class="penalty-spot top"></div>
          <div class="penalty-spot bottom"></div>
          <div class="goal-area top"></div>
          <div class="goal-area bottom"></div>
          <div class="corner-arc top-left"></div>
          <div class="corner-arc top-right"></div>
          <div class="corner-arc bottom-left"></div>
          <div class="corner-arc bottom-right"></div>
        </div>

        <div
          *ngFor="let slot of formation.slots"
          class="player-node"
          [class.goalkeeper]="slot.position.code === 'GK'"
          [style.left.%]="slot.position.x"
          [style.top.%]="slot.position.y"
        >
          <svg class="jersey-svg" viewBox="0 0 50 55" xmlns="http://www.w3.org/2000/svg">
            <path class="jersey-body" d="M12,4 C12,2 38,2 38,4 L50,13 L40,24 L38,20 L38,52 L12,52 L12,20 L10,24 L0,13 Z"/>
            <path class="jersey-collar" d="M12,4 Q25,13 38,4" fill="none" stroke-linecap="round" stroke-width="2"/>
            <text class="jersey-pos-text" x="25" y="38" text-anchor="middle" dominant-baseline="middle">{{ slot.position.code }}</text>
          </svg>
          <div class="player-label" *ngIf="slot.player">
            <span class="player-name" [title]="slot.player.name">{{ formatName(slot.player.name) }}</span>
          </div>
        </div>
      </div>

      <div class="squad-info">
        <span class="count-badge">{{ formation.slots.length }}</span>
        <span class="count-label">Players</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .formation-container {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
      background: linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
      border-radius: 24px;
      padding: 1.25rem;
      border: 1px solid rgba(255,255,255,0.12);
      backdrop-filter: blur(24px);
      box-shadow:
        0 24px 48px -8px rgba(0,0,0,0.45),
        inset 0 1px 0 rgba(255,255,255,0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .formation-container:hover {
      transform: translateY(-3px);
      box-shadow:
        0 32px 56px -8px rgba(0,0,0,0.55),
        inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .formation-container.blue-team {
      border-color: rgba(108, 92, 231, 0.35);
      background: linear-gradient(160deg, rgba(72, 52, 212, 0.18) 0%, rgba(108, 92, 231, 0.07) 100%);
    }

    .formation-container.red-team {
      border-color: rgba(214, 48, 49, 0.35);
      background: linear-gradient(160deg, rgba(214, 48, 49, 0.18) 0%, rgba(238, 90, 36, 0.07) 100%);
    }

    /* ── Header ─────────────────────────────────────────────────────── */
    .formation-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .formation-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 1.35rem;
      padding: 0.55rem 1.2rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.18);
      margin-bottom: 0.45rem;
      letter-spacing: 1.5px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.35);
      background: linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.06));
    }

    .blue-team .formation-badge {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.65), rgba(72, 52, 212, 0.55));
      box-shadow: 0 6px 20px rgba(108, 92, 231, 0.35);
    }

    .red-team .formation-badge {
      background: linear-gradient(135deg, rgba(214, 48, 49, 0.65), rgba(238, 90, 36, 0.55));
      box-shadow: 0 6px 20px rgba(214, 48, 49, 0.35);
    }

    .formation-desc {
      color: rgba(255,255,255,0.5);
      font-size: 0.8rem;
      margin: 0;
      font-style: italic;
      letter-spacing: 0.2px;
    }

    /* ── Pitch ──────────────────────────────────────────────────────── */
    .pitch {
      position: relative;
      width: 100%;
      aspect-ratio: 0.65;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.22);
      box-shadow:
        inset 0 0 60px rgba(0,0,0,0.35),
        0 10px 36px rgba(0,0,0,0.4);
      /* Grass stripes */
      background:
        repeating-linear-gradient(
          180deg,
          rgba(255,255,255,0.025) 0px,
          rgba(255,255,255,0.025) 16px,
          transparent 16px,
          transparent 32px
        ),
        linear-gradient(180deg, #1b4d2e 0%, #236b3e 50%, #1b4d2e 100%);
    }

    .pitch.small-squad  { aspect-ratio: 0.75; }
    .pitch.medium-squad { aspect-ratio: 0.68; }

    .field-lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .center-line {
      position: absolute;
      top: 50%; left: 3%; right: 3%;
      height: 1.5px;
      background: rgba(255,255,255,0.45);
      transform: translateY(-50%);
    }

    .center-circle {
      position: absolute;
      top: 50%; left: 50%;
      width: 18%; aspect-ratio: 1;
      border: 1.5px solid rgba(255,255,255,0.45);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    .center-spot {
      position: absolute;
      top: 50%; left: 50%;
      width: 5px; height: 5px;
      background: rgba(255,255,255,0.65);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    .penalty-area {
      position: absolute;
      left: 50%;
      width: 44%; height: 14%;
      border: 1.5px solid rgba(255,255,255,0.45);
      border-bottom: none;
      transform: translateX(-50%);
    }
    .penalty-area.top    { top: 0;    border-top: none;    border-bottom: 1.5px solid rgba(255,255,255,0.45); }
    .penalty-area.bottom { bottom: 0; border-top: none;    border-bottom: none; }

    .penalty-spot {
      position: absolute;
      left: 50%;
      width: 5px; height: 5px;
      background: rgba(255,255,255,0.65);
      border-radius: 50%;
      transform: translateX(-50%);
    }
    .penalty-spot.top    { top: 10%; }
    .penalty-spot.bottom { bottom: 10%; }

    .goal-area {
      position: absolute;
      left: 50%;
      width: 22%; height: 7%;
      border: 1.5px solid rgba(255,255,255,0.45);
      border-bottom: none;
      transform: translateX(-50%);
    }
    .goal-area.top    { top: 0;    border-top: none;    border-bottom: 1.5px solid rgba(255,255,255,0.45); }
    .goal-area.bottom { bottom: 0; border-top: none;    border-bottom: none; }

    .corner-arc {
      position: absolute;
      width: 4%; aspect-ratio: 1;
      border: 1.5px solid rgba(255,255,255,0.35);
      border-radius: 50%;
    }
    .corner-arc.top-left    { top: -2%;    left: -2%;   border-top: none;    border-left: none; }
    .corner-arc.top-right   { top: -2%;    right: -2%;  border-top: none;    border-right: none; }
    .corner-arc.bottom-left { bottom: -2%; left: -2%;   border-bottom: none; border-left: none; }
    .corner-arc.bottom-right{ bottom: -2%; right: -2%;  border-bottom: none; border-right: none; }

    /* ── Player node — jersey + label ─────────────────────────────── */
    .player-node {
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      z-index: 10;
      cursor: default;
      transition: transform 0.2s ease;
    }

    .player-node:hover {
      transform: translate(-50%, -50%) scale(1.15);
      z-index: 20;
    }

    /* Jersey SVG */
    .jersey-svg {
      width: 56px;
      height: auto;
      display: block;
      flex-shrink: 0;
    }

    .jersey-body {
      stroke: rgba(255,255,255,0.4);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }

    /* Blue team: navy */
    .blue-team .jersey-body {
      fill: #1a2f6e;
    }
    .blue-team .player-node:hover .jersey-svg {
      filter: drop-shadow(0 0 7px rgba(90,110,220,0.75)) drop-shadow(0 3px 8px rgba(0,0,0,0.5));
    }
    .blue-team .jersey-svg {
      filter: drop-shadow(0 0 5px rgba(90,110,220,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.45));
    }

    /* Red team: maroon */
    .red-team .jersey-body {
      fill: #7b1212;
    }
    .red-team .player-node:hover .jersey-svg {
      filter: drop-shadow(0 0 7px rgba(190,30,30,0.75)) drop-shadow(0 3px 8px rgba(0,0,0,0.5));
    }
    .red-team .jersey-svg {
      filter: drop-shadow(0 0 5px rgba(190,30,30,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.45));
    }

    /* Goalkeeper: amber */
    .player-node.goalkeeper .jersey-body {
      fill: #e8a800;
      stroke: rgba(255,255,255,0.5);
    }
    .player-node.goalkeeper .jersey-svg {
      filter: drop-shadow(0 0 5px rgba(230,170,0,0.6)) drop-shadow(0 3px 6px rgba(0,0,0,0.45));
    }
    .player-node.goalkeeper:hover .jersey-svg {
      filter: drop-shadow(0 0 8px rgba(230,170,0,0.8)) drop-shadow(0 3px 8px rgba(0,0,0,0.5));
    }

    /* Jersey collar & position text */
    .jersey-collar {
      stroke: rgba(255,255,255,0.6);
    }
    .jersey-pos-text {
      fill: rgba(255,255,255,0.95);
      font-size: 9px;
      font-weight: 800;
      font-family: inherit;
      letter-spacing: 0.5px;
    }
    .player-node.goalkeeper .jersey-pos-text {
      fill: rgba(20,10,0,0.85);
    }

    /* Player label below jersey — name only */
    .player-label {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.93);
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      line-height: 1;
    }

    .player-name {
      font-size: 0.6rem;
      font-weight: 800;
      color: #111827;
      white-space: nowrap;
      text-align: center;
      letter-spacing: 0.3px;
      line-height: 1.3;
    }

    /* Size adjustments for squad sizes */
    .pitch.small-squad .jersey-svg   { width: 64px; }
    .pitch.small-squad .player-name  { font-size: 0.68rem; }

    .pitch.medium-squad .jersey-svg   { width: 60px; }
    .pitch.medium-squad .player-name  { font-size: 0.62rem; }

    /* ── Squad count footer ─────────────────────────────────────────── */
    .squad-info {
      margin-top: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .count-label {
      color: rgba(255,255,255,0.5);
      font-size: 0.78rem;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .formation-container { padding: 0.9rem; }

      .formation-badge {
        font-size: 1.1rem;
        padding: 0.45rem 0.9rem;
      }

      .jersey-svg   { width: 46px; }
      .player-name  { font-size: 0.52rem; }

      .pitch.small-squad .jersey-svg   { width: 54px; }
      .pitch.small-squad .player-name  { font-size: 0.58rem; }

      .pitch.medium-squad .jersey-svg   { width: 50px; }
      .pitch.medium-squad .player-name  { font-size: 0.54rem; }
    }
  `]
})
export class FormationComponent {
  @Input() formation!: TeamFormation;
  @Input() teamColor: 'blue' | 'red' = 'blue';

  formatName(name: string): string {
    return name.trim().toUpperCase();
  }
}
