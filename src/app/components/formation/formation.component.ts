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
          class="player-chip"
          [class.goalkeeper]="slot.position.code === 'GK'"
          [style.left.%]="slot.position.x"
          [style.top.%]="slot.position.y"
        >
          <span class="chip-name" *ngIf="slot.player" [title]="slot.player.name">
            {{ formatName(slot.player.name) }}
          </span>
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

    /* ── Player chip — name only ─────────────────────────────────────── */
    .player-chip {
      position: absolute;
      transform: translate(-50%, -50%);
      min-width: 58px;
      max-width: 80px;
      padding: 0.32rem 0.55rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      z-index: 10;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      /* defaults overridden per team below */
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.3);
      box-shadow: 0 3px 12px rgba(0,0,0,0.35);
    }

    .blue-team .player-chip {
      background: linear-gradient(135deg, #5147ce, #3b29b8);
      border-color: rgba(108, 92, 231, 0.7);
      box-shadow: 0 3px 14px rgba(72,52,212,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .red-team .player-chip {
      background: linear-gradient(135deg, #d63845, #be2a1e);
      border-color: rgba(238, 90, 36, 0.7);
      box-shadow: 0 3px 14px rgba(214,48,49,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .player-chip.goalkeeper {
      background: linear-gradient(135deg, #f5c518, #e0a800);
      border-color: rgba(245, 197, 24, 0.8);
      box-shadow: 0 3px 14px rgba(224,168,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
    }

    .player-chip:hover {
      transform: translate(-50%, -50%) scale(1.18);
      z-index: 20;
    }

    .blue-team .player-chip:hover {
      box-shadow: 0 6px 22px rgba(108,92,231,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
    }

    .red-team .player-chip:hover {
      box-shadow: 0 6px 22px rgba(214,48,49,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
    }

    .player-chip.goalkeeper:hover {
      box-shadow: 0 6px 22px rgba(224,168,0,0.65), inset 0 1px 0 rgba(255,255,255,0.2);
    }

    .chip-name {
      font-size: 0.7rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      text-align: center;
      letter-spacing: 0.25px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.45);
      line-height: 1;
    }

    .player-chip.goalkeeper .chip-name {
      color: #1a1200;
      text-shadow: 0 1px 2px rgba(255,255,255,0.2);
    }

    /* Size adjustments for different squad sizes */
    .pitch.small-squad .player-chip {
      min-width: 70px;
      max-width: 92px;
      padding: 0.38rem 0.65rem;
    }
    .pitch.small-squad .chip-name {
      font-size: 0.8rem;
    }

    .pitch.medium-squad .player-chip {
      min-width: 62px;
      max-width: 84px;
      padding: 0.34rem 0.58rem;
    }
    .pitch.medium-squad .chip-name {
      font-size: 0.74rem;
    }

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

      .player-chip {
        min-width: 48px;
        max-width: 65px;
        padding: 0.28rem 0.44rem;
      }
      .chip-name { font-size: 0.62rem; }

      .pitch.small-squad .player-chip,
      .pitch.medium-squad .player-chip {
        min-width: 54px;
        max-width: 70px;
      }
      .pitch.small-squad .chip-name,
      .pitch.medium-squad .chip-name { font-size: 0.68rem; }
    }
  `]
})
export class FormationComponent {
  @Input() formation!: TeamFormation;
  @Input() teamColor: 'blue' | 'red' = 'blue';

  formatName(name: string): string {
    return name.trim();
  }
}
