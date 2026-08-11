import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { finalize, timeout } from 'rxjs/operators';
import { FormationComponent } from './components/formation/formation.component';
import { JoinComponent } from './components/join/join.component';

interface FormationSlot {
  position: {
    x: number;
    y: number;
    label: string;
    code: string;
  };
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

interface TeamSummary {
  name: string;
  displayName: string;
  color: 'red' | 'blue';
  captainName?: string;
  players: string[];
}

interface MatchSlot {
  title: string;
  matches: string[];
}

interface FormationCard {
  name: string;
  description: string;
  slots: FormationSlot[];
  bench: Array<{ name: string; rating?: number }>;
  color: 'blue' | 'red';
  label?: string;
}

interface UiStateResponse {
  phase: 'collecting' | 'formed' | 'insufficient';
  minPlayers: number;
  cutoffTimeLabel: string;
  canGenerateNow: boolean;
  message?: string;
  teams?: {
    mode?: 'two-team' | 'four-team';
    blueTeam: string[];
    redTeam: string[];
    groups?: TeamSummary[];
    captainsNote?: string;
    schedule?: MatchSlot[];
    generatedAt?: string | null;
  };
  formations?: {
    team1?: TeamFormation;
    team2?: TeamFormation;
    team3?: TeamFormation;
    team4?: TeamFormation;
    teams?: Array<{
      label?: string;
      color: 'red' | 'blue';
      formation: TeamFormation;
    }>;
  } | null;
}

interface GeneratedTeamsResponse {
  success: boolean;
  teams: {
    mode?: 'two-team' | 'four-team';
    team1: {
      players: Array<{ name: string }>;
    };
    team2: {
      players: Array<{ name: string }>;
    };
    teams?: Array<{
      name: string;
      displayName: string;
      color: 'red' | 'blue';
      captainName?: string;
      players: Array<{ name: string }>;
    }>;
    formations?: {
      team1?: TeamFormation;
      team2?: TeamFormation;
      team3?: TeamFormation;
      team4?: TeamFormation;
      teams?: Array<{
        label?: string;
        color: 'red' | 'blue';
        formation: TeamFormation;
      }>;
    } | null;
    generatedAt?: string;
    captainsNote?: string;
    schedule?: MatchSlot[];
  };
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, JoinComponent, FormationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  uiState: UiStateResponse | null = null;
  loadingState = false;
  generating = false;
  resetting = false;
  error: string | null = null;
  countdownText = '';
  countdownActive = false;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private wasFormed = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    setTimeout(() => this.loadUiState(), 0);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  get isCollecting(): boolean {
    return this.uiState?.phase === 'collecting';
  }

  get isInsufficient(): boolean {
    return this.uiState?.phase === 'insufficient';
  }

  get isFormed(): boolean {
    return this.uiState?.phase === 'formed';
  }

  get formationCards(): FormationCard[] {
    const formations = this.uiState?.formations;
    if (!formations) {
      return [];
    }

    if (formations.teams?.length) {
      return formations.teams.map((entry) => ({
        ...entry.formation,
        color: entry.color,
        label: entry.label
      }));
    }

    // Color assignment must match the team naming convention from teamBalancer:
    //   2-team mode:  team1 = Blue Team,   team2 = Red Team
    //   4-team mode:  team1 = Red Team A,  team2 = Red Team B,
    //                 team3 = Blue Team A, team4 = Blue Team B
    const isFourTeam = Boolean(formations.team3 || formations.team4);

    return [
      formations.team1 ? { ...formations.team1, color: isFourTeam ? 'red' as const : 'blue' as const } : null,
      formations.team2 ? { ...formations.team2, color: isFourTeam ? 'red' as const : 'red' as const } : null,
      formations.team3 ? { ...formations.team3, color: 'blue' as const } : null,
      formations.team4 ? { ...formations.team4, color: 'blue' as const } : null
    ].filter((card): card is FormationCard => !!card);
  }

  cleanTeamName(displayName: string): string {
    // Remove "Red Team A", "Blue Team B", etc. and replace with "Team"
    // E.g., "Shamseer's Red Team A" becomes "Shamseer's Team"
    return displayName.replace(/\s+(Red|Blue)\s+Team\s+[AB]$/, ' Team');
  }

  extractMatchColors(matchString: string): { color1: 'red' | 'blue'; color2: 'red' | 'blue' } | null {
    // Parse match string to extract team colors
    // Format: "Captain1's Red Team A vs Captain2's Blue Team B (Location)"
    const redMatch = /Red Team [AB]/i.test(matchString);
    const blueMatch = /Blue Team [AB]/i.test(matchString);

    if (redMatch && blueMatch) {
      return { color1: 'red', color2: 'blue' };
    }
    return null;
  }

  getFormattedMatchText(matchString: string): string {
    // Format: "Captain1's Red Team A vs Captain2's Blue Team B (Location)"
    // Returns: "Captain1's Team vs Captain2's Team (Location)"
    return matchString.replace(/\s+Red\s+Team\s+[AB]/gi, ' Team').replace(/\s+Blue\s+Team\s+[AB]/gi, ' Team');
  }

  private startCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this.updateCountdown();
    this.ngZone.runOutsideAngular(() => {
      this.countdownTimer = setInterval(() => {
        this.updateCountdown();
        this.cdr.markForCheck();
      }, 1000);
    });
  }

  private updateCountdown(): void {
    const gameStart = this.getGameStartTime();
    const now = new Date();
    const diffMs = gameStart.getTime() - now.getTime();

    if (diffMs <= 0) {
      this.countdownText = 'Game Started';
      this.countdownActive = false;
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    
    // Only show countdown when within 60 minutes
    if (totalSeconds > 3600) {
      this.countdownText = '';
      this.countdownActive = false;
      return;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.countdownActive = true;
  }

  private getGameStartTime(): Date {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const target = new Date(easternTime);
    target.setHours(20, 30, 0, 0);
    if (target.getTime() <= easternTime.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  loadUiState(): void {
    if (this.loadingState) {
      return;
    }

    this.loadingState = true;
    this.http.get<UiStateResponse>('/api/ui-state').pipe(
      timeout(7000),
      finalize(() => {
        this.loadingState = false;
      })
    ).subscribe({
      next: (state) => {
        setTimeout(() => {
          this.uiState = state;
          this.error = null;
          // Start countdown only when transitioning to formed state
          if (state.phase === 'formed' && !this.wasFormed) {
            this.wasFormed = true;
            this.startCountdown();
          }
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.error = 'Unable to load UI state. Please refresh.';
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  generateNow(): void {
    if (!this.uiState?.canGenerateNow || this.generating) {
      return;
    }

    this.generating = true;
    this.http.post<GeneratedTeamsResponse>('/api/teams/generate', {}).pipe(
      timeout(7000),
      finalize(() => {
        this.generating = false;
      })
    ).subscribe({
      next: (generated) => {
        const t = generated.teams;
        this.uiState = {
          phase: 'formed',
          minPlayers: this.uiState?.minPlayers ?? 12,
          cutoffTimeLabel: this.uiState?.cutoffTimeLabel ?? '7:30 PM EDT',
          canGenerateNow: this.uiState?.canGenerateNow ?? true,
          teams: {
            mode: t.mode,
            blueTeam: t.team1.players.map((player) => player.name),
            redTeam: t.team2.players.map((player) => player.name),
            groups: t.teams?.map((team) => ({
              name: team.name,
              displayName: team.displayName,
              color: team.color,
              captainName: team.captainName,
              players: team.players.map((player) => player.name)
            })),
            captainsNote: t.captainsNote,
            schedule: t.schedule,
            generatedAt: t.generatedAt || null
          },
          formations: t.formations || null
        };
        this.error = null;
        // Start countdown when transitioning to formed state
        if (!this.wasFormed) {
          this.wasFormed = true;
          this.startCountdown();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Unable to generate teams right now.';
        this.cdr.detectChanges();
      }
    });
  }

  resetDay(): void {
    if (!this.uiState?.canGenerateNow || this.resetting) {
      return;
    }
    this.resetting = true;
    this.wasFormed = false;
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.http.post('/api/reset', {}).pipe(
      timeout(7000),
      finalize(() => { this.resetting = false; })
    ).subscribe({
      next: () => { this.loadUiState(); },
      error: () => {
        this.error = 'Unable to reset state.';
        this.cdr.detectChanges();
      }
    });
  }
}
