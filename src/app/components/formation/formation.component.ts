import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
      
      <div class="pitch">
        <!-- Field markings -->
        <div class="field-lines">
          <div class="center-line"></div>
          <div class="center-circle"></div>
          <div class="penalty-area top"></div>
          <div class="penalty-area bottom"></div>
          <div class="goal-area top"></div>
          <div class="goal-area bottom"></div>
        </div>
        
        <!-- Players positioned on field -->
        <div 
          *ngFor="let slot of formation.slots; let i = index"
          class="player-node"
          [class.has-player]="slot.player"
          [style.left.%]="slot.position.x"
          [style.top.%]="slot.position.y"
          [attr.data-position]="slot.position.code"
        >
          <div class="player-jersey" *ngIf="slot.player">
            <span class="jersey-number">{{ getJerseyNumber(slot.position.code, i) }}</span>
          </div>
          <div class="player-initials" *ngIf="slot.player">{{ getInitials(slot.player.name) }}</div>
          <div class="position-label">{{ slot.position.code }}</div>
          <div class="player-tooltip" *ngIf="slot.player">
            <strong>{{ slot.player.name }}</strong>
            <span>{{ slot.position.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- Bench section -->
      <div class="bench-section" *ngIf="formation.bench.length > 0">
        <div class="bench-header">
          <span class="bench-icon">🪑</span>
          <span>Bench ({{ formation.bench.length }})</span>
        </div>
        <div class="bench-players">
          <span 
            *ngFor="let player of formation.bench" 
            class="bench-player"
            [title]="player.name"
          >
            {{ player.name }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .formation-container {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
    }

    .formation-container.blue-team {
      border-color: rgba(108, 92, 231, 0.3);
      background: linear-gradient(145deg, rgba(72, 52, 212, 0.1), rgba(108, 92, 231, 0.05));
    }

    .formation-container.red-team {
      border-color: rgba(238, 90, 36, 0.3);
      background: linear-gradient(145deg, rgba(214, 48, 49, 0.1), rgba(238, 90, 36, 0.05));
    }

    .formation-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .formation-badge {
      display: inline-block;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
      color: #fff;
      font-weight: 700;
      font-size: 1.2rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      margin-bottom: 0.5rem;
    }

    .blue-team .formation-badge {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.5), rgba(72, 52, 212, 0.4));
    }

    .red-team .formation-badge {
      background: linear-gradient(135deg, rgba(214, 48, 49, 0.5), rgba(238, 90, 36, 0.4));
    }

    .formation-desc {
      color: #b0b0b0;
      font-size: 0.85rem;
      margin: 0;
      font-style: italic;
    }

    .pitch {
      position: relative;
      width: 100%;
      aspect-ratio: 0.65;
      background: linear-gradient(180deg, 
        #2d5016 0%, 
        #3d6b1f 50%, 
        #2d5016 100%
      );
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 
        inset 0 0 60px rgba(0,0,0,0.3),
        0 8px 24px rgba(0,0,0,0.4);
      border: 3px solid rgba(255,255,255,0.3);
    }

    /* Field markings */
    .field-lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .center-line {
      position: absolute;
      top: 50%;
      left: 5%;
      right: 5%;
      height: 2px;
      background: rgba(255,255,255,0.4);
      transform: translateY(-50%);
    }

    .center-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20%;
      height: 15%;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    .penalty-area {
      position: absolute;
      left: 50%;
      width: 40%;
      height: 12%;
      border: 2px solid rgba(255,255,255,0.4);
      border-bottom: none;
      transform: translateX(-50%);
    }

    .penalty-area.top {
      top: 0;
    }

    .penalty-area.bottom {
      bottom: 0;
      border-top: none;
      border-bottom: 2px solid rgba(255,255,255,0.4);
    }

    .goal-area {
      position: absolute;
      left: 50%;
      width: 20%;
      height: 6%;
      border: 2px solid rgba(255,255,255,0.4);
      border-bottom: none;
      transform: translateX(-50%);
    }

    .goal-area.top {
      top: 0;
    }

    .goal-area.bottom {
      bottom: 0;
      border-top: none;
      border-bottom: 2px solid rgba(255,255,255,0.4);
    }

    /* Player nodes */
    .player-node {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
    }

    .player-node:hover {
      transform: translate(-50%, -50%) scale(1.1);
      z-index: 20;
    }

    .player-jersey {
      width: 36px;
      height: 40px;
      background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
      border-radius: 8px 8px 4px 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid rgba(255,255,255,0.5);
    }

    .blue-team .player-jersey {
      background: linear-gradient(145deg, #4834d4, #6c5ce7);
      border-color: rgba(255,255,255,0.3);
    }

    .red-team .player-jersey {
      background: linear-gradient(145deg, #d63031, #ee5a24);
      border-color: rgba(255,255,255,0.3);
    }

    .jersey-number {
      font-size: 0.9rem;
      font-weight: 700;
      color: #333;
    }

    .blue-team .jersey-number,
    .red-team .jersey-number {
      color: #fff;
    }

    .player-initials {
      font-size: 0.65rem;
      font-weight: 600;
      color: #fff;
      text-align: center;
      margin-top: 2px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      max-width: 50px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .position-label {
      font-size: 0.55rem;
      color: rgba(255,255,255,0.7);
      margin-top: 1px;
      font-weight: 500;
    }

    /* Tooltip */
    .player-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: #fff;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 30;
    }

    .player-node:hover .player-tooltip {
      opacity: 1;
      visibility: visible;
      bottom: calc(100% + 8px);
    }

    .player-tooltip strong {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.2rem;
    }

    .player-tooltip span {
      color: #aaa;
      font-size: 0.75rem;
    }

    /* Bench section */
    .bench-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .bench-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #888;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .bench-icon {
      font-size: 1rem;
    }

    .bench-players {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .bench-player {
      background: rgba(255,255,255,0.1);
      color: #fff;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.2s ease;
      cursor: default;
    }

    .bench-player:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }

    /* Position-specific styling */
    .player-node[data-position="GK"] .player-jersey {
      background: linear-gradient(145deg, #f1c40f, #f39c12);
    }

    .player-node[data-position="GK"] .jersey-number {
      color: #333;
    }

    @media (max-width: 480px) {
      .formation-container {
        padding: 1rem;
      }

      .player-node {
        width: 32px;
        height: 50px;
      }

      .player-jersey {
        width: 28px;
        height: 32px;
      }

      .jersey-number {
        font-size: 0.75rem;
      }

      .player-initials {
        font-size: 0.55rem;
      }

      .position-label {
        font-size: 0.5rem;
      }
    }
  `]
})
export class FormationComponent {
  @Input() formation!: TeamFormation;
  @Input() teamColor: 'blue' | 'red' = 'blue';

  private positionNumbers: Record<string, number[]> = {
    'GK': [1],
    'LB': [3], 'LWB': [3, 11],
    'CB': [4, 5, 6],
    'RB': [2], 'RWB': [2, 7],
    'CDM': [5, 6, 8],
    'CM': [6, 8, 10],
    'LM': [11, 14],
    'RM': [7, 10],
    'CAM': [10, 8],
    'LW': [11, 14],
    'RW': [7, 10],
    'ST': [9, 10, 11],
  };

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getJerseyNumber(positionCode: string, index: number): number {
    const numbers = this.positionNumbers[positionCode] || [index + 1];
    // Use index to cycle through available numbers for this position
    return numbers[index % numbers.length] || index + 1;
  }
}
